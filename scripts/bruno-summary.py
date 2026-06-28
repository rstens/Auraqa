#!/usr/bin/env python3
"""
Render a markdown summary of a Bruno CLI run from its JSON reporter
output.

Reads `bruno-report.json` by default and writes a GitHub-flavored
markdown block to stdout. Designed to be appended to
`$GITHUB_STEP_SUMMARY` in CI:

    python3 scripts/bruno-summary.py >> "$GITHUB_STEP_SUMMARY"

Always emits a section even when:
- The JSON file is missing (Bruno crashed before any request fired)
- No requests ran
- All requests passed (the API surface is small enough that the full
  list is worth showing on every run)

The script never raises — it would fail an `if: always()` summary step
that's there precisely to surface results when the upstream test step
failed.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

DEFAULT_INPUT = Path("bruno-report.json")

# Map Bruno's per-test/per-request status to an emoji for the bullet list.
STATUS_EMOJI = {
    "pass": "✅",
    "passed": "✅",
    "fail": "❌",
    "failed": "❌",
    "error": "❌",
    "skipped": "⏭",
    "skip": "⏭",
}


def emoji_for(status: str) -> str:
    return STATUS_EMOJI.get((status or "").lower(), "❓")


def count_assertions(result: dict) -> tuple[int, int]:
    """Returns (passed, failed) across testResults + assertionResults blocks."""
    passed = failed = 0
    for key in ("testResults", "assertionResults", "tests", "assertions"):
        items = result.get(key) or []
        for it in items:
            status = (it.get("status") or "").lower()
            if status in ("pass", "passed"):
                passed += 1
            elif status in ("fail", "failed", "error"):
                failed += 1
    return passed, failed


def request_status(result: dict, failed_assertions: int) -> str:
    """Roll a per-request status up from assertion results + transport errors."""
    if result.get("error"):
        return "fail"
    if failed_assertions:
        return "fail"
    explicit = (result.get("status") or "").lower()
    if explicit:
        return explicit
    return "pass"


def normalize(data: object) -> dict | None:
    """Collapse Bruno's reporter shapes to a single ``{summary?, results}`` dict.

    The JSON reporter has shipped two top-level shapes across versions:
    - an object ``{"summary": {...}, "results": [...]}`` (older @usebruno/cli)
    - a bare array of per-request result objects (newer @usebruno/cli) — this
      is what tripped the summary step with
      ``'list' object has no attribute 'get'``.

    Some versions further wrap each run as an *iteration* object that carries
    its own ``results`` array; flatten those too so ``render`` can stay simple.
    """
    if data is None or isinstance(data, dict):
        return data
    if isinstance(data, list):
        flat: list = []
        for item in data:
            if isinstance(item, dict) and isinstance(item.get("results"), list):
                flat.extend(item["results"])
            else:
                flat.append(item)
        return {"results": flat}
    # A scalar (number/string/bool) is not a report we can read.
    return {"results": []}


def render(data: dict | None) -> str:
    out: list[str] = ["## Bruno API Tests", ""]

    if data is None:
        out.append(
            "_No `bruno-report.json` produced — the run likely crashed before "
            "any request fired. Check the **Run Bruno API tests** step above._"
        )
        return "\n".join(out) + "\n"

    results = data.get("results") or []
    if not results and "summary" not in data:
        out.append("_No requests were executed._")
        return "\n".join(out) + "\n"

    # Totals. Prefer Bruno's own summary block when it's present, fall back
    # to walking the results array.
    summary = data.get("summary") or {}
    if summary:
        total_req = summary.get("totalRequests") or len(results)
        passed_req = summary.get("passedRequests") or 0
        failed_req = summary.get("failedRequests") or 0
        total_assert = summary.get("totalAssertions") or 0
        passed_assert = summary.get("passedAssertions") or 0
        failed_assert = summary.get("failedAssertions") or 0
    else:
        passed_req = failed_req = 0
        total_assert = passed_assert = failed_assert = 0
        for r in results:
            p, f = count_assertions(r)
            total_assert += p + f
            passed_assert += p
            failed_assert += f
            if request_status(r, f) == "fail":
                failed_req += 1
            else:
                passed_req += 1
        total_req = len(results)

    out.append(
        f"**Requests:** {total_req} — ✅ {passed_req} passed, ❌ {failed_req} failed"
    )
    if total_assert:
        out.append(
            f"**Assertions:** {total_assert} — ✅ {passed_assert} passed, "
            f"❌ {failed_assert} failed"
        )
    out.append("")

    # Per-request rows. Group by folder (everything before the last `/`)
    # so the directory structure reads like the suite layout.
    by_folder: dict[str, list[tuple[str, str, str, int, int, int]]] = {}
    for r in results:
        # Bruno has used `test.filename`, `request.name`, `runtime`, etc.
        # across versions — read defensively.
        filename = (
            (r.get("test") or {}).get("filename")
            or r.get("filename")
            or (r.get("request") or {}).get("name")
            or "(unknown)"
        )
        # Normalise path so display lines up regardless of cwd.
        if filename.startswith("tests/api/"):
            display = filename[len("tests/api/") :]
        else:
            display = filename
        folder, _, basename = display.rpartition("/")
        if not folder:
            folder = "(root)"

        method = ((r.get("request") or {}).get("method") or "").upper()
        url = (r.get("request") or {}).get("url") or ""
        status_code = (r.get("response") or {}).get("status")
        duration_ms = r.get("runtime") or (r.get("response") or {}).get("responseTime") or 0
        try:
            duration_ms = int(round(float(duration_ms)))
        except (TypeError, ValueError):
            duration_ms = 0

        passed, failed = count_assertions(r)
        verdict = emoji_for(request_status(r, failed))
        line_label = f"{method} {url}".strip() if (method or url) else basename
        by_folder.setdefault(folder, []).append(
            (basename, line_label, str(status_code or "—"), passed, failed, duration_ms)
        )

    for folder in sorted(by_folder):
        out.append(f"### `tests/api/{folder}/`")
        out.append("")
        for basename, label, status, passed, failed, duration in by_folder[folder]:
            verdict = "❌" if failed else "✅"
            assertion_chip = (
                f"{passed}/{passed + failed} asserts" if (passed + failed) else "no asserts"
            )
            duration_chip = f" _({duration}ms)_" if duration else ""
            out.append(
                f"- {verdict} `{basename}` → {label} → **{status}** "
                f"({assertion_chip}){duration_chip}"
            )
        out.append("")

    out.append(
        "_Full HTML report uploaded as the **bruno-api-report** artifact (above)._"
    )
    return "\n".join(out) + "\n"


def main(argv: list[str]) -> int:
    path = Path(argv[1]) if len(argv) > 1 else DEFAULT_INPUT
    data: dict | None
    try:
        with path.open() as f:
            data = json.load(f)
    except FileNotFoundError:
        data = None
    except json.JSONDecodeError as e:
        sys.stdout.write("## Bruno API Tests\n\n")
        sys.stdout.write(f"_Could not parse `{path}` as JSON: {e}._\n")
        return 0

    try:
        sys.stdout.write(render(normalize(data)))
    except Exception as e:  # noqa: BLE001 — keep `if: always()` summary safe
        sys.stdout.write("## Bruno API Tests\n\n")
        sys.stdout.write(
            f"_Failed to render Bruno summary: {type(e).__name__}: {e}._\n"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

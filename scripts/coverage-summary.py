#!/usr/bin/env python3
"""
Render a markdown coverage summary from vitest's json-summary output.

Reads `coverage/coverage-summary.json` by default and writes a
GitHub-flavored markdown block to stdout — paired with the per-file %
table and the overall totals.

Designed to be appended to `$GITHUB_STEP_SUMMARY` in CI:

    python3 scripts/coverage-summary.py >> "$GITHUB_STEP_SUMMARY"

Always emits a section even when:
- The JSON file is missing (vitest crashed before writing coverage)
- The `total` key is malformed

The script never raises — it would fail an `if: always()` summary step
that's there precisely to surface results when the upstream test step
failed.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

DEFAULT_INPUT = Path("coverage/coverage-summary.json")

# Render thresholds match vitest.config.ts so the markdown table flags
# what would have failed the gate, even when CI returned green.
THRESHOLDS = {"lines": 90, "statements": 90, "functions": 90, "branches": 85}


def emoji_for(pct: float, key: str) -> str:
    threshold = THRESHOLDS.get(key, 0)
    if pct >= threshold:
        return "✅"
    if pct >= threshold - 10:
        return "⚠"
    return "❌"


def fmt_pct(metric: dict) -> str:
    pct = metric.get("pct")
    covered = metric.get("covered", 0)
    total = metric.get("total", 0)
    if pct is None or total == 0:
        return "—"
    return f"{pct:.1f}% ({covered}/{total})"


def render(data: dict | None) -> str:
    out: list[str] = ["## Vitest Coverage", ""]

    if data is None:
        out.append(
            "_No `coverage/coverage-summary.json` produced — vitest probably "
            "crashed before writing the report. Check the **Unit tests** step "
            "above._"
        )
        return "\n".join(out) + "\n"

    total = data.get("total") or {}
    if not total:
        out.append("_`coverage-summary.json` was empty or had no `total` block._")
        return "\n".join(out) + "\n"

    # Headline line with emoji per metric.
    headline = []
    for key in ("lines", "statements", "functions", "branches"):
        m = total.get(key) or {}
        pct = m.get("pct")
        if pct is None:
            continue
        headline.append(f"{emoji_for(pct, key)} **{key.capitalize()}** {fmt_pct(m)}")
    if headline:
        out.append(" · ".join(headline))
        out.append("")

    # Per-file breakdown — skip the `total` row, sort by % lines descending so
    # the worst-covered files are easy to spot at the bottom.
    files = []
    for path, metrics in data.items():
        if path == "total":
            continue
        if not isinstance(metrics, dict):
            continue
        files.append((path, metrics))

    if files:
        # Trim the repo prefix so the path column stays readable on narrow
        # pages.
        cwd = os.getcwd().rstrip("/") + "/"
        out.append("| File | Lines | Statements | Functions | Branches |")
        out.append("| --- | ---: | ---: | ---: | ---: |")
        for path, metrics in sorted(
            files, key=lambda p: (p[1].get("lines", {}).get("pct") or 0)
        ):
            display = path[len(cwd) :] if path.startswith(cwd) else path
            row = [
                f"`{display}`",
                fmt_pct(metrics.get("lines") or {}),
                fmt_pct(metrics.get("statements") or {}),
                fmt_pct(metrics.get("functions") or {}),
                fmt_pct(metrics.get("branches") or {}),
            ]
            out.append("| " + " | ".join(row) + " |")
        out.append("")

    out.append(
        "_Full HTML report uploaded as the **coverage-html** artifact (above). "
        "Coverage is also published to "
        "[Codecov](https://codecov.io/gh/rstens/Auraqa) and "
        "[SonarCloud](https://sonarcloud.io/summary/new_code?id=rstens_Auraqa)._"
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
        sys.stdout.write("## Vitest Coverage\n\n")
        sys.stdout.write(f"_Could not parse `{path}` as JSON: {e}._\n")
        return 0

    try:
        sys.stdout.write(render(data))
    except Exception as e:  # noqa: BLE001 — keep `if: always()` summary safe
        sys.stdout.write("## Vitest Coverage\n\n")
        sys.stdout.write(
            f"_Failed to render coverage summary: {type(e).__name__}: {e}._\n"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

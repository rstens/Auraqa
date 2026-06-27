#!/usr/bin/env python3
"""
Render a per-test markdown summary from Playwright's JSON reporter output.

Reads `playwright-results.json` from the repo root by default and writes a
GitHub-flavored markdown block to stdout. Designed to be appended to
`$GITHUB_STEP_SUMMARY` in CI:

    python3 scripts/playwright-summary.py >> "$GITHUB_STEP_SUMMARY"

Always emits a section even when:
- The JSON file is missing (Playwright crashed before any test ran)
- No tests ran (empty suites)
- All tests passed (the user explicitly asked for a list every run)

The script does not replace the existing HTML-report-link summary; it adds
a per-test list alongside it.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Status name → (emoji, label) for the bullet list and totals.
STATUS_EMOJI = {
    "passed": ("✅", "passed"),
    "failed": ("❌", "failed"),
    "timedOut": ("⏱", "timed out"),
    "skipped": ("⏭", "skipped"),
    "interrupted": ("⚠", "interrupted"),
}

DEFAULT_INPUT = Path("playwright-results.json")


def walk_suites(suites, file_path: str = ""):
    """
    Yield (file, project, title, status, duration_ms) for every test run.

    Playwright's JSON shape: top-level `suites[]` may contain nested `suites[]`
    (one per spec file → describe block). Each spec has `tests[]`, one entry
    per project (chromium, firefox, …), and each test has `results[]` (one
    per attempt — the last one is the verdict).
    """
    for suite in suites:
        sub_file = suite.get("file") or file_path
        for spec in suite.get("specs", []) or []:
            title = spec.get("title", "<unnamed>")
            for test in spec.get("tests", []) or []:
                project = test.get("projectName", "")
                results = test.get("results", []) or []
                if not results:
                    yield sub_file, project, title, "unknown", 0
                    continue
                final = results[-1]
                status = final.get("status", "unknown")
                duration = int(final.get("duration", 0))
                yield sub_file, project, title, status, duration
        # Nested suites (describe blocks).
        yield from walk_suites(suite.get("suites", []) or [], sub_file)


def render(data: dict | None) -> str:
    out: list[str] = []
    out.append("## Playwright E2E — Per-test summary")
    out.append("")

    if data is None:
        out.append(
            "_No `playwright-results.json` produced — the run likely crashed before "
            "any test executed. Check the **Run E2E smoke tests** step logs above._"
        )
        return "\n".join(out) + "\n"

    rows = list(walk_suites(data.get("suites", []) or []))
    if not rows:
        out.append("_No tests were collected._")
        return "\n".join(out) + "\n"

    counts: dict[str, int] = {}
    for *_, status, _ in rows:
        counts[status] = counts.get(status, 0) + 1
    total = len(rows)

    # Totals line — formatted like vitest output.
    totals = []
    for key, (emoji, label) in STATUS_EMOJI.items():
        n = counts.get(key, 0)
        if n:
            totals.append(f"{emoji} **{n}** {label}")
    # Unknown / unrecognized statuses (defensive).
    for k, n in counts.items():
        if k not in STATUS_EMOJI:
            totals.append(f"❓ **{n}** {k}")
    out.append(f"**Total:** {total} test{'s' if total != 1 else ''} — " + ", ".join(totals))
    out.append("")

    # Group by file → cleaner reading on big suites.
    by_file: dict[str, list[tuple[str, str, str, int]]] = {}
    for file_path, project, title, status, duration in rows:
        by_file.setdefault(file_path or "(no file)", []).append(
            (project, title, status, duration)
        )

    for file_path in sorted(by_file):
        out.append(f"### `{file_path}`")
        out.append("")
        for project, title, status, duration in by_file[file_path]:
            emoji, _ = STATUS_EMOJI.get(status, ("❓", status))
            project_prefix = f"[{project}] " if project else ""
            duration_suffix = f" _({duration}ms)_" if duration else ""
            out.append(f"- {emoji} {project_prefix}{title}{duration_suffix}")
        out.append("")

    return "\n".join(out) + "\n"


def main(argv: list[str]) -> int:
    path = Path(argv[1]) if len(argv) > 1 else DEFAULT_INPUT
    try:
        with path.open() as f:
            data = json.load(f)
    except FileNotFoundError:
        sys.stdout.write(render(None))
        return 0
    except json.JSONDecodeError as e:
        sys.stdout.write("## Playwright E2E — Per-test summary\n\n")
        sys.stdout.write(
            f"_Could not parse `{path}` as JSON: {e}. The Playwright run may have "
            "crashed mid-write._\n"
        )
        return 0

    sys.stdout.write(render(data))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

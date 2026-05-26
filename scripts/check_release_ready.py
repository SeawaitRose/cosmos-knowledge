#!/usr/bin/env python3
"""Run public-release readiness checks for the knowledge project."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEMO_GRAPH = ROOT / "examples" / "demo-knowledge" / "data" / "graph.json"
DEMO_KNOWLEDGE = ROOT / "examples" / "demo-knowledge"
DEMO_PACKAGE = ROOT / "examples" / "demo-knowledge" / "spec" / "knowledge-package-example.json"
CURRENT_GRAPH = ROOT / "knowledge" / "data" / "graph.json"
GRAPH_VALIDATOR = ROOT / "skills" / "personal-knowledge-growth" / "scripts" / "validate_graph.py"
PACKAGE_VALIDATOR = ROOT / "scripts" / "validate_knowledge_package.py"

PRIVATE_PATTERNS = [
    "ren-zhi",
    "seawaitrose",
    "罗斯福",
    "自私的基因",
    "硅基",
    "毛泽东",
    "实践论",
    "矛盾论",
    "高数",
]

SCAN_PATHS = [
    "examples",
    "knowledge",
    "site",
    "scripts",
    "skills/personal-knowledge-growth/SKILL.md",
    "README.md",
]


def run(args: list[str]) -> None:
    result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def snapshot_reports() -> dict[str, int]:
    report_dir = ROOT / "knowledge" / "reports"
    if not report_dir.exists():
        return {}
    return {str(path.relative_to(ROOT)): int(path.stat().st_mtime) for path in sorted(report_dir.glob("*")) if path.is_file()}


def check_dry_run() -> None:
    temp_knowledge = False
    knowledge_dir = ROOT / "knowledge"
    if not knowledge_dir.exists():
        shutil.copytree(DEMO_KNOWLEDGE, knowledge_dir)
        temp_knowledge = True
    try:
        before = snapshot_reports()
        result = subprocess.run(
            [sys.executable, "-B", "scripts/send_lark_weekly_growth_report.py", "--dry-run", "--json"],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
        if result.returncode != 0:
            if result.stdout:
                print(result.stdout.rstrip())
            if result.stderr:
                print(result.stderr.rstrip(), file=sys.stderr)
            raise SystemExit(result.returncode)
        after = snapshot_reports()
        if before != after:
            raise SystemExit("[FAIL] send_lark_weekly_growth_report.py --dry-run modified reports")
        print("[OK] Lark weekly dry-run did not modify reports")
    finally:
        if temp_knowledge:
            shutil.rmtree(knowledge_dir)


def check_privacy_scan(extra_patterns: list[str]) -> None:
    patterns = [*PRIVATE_PATTERNS, *extra_patterns]
    hits: list[str] = []
    files: list[Path] = []
    for item in SCAN_PATHS:
        path = ROOT / item
        if path.is_file():
            files.append(path)
        elif path.is_dir():
            files.extend([candidate for candidate in path.rglob("*") if candidate.is_file() and candidate.suffix not in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf"}])
    for path in files:
        if path == Path(__file__).resolve():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for pattern in patterns:
            if pattern and pattern in text:
                hits.append(f"{path.relative_to(ROOT)}: contains {pattern}")
    if hits:
        print("\n".join(hits), file=sys.stderr)
        raise SystemExit("[FAIL] Privacy scan found release-sensitive patterns")
    print("[OK] Privacy scan passed")


def main() -> int:
    parser = argparse.ArgumentParser(description="Check whether the project is ready for a public GitHub release.")
    parser.add_argument("--pattern", action="append", default=[], help="Additional private pattern to scan for.")
    args = parser.parse_args()

    run([sys.executable, "-B", str(GRAPH_VALIDATOR), str(DEMO_GRAPH)])
    if CURRENT_GRAPH.exists():
        run([sys.executable, "-B", str(GRAPH_VALIDATOR), str(CURRENT_GRAPH)])
    run([sys.executable, "-B", str(PACKAGE_VALIDATOR), str(DEMO_PACKAGE), "--graph", str(DEMO_GRAPH)])
    check_dry_run()
    check_privacy_scan(args.pattern)
    print("[OK] Release readiness checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

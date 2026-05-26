#!/usr/bin/env python3
"""Merge a validated Knowledge Package into the local personal knowledge base."""

from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
import sys
from datetime import date
from pathlib import Path
from typing import Any

import validate_knowledge_package


ROOT = Path(__file__).resolve().parents[1]
GRAPH_PATH = ROOT / "knowledge" / "data" / "graph.json"
LIFECYCLE_PATH = ROOT / "knowledge" / "data" / "cosmos-lifecycle.json"
GRAPH_VALIDATOR_PATH = ROOT / "skills" / "personal-knowledge-growth" / "scripts" / "validate_graph.py"


def fail(message: str) -> None:
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"File not found: {path}")
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {path}: {exc}")
    if not isinstance(data, dict):
        fail("Knowledge Package must be a JSON object")
    return data


def safe_target(relative_path: str) -> Path:
    if not validate_knowledge_package.is_safe_knowledge_path(relative_path):
        fail(f"Unsafe knowledge path: {relative_path}")
    target = (ROOT / relative_path).resolve()
    if ROOT not in target.parents:
        fail(f"Path escapes project root: {relative_path}")
    return target


def import_graph_validator():
    spec = importlib.util.spec_from_file_location("knowledge_graph_validator", GRAPH_VALIDATOR_PATH)
    if spec is None or spec.loader is None:
        fail(f"Cannot load graph validator: {GRAPH_VALIDATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_package(package: dict[str, Any]) -> None:
    current_node_ids, current_edge_ids = validate_knowledge_package.load_current_graph_ids(GRAPH_PATH)
    errors, warnings = validate_knowledge_package.validate_package(package, current_node_ids, current_edge_ids)
    for warning in warnings:
        print(f"[WARN] {warning}")
    if errors:
        for error in errors:
            print(f"[FAIL] {error}", file=sys.stderr)
        raise SystemExit(1)


def merged_graph(package: dict[str, Any]) -> dict[str, Any]:
    graph = load_json(GRAPH_PATH)
    patch = package.get("graph_patch") or {}
    new_nodes = list(patch.get("nodes") or [])
    new_edges = list(patch.get("edges") or [])

    node_ids = {node.get("id") for node in graph.get("nodes", []) if isinstance(node, dict)}
    edge_ids = {edge.get("id") for edge in graph.get("edges", []) if isinstance(edge, dict)}

    for node in new_nodes:
        if node.get("id") in node_ids:
            fail(f"Node already exists: {node.get('id')}")
    for edge in new_edges:
        if edge.get("id") in edge_ids:
            fail(f"Edge already exists: {edge.get('id')}")

    graph["updated_at"] = date.today().isoformat()
    graph.setdefault("nodes", []).extend(new_nodes)
    graph.setdefault("edges", []).extend(new_edges)
    return graph


def validate_merged_graph(graph: dict[str, Any]) -> None:
    validator = import_graph_validator()
    try:
        validator.validate_graph(graph)
    except SystemExit as exc:
        fail(f"Merged graph failed validation: {exc}")


def write_documents(package: dict[str, Any], overwrite: bool) -> list[Path]:
    written: list[Path] = []
    for doc in package.get("documents") or []:
        relative_path = doc["path"]
        content = doc.get("content_markdown")
        if not isinstance(content, str) or not content.strip():
            fail(f"Document is missing content_markdown: {relative_path}")
        target = safe_target(relative_path)
        if target.exists() and not overwrite:
            fail(f"Document already exists; pass --overwrite to replace it: {relative_path}")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content.rstrip() + "\n", encoding="utf-8")
        written.append(target)
    return written


def write_graph(graph: dict[str, Any]) -> None:
    GRAPH_PATH.parent.mkdir(parents=True, exist_ok=True)
    GRAPH_PATH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_lifecycle() -> dict[str, Any]:
    if not LIFECYCLE_PATH.exists():
        return {
            "version": 1,
            "updated_at": date.today().isoformat(),
            "records": {},
            "syntheses": [],
        }
    data = load_json(LIFECYCLE_PATH)
    if data.get("version") != 1:
        fail("cosmos-lifecycle.version must be 1")
    if not isinstance(data.get("records"), dict):
        fail("cosmos-lifecycle.records must be an object")
    if not isinstance(data.get("syntheses"), list):
        fail("cosmos-lifecycle.syntheses must be a list")
    return data


def merged_lifecycle(package: dict[str, Any]) -> dict[str, Any] | None:
    patch = package.get("lifecycle_patch")
    if not isinstance(patch, dict):
        return None
    lifecycle = load_lifecycle()
    records = patch.get("records") if isinstance(patch.get("records"), dict) else {}
    syntheses = patch.get("syntheses") if isinstance(patch.get("syntheses"), list) else []

    lifecycle.setdefault("records", {})
    for node_id, record in records.items():
        if not isinstance(record, dict):
            continue
        current = lifecycle["records"].get(node_id)
        current = current if isinstance(current, dict) else {}
        current.update(record)
        lifecycle["records"][node_id] = current

    lifecycle.setdefault("syntheses", [])
    existing_ids = {
        item.get("id")
        for item in lifecycle["syntheses"]
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    }
    for synthesis in syntheses:
        if not isinstance(synthesis, dict):
            continue
        synthesis_id = synthesis.get("id")
        if synthesis_id in existing_ids:
            lifecycle["syntheses"] = [
                synthesis if isinstance(item, dict) and item.get("id") == synthesis_id else item
                for item in lifecycle["syntheses"]
            ]
        else:
            lifecycle["syntheses"].append(synthesis)
            if isinstance(synthesis_id, str):
                existing_ids.add(synthesis_id)

    lifecycle["updated_at"] = date.today().isoformat()
    return lifecycle


def write_lifecycle(lifecycle: dict[str, Any] | None) -> None:
    if lifecycle is None:
        return
    LIFECYCLE_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIFECYCLE_PATH.write_text(json.dumps(lifecycle, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run_maintenance(skip: bool) -> None:
    if skip:
        return
    subprocess.run([sys.executable, "-B", "scripts/maintain_knowledge_base.py"], cwd=ROOT, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Merge a standard Knowledge Package into the local knowledge base.")
    parser.add_argument("package_path", help="Path to a Knowledge Package JSON file.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and preview without writing files.")
    parser.add_argument("--overwrite", action="store_true", help="Allow package documents to overwrite existing Markdown files.")
    parser.add_argument("--no-maintain", action="store_true", help="Skip index and health-report refresh after merge.")
    args = parser.parse_args()

    package_path = Path(args.package_path)
    package = load_json(package_path)
    validate_package(package)
    graph = merged_graph(package)
    validate_merged_graph(graph)
    lifecycle = merged_lifecycle(package)

    documents = package.get("documents") or []
    nodes = (package.get("graph_patch") or {}).get("nodes") or []
    edges = (package.get("graph_patch") or {}).get("edges") or []
    lifecycle_records = len((package.get("lifecycle_patch") or {}).get("records") or {})
    lifecycle_syntheses = len((package.get("lifecycle_patch") or {}).get("syntheses") or [])

    if args.dry_run:
        print(
            "[OK] Dry run: "
            f"{len(documents)} documents, {len(nodes)} nodes, {len(edges)} edges, "
            f"{lifecycle_records} lifecycle records, {lifecycle_syntheses} syntheses can be merged"
        )
        return 0

    written = write_documents(package, args.overwrite)
    write_graph(graph)
    write_lifecycle(lifecycle)
    run_maintenance(args.no_maintain)
    print(
        "[OK] Ingested package: "
        f"{len(written)} documents, {len(nodes)} nodes, {len(edges)} edges, "
        f"{lifecycle_records} lifecycle records, {lifecycle_syntheses} syntheses"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

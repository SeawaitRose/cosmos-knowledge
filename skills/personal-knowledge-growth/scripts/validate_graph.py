#!/usr/bin/env python3
"""Validate personal knowledge graph JSON files."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ALLOWED_NODE_TYPES = {
    "book",
    "concept",
    "method",
    "claim",
    "example",
    "action",
    "reflection",
    "question",
    "value",
    "belief",
    "emotion",
    "decision",
    "theme",
}
ALLOWED_EDGE_TYPES = {
    "contains",
    "supports",
    "contrasts",
    "extends",
    "applies_to",
    "reminds_of",
    "causes",
    "challenges",
    "reframes",
    "evidences",
    "updates",
    "recurs_in",
    "synthesizes",
}
ALLOWED_CONFIDENCE = {"high", "medium", "low"}


DEMO_GRAPH: dict[str, Any] = {
    "version": 1,
    "updated_at": "2026-05-23",
    "nodes": [
        {
            "id": "book:demo",
            "type": "book",
            "label": "示例书",
            "summary": "用于校验脚本的示例书籍节点。",
            "confidence": "high",
        },
        {
            "id": "concept:demo-idea",
            "type": "concept",
            "label": "示例概念",
            "summary": "用于确认图谱结构能表达概念。",
            "source": "book:demo",
            "confidence": "high",
        },
        {
            "id": "belief:demo-belief",
            "type": "belief",
            "label": "示例信念",
            "summary": "用于确认图谱结构能表达个人成长信念。",
            "confidence": "medium",
        },
    ],
    "edges": [
        {
            "id": "edge:demo:contains:demo-idea",
            "type": "contains",
            "from": "book:demo",
            "to": "concept:demo-idea",
            "confidence": "high",
        },
        {
            "id": "edge:demo-idea:updates:demo-belief",
            "type": "updates",
            "from": "concept:demo-idea",
            "to": "belief:demo-belief",
            "confidence": "medium",
        },
        {
            "id": "edge:demo-idea:synthesizes:demo-belief",
            "type": "synthesizes",
            "from": "concept:demo-idea",
            "to": "belief:demo-belief",
            "confidence": "medium",
        }
    ],
}


def load_graph(path: str) -> dict[str, Any]:
    if path == "--demo":
        return DEMO_GRAPH

    graph_path = Path(path)
    try:
        return json.loads(graph_path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"File not found: {graph_path}")
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON: {exc}")


def fail(message: str) -> None:
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{label} must be an object")
    return value


def require_string(item: dict[str, Any], key: str, label: str) -> str:
    value = item.get(key)
    if not isinstance(value, str) or not value.strip():
        fail(f"{label} missing non-empty string field: {key}")
    return value


def validate_confidence(item: dict[str, Any], label: str) -> None:
    value = item.get("confidence")
    if value is not None and value not in ALLOWED_CONFIDENCE:
        fail(f"{label} has invalid confidence {value!r}")


def validate_graph(graph: dict[str, Any]) -> None:
    require_object(graph, "graph")

    if graph.get("version") != 1:
        fail("graph.version must be 1")

    updated_at = require_string(graph, "updated_at", "graph")
    try:
        datetime.strptime(updated_at, "%Y-%m-%d")
    except ValueError:
        fail("graph.updated_at must use YYYY-MM-DD")

    nodes = graph.get("nodes")
    edges = graph.get("edges")
    if not isinstance(nodes, list):
        fail("graph.nodes must be a list")
    if not isinstance(edges, list):
        fail("graph.edges must be a list")

    node_ids: set[str] = set()
    for index, raw_node in enumerate(nodes):
        node = require_object(raw_node, f"nodes[{index}]")
        node_id = require_string(node, "id", f"nodes[{index}]")
        node_type = require_string(node, "type", f"nodes[{index}]")
        require_string(node, "label", f"nodes[{index}]")
        require_string(node, "summary", f"nodes[{index}]")
        validate_confidence(node, f"nodes[{index}]")

        if node_type not in ALLOWED_NODE_TYPES:
            fail(f"nodes[{index}] has invalid type {node_type!r}")
        if node_id in node_ids:
            fail(f"Duplicate node id: {node_id}")
        node_ids.add(node_id)

        tags = node.get("tags")
        if tags is not None and not (
            isinstance(tags, list) and all(isinstance(tag, str) for tag in tags)
        ):
            fail(f"nodes[{index}].tags must be a list of strings")

    edge_ids: set[str] = set()
    for index, raw_edge in enumerate(edges):
        edge = require_object(raw_edge, f"edges[{index}]")
        edge_id = require_string(edge, "id", f"edges[{index}]")
        edge_type = require_string(edge, "type", f"edges[{index}]")
        from_id = require_string(edge, "from", f"edges[{index}]")
        to_id = require_string(edge, "to", f"edges[{index}]")
        validate_confidence(edge, f"edges[{index}]")

        if edge_type not in ALLOWED_EDGE_TYPES:
            fail(f"edges[{index}] has invalid type {edge_type!r}")
        if edge_id in edge_ids:
            fail(f"Duplicate edge id: {edge_id}")
        if from_id not in node_ids:
            fail(f"edges[{index}].from references missing node: {from_id}")
        if to_id not in node_ids:
            fail(f"edges[{index}].to references missing node: {to_id}")
        edge_ids.add(edge_id)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a personal knowledge graph JSON file.")
    parser.add_argument("path", nargs="?", help="Path to graph.json.")
    parser.add_argument("--demo", action="store_true", help="Validate a built-in sample graph.")
    args = parser.parse_args()

    if args.demo:
        graph = DEMO_GRAPH
    elif args.path:
        graph = load_graph(args.path)
    else:
        parser.error("provide a graph path or use --demo")

    validate_graph(graph)
    print(
        f"[OK] Valid graph: {len(graph['nodes'])} nodes, {len(graph['edges'])} edges"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

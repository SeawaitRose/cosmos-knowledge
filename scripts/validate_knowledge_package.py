#!/usr/bin/env python3
"""Validate standard Knowledge Package JSON files before merging them."""

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
ALLOWED_SCENARIOS = {"reading", "reflection", "complaint", "decision", "idea", "practice", "import"}
ALLOWED_DOCUMENT_KINDS = {"book", "card", "import"}
ALLOWED_LIFECYCLE_STAGES = {"active", "fading", "dormant", "synthesizing", "remnant", "theory_star"}
ALLOWED_COSMOS_ROLES = {"galaxy", "star", "planet", "bridge", "comet"}
ALLOWED_DOCUMENT_PREFIXES = (
    "knowledge/books/",
    "knowledge/cards/",
    "knowledge/imports/",
)


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail([f"File not found: {path}"])
    except json.JSONDecodeError as exc:
        fail([f"Invalid JSON in {path}: {exc}"])


def fail(errors: list[str], warnings: list[str] | None = None) -> None:
    if warnings:
        for warning in warnings:
            print(f"[WARN] {warning}", file=sys.stderr)
    for error in errors:
        print(f"[FAIL] {error}", file=sys.stderr)
    raise SystemExit(1)


def is_object(value: Any) -> bool:
    return isinstance(value, dict)


def non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_safe_knowledge_path(path: str) -> bool:
    if not non_empty_string(path):
        return False
    if path.startswith("/") or "\\" in path or ".." in path or "//" in path:
        return False
    if not path.endswith(".md"):
        return False
    if not path.startswith(ALLOWED_DOCUMENT_PREFIXES):
        return False
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-./")
    return all(char in allowed for char in path)


def validate_required_string(item: dict[str, Any], key: str, label: str, errors: list[str]) -> None:
    if not non_empty_string(item.get(key)):
        errors.append(f"{label}.{key} must be a non-empty string")


def is_iso_date(value: Any) -> bool:
    if not non_empty_string(value):
        return False
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        return False
    return True


def is_optional_iso_date(value: Any) -> bool:
    return value in (None, "") or is_iso_date(value)


def document_prefix_for_kind(kind: str) -> str | None:
    return {
        "book": "knowledge/books/",
        "card": "knowledge/cards/",
        "import": "knowledge/imports/",
    }.get(kind)


def has_node_source(node: dict[str, Any]) -> bool:
    metadata = node.get("metadata")
    metadata = metadata if isinstance(metadata, dict) else {}
    return any(
        non_empty_string(value)
        for value in (
            node.get("source"),
            metadata.get("source_path"),
            metadata.get("card_path"),
            metadata.get("book_note"),
            metadata.get("import_path"),
            metadata.get("source_url"),
        )
    )


def load_current_graph_ids(graph_path: Path | None) -> tuple[set[str], set[str]]:
    if graph_path is None or not graph_path.exists():
        return set(), set()
    graph = load_json(graph_path)
    if not isinstance(graph, dict):
        return set(), set()
    nodes = graph.get("nodes") if isinstance(graph.get("nodes"), list) else []
    edges = graph.get("edges") if isinstance(graph.get("edges"), list) else []
    node_ids = {node.get("id") for node in nodes if isinstance(node, dict) and non_empty_string(node.get("id"))}
    edge_ids = {edge.get("id") for edge in edges if isinstance(edge, dict) and non_empty_string(edge.get("id"))}
    return set(node_ids), set(edge_ids)


def metadata_path_refs(node: dict[str, Any]) -> list[str]:
    metadata = node.get("metadata")
    metadata = metadata if isinstance(metadata, dict) else {}
    refs = []
    for key in ("source_path", "card_path", "book_note", "import_path"):
        value = metadata.get(key)
        if non_empty_string(value):
            refs.append(value)
    source = node.get("source")
    if non_empty_string(source) and str(source).startswith("knowledge/"):
        refs.append(source)
    return refs


def validate_package(package: Any, current_node_ids: set[str], current_edge_ids: set[str]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    package_node_ids: set[str] = set()
    package_edge_ids: set[str] = set()

    if not is_object(package):
        return ["package must be a JSON object"], warnings

    if package.get("package_version") != 1:
        errors.append("package_version must be 1")
    if not non_empty_string(package.get("package_id")):
        errors.append("package_id must be a non-empty string")
    if not is_iso_date(package.get("created_at")):
        errors.append("created_at must use YYYY-MM-DD")

    source = package.get("source")
    if not is_object(source):
        errors.append("source must be an object")
    else:
        if source.get("skill") != "personal-knowledge-growth":
            errors.append("source.skill must be personal-knowledge-growth")
        if source.get("scenario") not in ALLOWED_SCENARIOS:
            errors.append(f"source.scenario must be one of: {', '.join(sorted(ALLOWED_SCENARIOS))}")
        if not non_empty_string(source.get("language")):
            errors.append("source.language must be a non-empty string")
        if not non_empty_string(source.get("origin")):
            errors.append("source.origin must describe where the material came from")
        if not non_empty_string(source.get("description")):
            errors.append("source.description must explain why this package exists")

    documents = package.get("documents")
    if not isinstance(documents, list):
        errors.append("documents must be a list")
        documents = []
    elif not documents:
        errors.append("documents must include at least one Markdown document")

    document_paths: set[str] = set()
    for index, raw_doc in enumerate(documents):
        label = f"documents[{index}]"
        if not is_object(raw_doc):
            errors.append(f"{label} must be an object")
            continue
        validate_required_string(raw_doc, "path", label, errors)
        validate_required_string(raw_doc, "kind", label, errors)
        validate_required_string(raw_doc, "title", label, errors)
        validate_required_string(raw_doc, "content_markdown", label, errors)
        path = raw_doc.get("path")
        kind = raw_doc.get("kind")
        if non_empty_string(path):
            if not is_safe_knowledge_path(path):
                errors.append(f"{label}.path is not an allowed knowledge path: {path}")
            if path in document_paths:
                errors.append(f"duplicate document path: {path}")
            document_paths.add(path)
        if non_empty_string(kind):
            if kind not in ALLOWED_DOCUMENT_KINDS:
                errors.append(f"{label}.kind is invalid: {kind}")
            expected_prefix = document_prefix_for_kind(kind)
            if expected_prefix and non_empty_string(path) and not path.startswith(expected_prefix):
                errors.append(f"{label}.path must be under {expected_prefix} for kind {kind}")

    graph_patch = package.get("graph_patch")
    if not is_object(graph_patch):
        errors.append("graph_patch must be an object")
        graph_patch = {}
    nodes = graph_patch.get("nodes")
    edges = graph_patch.get("edges")
    if not isinstance(nodes, list):
        errors.append("graph_patch.nodes must be a list")
        nodes = []
    if not isinstance(edges, list):
        errors.append("graph_patch.edges must be a list")
        edges = []

    for index, raw_node in enumerate(nodes):
        label = f"nodes[{index}]"
        if not is_object(raw_node):
            errors.append(f"{label} must be an object")
            continue
        for key in ("id", "type", "label", "summary", "confidence"):
            validate_required_string(raw_node, key, label, errors)
        node_id = raw_node.get("id")
        node_type = raw_node.get("type")
        confidence = raw_node.get("confidence")
        if non_empty_string(node_type) and node_type not in ALLOWED_NODE_TYPES:
            errors.append(f"{label}.type is invalid: {node_type}")
        if non_empty_string(confidence) and confidence not in ALLOWED_CONFIDENCE:
            errors.append(f"{label}.confidence is invalid: {confidence}")
        if non_empty_string(node_id):
            if non_empty_string(node_type) and not str(node_id).startswith(f"{node_type}:"):
                errors.append(f"{label}.id should start with {node_type}:")
            if node_id in package_node_ids:
                errors.append(f"duplicate package node id: {node_id}")
            if node_id in current_node_ids:
                errors.append(f"node id already exists in current graph: {node_id}")
            package_node_ids.add(node_id)
        tags = raw_node.get("tags")
        if tags is not None and not (isinstance(tags, list) and all(isinstance(tag, str) for tag in tags)):
            errors.append(f"{label}.tags must be a list of strings")
        metadata = raw_node.get("metadata")
        metadata = metadata if isinstance(metadata, dict) else {}
        cosmos = metadata.get("cosmos")
        cosmos = cosmos if isinstance(cosmos, dict) else {}
        role = cosmos.get("role")
        if role is not None:
            if role not in ALLOWED_COSMOS_ROLES:
                errors.append(f"{label}.metadata.cosmos.role is invalid: {role}")
            elif role == "galaxy" and node_type != "theme":
                errors.append(f"{label}.metadata.cosmos.role galaxy is reserved for theme nodes")
        source_anchor = cosmos.get("source_anchor")
        if source_anchor is not None and not non_empty_string(source_anchor):
            errors.append(f"{label}.metadata.cosmos.source_anchor must be a non-empty string when provided")
        if not has_node_source(raw_node):
            errors.append(f"{label} is missing a source field")
        for path_ref in metadata_path_refs(raw_node):
            if not is_safe_knowledge_path(path_ref):
                errors.append(f"{label} has unsafe source path: {path_ref}")
            elif path_ref not in document_paths and not Path(path_ref).exists():
                errors.append(f"{label} references a source path not included in documents and not found locally: {path_ref}")

    endpoint_ids = set(current_node_ids) | set(package_node_ids)
    for index, raw_edge in enumerate(edges):
        label = f"edges[{index}]"
        if not is_object(raw_edge):
            errors.append(f"{label} must be an object")
            continue
        for key in ("id", "type", "from", "to", "confidence"):
            validate_required_string(raw_edge, key, label, errors)
        edge_id = raw_edge.get("id")
        edge_type = raw_edge.get("type")
        confidence = raw_edge.get("confidence")
        from_id = raw_edge.get("from")
        to_id = raw_edge.get("to")
        if non_empty_string(edge_type) and edge_type not in ALLOWED_EDGE_TYPES:
            errors.append(f"{label}.type is invalid: {edge_type}")
        if non_empty_string(confidence) and confidence not in ALLOWED_CONFIDENCE:
            errors.append(f"{label}.confidence is invalid: {confidence}")
        if non_empty_string(edge_id):
            if not str(edge_id).startswith("edge:"):
                errors.append(f"{label}.id should start with edge:")
            if edge_id in package_edge_ids:
                errors.append(f"duplicate package edge id: {edge_id}")
            if edge_id in current_edge_ids:
                errors.append(f"edge id already exists in current graph: {edge_id}")
            package_edge_ids.add(edge_id)
        if non_empty_string(from_id) and from_id not in endpoint_ids:
            errors.append(f"{label}.from references missing endpoint: {from_id}")
        if non_empty_string(to_id) and to_id not in endpoint_ids:
            errors.append(f"{label}.to references missing endpoint: {to_id}")

    lifecycle_patch = package.get("lifecycle_patch")
    if not nodes and not edges and lifecycle_patch is None:
        errors.append("graph_patch must contain at least one node or edge, or provide lifecycle_patch")
    if lifecycle_patch is not None:
        validate_lifecycle_patch(lifecycle_patch, endpoint_ids, errors)
    return errors, warnings


def validate_lifecycle_patch(patch: Any, endpoint_ids: set[str], errors: list[str]) -> None:
    if not is_object(patch):
        errors.append("lifecycle_patch must be an object")
        return

    records = patch.get("records", {})
    if records is not None and not is_object(records):
        errors.append("lifecycle_patch.records must be an object")
        records = {}
    for node_id, raw_record in records.items():
        label = f"lifecycle_patch.records[{node_id}]"
        if not non_empty_string(node_id):
            errors.append("lifecycle_patch.records keys must be non-empty node IDs")
            continue
        if node_id not in endpoint_ids:
            errors.append(f"{label} references missing node")
        if not is_object(raw_record):
            errors.append(f"{label} must be an object")
            continue
        for key in ("last_reviewed_at", "last_practiced_at"):
            if key in raw_record and not is_optional_iso_date(raw_record.get(key)):
                errors.append(f"{label}.{key} must use YYYY-MM-DD or be empty")
        for key in ("review_count", "practice_count"):
            if key in raw_record and not isinstance(raw_record.get(key), int):
                errors.append(f"{label}.{key} must be an integer")
        if "mastery" in raw_record:
            mastery = raw_record.get("mastery")
            if not isinstance(mastery, (int, float)) or not 0 <= float(mastery) <= 1:
                errors.append(f"{label}.mastery must be a number from 0 to 1")
        stage = raw_record.get("stage")
        if stage is not None and stage not in ALLOWED_LIFECYCLE_STAGES:
            errors.append(f"{label}.stage is invalid: {stage}")
        synthesized_into = raw_record.get("synthesized_into")
        if non_empty_string(synthesized_into) and synthesized_into not in endpoint_ids:
            errors.append(f"{label}.synthesized_into references missing node: {synthesized_into}")

    syntheses = patch.get("syntheses", [])
    if syntheses is not None and not isinstance(syntheses, list):
        errors.append("lifecycle_patch.syntheses must be a list")
        syntheses = []
    synthesis_ids: set[str] = set()
    for index, raw_synthesis in enumerate(syntheses):
        label = f"lifecycle_patch.syntheses[{index}]"
        if not is_object(raw_synthesis):
            errors.append(f"{label} must be an object")
            continue
        for key in ("id", "theory_node_id", "created_at", "summary", "mode"):
            validate_required_string(raw_synthesis, key, label, errors)
        synthesis_id = raw_synthesis.get("id")
        if non_empty_string(synthesis_id):
            if synthesis_id in synthesis_ids:
                errors.append(f"duplicate lifecycle synthesis id: {synthesis_id}")
            synthesis_ids.add(synthesis_id)
        theory_node_id = raw_synthesis.get("theory_node_id")
        if non_empty_string(theory_node_id) and theory_node_id not in endpoint_ids:
            errors.append(f"{label}.theory_node_id references missing node: {theory_node_id}")
        if not is_iso_date(raw_synthesis.get("created_at")):
            errors.append(f"{label}.created_at must use YYYY-MM-DD")
        predecessors = raw_synthesis.get("predecessor_node_ids")
        if not isinstance(predecessors, list) or not predecessors:
            errors.append(f"{label}.predecessor_node_ids must be a non-empty list")
        elif not all(non_empty_string(item) for item in predecessors):
            errors.append(f"{label}.predecessor_node_ids must contain node IDs")
        else:
            missing = [item for item in predecessors if item not in endpoint_ids]
            if missing:
                errors.append(f"{label}.predecessor_node_ids references missing nodes: {', '.join(missing)}")
        if raw_synthesis.get("mode") != "accretion":
            errors.append(f"{label}.mode must be accretion")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a Knowledge Package JSON file.")
    parser.add_argument("package_path", help="Path to a Knowledge Package JSON file.")
    parser.add_argument(
        "--graph",
        default="knowledge/data/graph.json",
        help="Current graph path used to detect duplicate IDs and valid edge endpoints.",
    )
    args = parser.parse_args()

    package_path = Path(args.package_path)
    graph_path = Path(args.graph) if args.graph else None
    current_node_ids, current_edge_ids = load_current_graph_ids(graph_path)
    package = load_json(package_path)
    errors, warnings = validate_package(package, current_node_ids, current_edge_ids)

    if errors:
        fail(errors, warnings)

    for warning in warnings:
        print(f"[WARN] {warning}")
    nodes = package.get("graph_patch", {}).get("nodes", [])
    edges = package.get("graph_patch", {}).get("edges", [])
    docs = package.get("documents", [])
    lifecycle_patch = package.get("lifecycle_patch") if isinstance(package.get("lifecycle_patch"), dict) else {}
    lifecycle_records = len(lifecycle_patch.get("records") or {})
    lifecycle_syntheses = len(lifecycle_patch.get("syntheses") or [])
    print(
        "[OK] Valid knowledge package: "
        f"{len(docs)} documents, {len(nodes)} nodes, {len(edges)} edges, "
        f"{lifecycle_records} lifecycle records, {lifecycle_syntheses} syntheses"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

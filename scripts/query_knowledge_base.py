#!/usr/bin/env python3
"""Query the local personal knowledge wiki.

This is intentionally lightweight: it reads Markdown plus graph.json, scores
text matches, and expands results through nearby graph relationships.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
GRAPH_PATH = ROOT / "knowledge" / "data" / "graph.json"
KNOWLEDGE_DIR = ROOT / "knowledge"
MARKDOWN_DIRS = (
    KNOWLEDGE_DIR / "books",
    KNOWLEDGE_DIR / "cards",
    KNOWLEDGE_DIR / "imports",
)


def load_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"[FAIL] File not found: {path}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"[FAIL] Invalid JSON in {path}: {exc}")
    if not isinstance(data, dict):
        raise SystemExit(f"[FAIL] Expected JSON object: {path}")
    return data


def load_graph() -> dict[str, Any]:
    return load_json(GRAPH_PATH)


def is_safe_markdown_path(path: str) -> bool:
    if not isinstance(path, str) or not path:
        return False
    if path.startswith("/") or "\\" in path or ".." in path or "//" in path:
        return False
    if not path.endswith(".md"):
        return False
    return path.startswith(("knowledge/books/", "knowledge/cards/", "knowledge/imports/"))


def node_paths(node: dict[str, Any]) -> list[str]:
    metadata = node.get("metadata") if isinstance(node.get("metadata"), dict) else {}
    paths: list[str] = []
    for key in ("book_note", "card_path", "source_path", "import_path"):
        value = metadata.get(key)
        if isinstance(value, str):
            paths.append(value)
    source_paths = metadata.get("source_paths")
    if isinstance(source_paths, list):
        paths.extend(str(path) for path in source_paths if isinstance(path, str))
    source = node.get("source")
    if isinstance(source, str) and source.startswith("knowledge/"):
        paths.append(source)
    return sorted({path for path in paths if is_safe_markdown_path(path)})


def load_markdown_documents(graph: dict[str, Any]) -> dict[str, str]:
    paths: set[str] = set()
    for node in graph.get("nodes", []):
        if isinstance(node, dict):
            paths.update(node_paths(node))
    for directory in MARKDOWN_DIRS:
        if directory.exists():
            for path in directory.rglob("*.md"):
                try:
                    paths.add(str(path.relative_to(ROOT)))
                except ValueError:
                    continue

    docs: dict[str, str] = {}
    for path in sorted(paths):
        target = ROOT / path
        try:
            docs[path] = target.read_text(encoding="utf-8")
        except OSError:
            continue
    return docs


def normalize(text: Any) -> str:
    return str(text or "").lower()


def tokens(text: str) -> list[str]:
    raw = re.findall(r"[a-z0-9]+|[\u4e00-\u9fff]{1,8}", normalize(text))
    result: list[str] = []
    for item in raw:
        result.append(item)
        if re.fullmatch(r"[\u4e00-\u9fff]{3,8}", item):
            result.extend(item[index : index + 2] for index in range(len(item) - 1))
    return [item for item in result if item.strip()]


def node_text(node: dict[str, Any], docs: dict[str, str]) -> str:
    metadata = node.get("metadata") if isinstance(node.get("metadata"), dict) else {}
    values: list[str] = [
        node.get("id", ""),
        node.get("type", ""),
        node.get("label", ""),
        node.get("summary", ""),
        node.get("source", ""),
        " ".join(str(tag) for tag in node.get("tags", []) if isinstance(tag, str)),
        json.dumps(metadata, ensure_ascii=False),
    ]
    for path in node_paths(node):
        values.append(docs.get(path, "")[:8000])
    return "\n".join(str(value) for value in values if value)


def score_node(query: str, query_tokens: list[str], node: dict[str, Any], docs: dict[str, str]) -> tuple[float, list[str]]:
    label = normalize(node.get("label"))
    summary = normalize(node.get("summary"))
    node_id = normalize(node.get("id"))
    tags = " ".join(normalize(tag) for tag in node.get("tags", []) if isinstance(tag, str))
    body = normalize(node_text(node, docs))
    query_norm = normalize(query).strip()
    reasons: list[str] = []
    score = 0.0

    if query_norm and query_norm == label:
        score += 80
        reasons.append("标题完全匹配")
    elif query_norm and query_norm in label:
        score += 45
        reasons.append("标题包含查询词")
    elif query_norm and query_norm in summary:
        score += 28
        reasons.append("摘要包含查询词")
    elif query_norm and query_norm in body:
        score += 14
        reasons.append("关联文档包含查询词")

    for token in query_tokens:
        if not token:
            continue
        if token in label:
            score += 10
        if token in node_id:
            score += 5
        if token in tags:
            score += 7
        if token in summary:
            score += 5
        if token in body:
            score += 1.5

    if node.get("type") == "question":
        score += 3
    if node.get("confidence") == "low":
        score += 2

    if not reasons and score:
        reasons.append("标签、摘要或文档近似匹配")
    return score, reasons


def related_edges(graph: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    related: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for edge in graph.get("edges", []):
        if not isinstance(edge, dict):
            continue
        related[str(edge.get("from", ""))].append(edge)
        related[str(edge.get("to", ""))].append(edge)
    return related


def node_by_id(graph: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(node.get("id")): node
        for node in graph.get("nodes", [])
        if isinstance(node, dict) and node.get("id")
    }


def neighbor_ids(graph: dict[str, Any], node_id: str, depth: int) -> list[str]:
    related = related_edges(graph)
    seen = {node_id}
    frontier = {node_id}
    ordered: list[str] = []
    for _ in range(max(0, depth)):
        next_frontier: set[str] = set()
        for current in frontier:
            for edge in related.get(current, []):
                other = edge.get("to") if edge.get("from") == current else edge.get("from")
                if not other or other in seen:
                    continue
                seen.add(str(other))
                next_frontier.add(str(other))
                ordered.append(str(other))
        frontier = next_frontier
        if not frontier:
            break
    return ordered


def snippet_for(text: str, query_tokens: list[str], max_len: int = 150) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    if not compact:
        return ""
    low = compact.lower()
    positions = [low.find(token.lower()) for token in query_tokens if token and low.find(token.lower()) >= 0]
    start = max(0, min(positions) - 45) if positions else 0
    snippet = compact[start : start + max_len]
    prefix = "..." if start else ""
    suffix = "..." if start + max_len < len(compact) else ""
    return f"{prefix}{snippet}{suffix}"


def node_snippets(node: dict[str, Any], docs: dict[str, str], query_tokens: list[str]) -> list[dict[str, str]]:
    snippets: list[dict[str, str]] = []
    summary = snippet_for(str(node.get("summary", "")), query_tokens)
    if summary:
        snippets.append({"path": "graph.summary", "text": summary})
    for path in node_paths(node):
        text = docs.get(path, "")
        snippet = snippet_for(text, query_tokens)
        if snippet:
            snippets.append({"path": path, "text": snippet})
    return snippets[:3]


def open_questions(graph: dict[str, Any], limit: int = 8) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    for node in graph.get("nodes", []):
        if not isinstance(node, dict) or node.get("type") != "question":
            continue
        metadata = node.get("metadata") if isinstance(node.get("metadata"), dict) else {}
        if metadata.get("status") == "done":
            continue
        items.append(
            {
                "node_id": str(node.get("id", "")),
                "label": str(node.get("label", "")),
                "summary": str(node.get("summary", "")),
                "status": str(metadata.get("status", "open")),
            }
        )
    return items[:limit]


def knowledge_gaps(graph: dict[str, Any], docs: dict[str, str], limit: int = 8) -> list[dict[str, str]]:
    gaps: list[dict[str, str]] = []
    for node in graph.get("nodes", []):
        if not isinstance(node, dict):
            continue
        node_id = str(node.get("id", ""))
        node_type = node.get("type")
        metadata = node.get("metadata") if isinstance(node.get("metadata"), dict) else {}
        paths = node_paths(node)
        doc_text = "\n".join(docs.get(path, "") for path in paths)
        has_review = bool(metadata.get("review_questions")) or "复习问题" in doc_text or "复盘问题" in doc_text
        has_boundary = "反例" in doc_text or "边界" in doc_text
        if node.get("confidence") in {"low", "medium"} and node_type not in {"book", "theme"}:
            gaps.append({"node_id": node_id, "label": str(node.get("label", "")), "reason": "置信度仍需校准"})
        if node_type in {"concept", "method", "claim", "belief", "reflection"} and paths and not has_review:
            gaps.append({"node_id": node_id, "label": str(node.get("label", "")), "reason": "缺少复习或复盘问题"})
        if node_type in {"concept", "method", "claim", "belief"} and paths and not has_boundary:
            gaps.append({"node_id": node_id, "label": str(node.get("label", "")), "reason": "缺少反例或边界"})
        if len(gaps) >= limit:
            break
    return gaps


def query_knowledge(query: str, limit: int = 8, depth: int = 1) -> dict[str, Any]:
    graph = load_graph()
    docs = load_markdown_documents(graph)
    by_id = node_by_id(graph)
    query_tokens = tokens(query)

    scored: list[tuple[float, dict[str, Any], list[str]]] = []
    for node in graph.get("nodes", []):
        if not isinstance(node, dict):
            continue
        score, reasons = score_node(query, query_tokens, node, docs)
        if score > 0:
            scored.append((score, node, reasons))

    scored.sort(key=lambda item: (-item[0], str(item[1].get("label", ""))))
    results = []
    for score, node, reasons in scored[:limit]:
        node_id = str(node.get("id", ""))
        neighbors = []
        for neighbor_id in neighbor_ids(graph, node_id, depth)[:8]:
            neighbor = by_id.get(neighbor_id)
            if neighbor:
                neighbors.append(
                    {
                        "node_id": neighbor_id,
                        "label": neighbor.get("label", neighbor_id),
                        "type": neighbor.get("type", "unknown"),
                    }
                )
        results.append(
            {
                "node_id": node_id,
                "title": node.get("label", node_id),
                "type": node.get("type", "unknown"),
                "confidence": node.get("confidence", "unknown"),
                "score": round(score, 2),
                "why": reasons,
                "paths": node_paths(node),
                "snippets": node_snippets(node, docs, query_tokens),
                "neighbors": neighbors,
            }
        )

    return {
        "question": query,
        "result_count": len(results),
        "results": results,
        "open_questions": open_questions(graph),
        "gaps": knowledge_gaps(graph, docs),
    }


def get_node(node_id: str, depth: int = 1) -> dict[str, Any]:
    graph = load_graph()
    docs = load_markdown_documents(graph)
    by_id = node_by_id(graph)
    node = by_id.get(node_id)
    if not node:
        raise SystemExit(f"[FAIL] Node not found: {node_id}")
    neighbors = [by_id[item] for item in neighbor_ids(graph, node_id, depth) if item in by_id]
    return {
        "node": node,
        "paths": node_paths(node),
        "documents": {path: docs.get(path, "") for path in node_paths(node)},
        "neighbors": [
            {
                "node_id": item.get("id"),
                "label": item.get("label"),
                "type": item.get("type"),
                "summary": item.get("summary"),
            }
            for item in neighbors
        ],
    }


def graph_summary() -> dict[str, Any]:
    graph = load_graph()
    docs = load_markdown_documents(graph)
    nodes = [node for node in graph.get("nodes", []) if isinstance(node, dict)]
    edges = [edge for edge in graph.get("edges", []) if isinstance(edge, dict)]
    return {
        "updated_at": graph.get("updated_at"),
        "nodes": len(nodes),
        "edges": len(edges),
        "types": Counter(str(node.get("type", "unknown")) for node in nodes),
        "open_questions": open_questions(graph),
        "gaps": knowledge_gaps(graph, docs),
    }


def print_human_query(result: dict[str, Any]) -> None:
    print(f"# 查询：{result['question']}")
    print("")
    if not result["results"]:
        print("没有找到直接匹配的节点。")
    for index, item in enumerate(result["results"], start=1):
        print(f"{index}. {item['title']} (`{item['node_id']}`) [{item['type']}, {item['confidence']}]")
        print(f"   - 匹配：{', '.join(item['why']) if item['why'] else '近似匹配'}")
        if item["paths"]:
            print(f"   - 路径：{', '.join(item['paths'])}")
        if item["neighbors"]:
            labels = ", ".join(f"{n['label']} ({n['type']})" for n in item["neighbors"][:4])
            print(f"   - 邻近：{labels}")
        if item["snippets"]:
            print(f"   - 摘录：{item['snippets'][0]['text']}")
    print("")
    if result["open_questions"]:
        print("## 开放问题")
        for item in result["open_questions"][:5]:
            print(f"- {item['label']} (`{item['node_id']}`)")
    if result["gaps"]:
        print("")
        print("## 知识缺口")
        for item in result["gaps"][:5]:
            print(f"- {item['label']}：{item['reason']}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Query the local personal knowledge wiki.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    query_parser = subparsers.add_parser("query", help="Search graph nodes and linked Markdown.")
    query_parser.add_argument("question", help="Question or keyword to search.")
    query_parser.add_argument("--limit", type=int, default=8)
    query_parser.add_argument("--depth", type=int, default=1)
    query_parser.add_argument("--json", action="store_true", help="Print JSON instead of Markdown text.")

    node_parser = subparsers.add_parser("get-node", help="Return one node with linked documents and neighbors.")
    node_parser.add_argument("node_id")
    node_parser.add_argument("--depth", type=int, default=1)
    node_parser.add_argument("--json", action="store_true")

    summary_parser = subparsers.add_parser("summary", help="Print graph summary and current gaps.")
    summary_parser.add_argument("--json", action="store_true")

    args = parser.parse_args()
    if args.command == "query":
        result = query_knowledge(args.question, limit=args.limit, depth=args.depth)
        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print_human_query(result)
    elif args.command == "get-node":
        result = get_node(args.node_id, depth=args.depth)
        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            node = result["node"]
            print(f"# {node.get('label', args.node_id)}")
            print("")
            print(node.get("summary", ""))
            print("")
            print("## 路径")
            for path in result["paths"]:
                print(f"- {path}")
            print("")
            print("## 邻近节点")
            for item in result["neighbors"]:
                print(f"- {item['label']} (`{item['node_id']}`): {item['summary']}")
    elif args.command == "summary":
        result = graph_summary()
        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2, default=dict))
        else:
            print(f"[OK] {result['nodes']} nodes, {result['edges']} edges, updated {result['updated_at']}")
            print(f"Open questions: {len(result['open_questions'])}")
            print(f"Gaps: {len(result['gaps'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

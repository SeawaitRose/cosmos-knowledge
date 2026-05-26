#!/usr/bin/env python3
"""Generate lightweight indexes and a health report for the personal knowledge base."""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
GRAPH_PATH = ROOT / "knowledge" / "data" / "graph.json"
INDEX_DIR = ROOT / "knowledge" / "index"
REPORT_DIR = ROOT / "knowledge" / "reports"


def load_graph() -> dict[str, Any]:
    return json.loads(GRAPH_PATH.read_text(encoding="utf-8"))


def node_tags(node: dict[str, Any]) -> list[str]:
    tags = node.get("tags") if isinstance(node.get("tags"), list) else []
    discipline = (node.get("metadata") or {}).get("discipline")
    extra: list[str] = []
    if isinstance(discipline, str):
        extra.append(discipline)
    elif isinstance(discipline, list):
        extra.extend(str(item) for item in discipline)
    return sorted(set(str(tag) for tag in [*tags, *extra] if tag))


def node_paths(node: dict[str, Any]) -> list[str]:
    metadata = node.get("metadata") or {}
    paths = [
        metadata.get("book_note"),
        metadata.get("card_path"),
        metadata.get("source_path"),
    ]
    paths.extend(metadata.get("source_paths") or [])
    return [str(path) for path in paths if path]


def node_metadata(node: dict[str, Any]) -> dict[str, Any]:
    metadata = node.get("metadata")
    return metadata if isinstance(metadata, dict) else {}


def is_source_archive(node: dict[str, Any]) -> bool:
    metadata = node_metadata(node)
    return metadata.get("import_role") == "source_archive"


def node_markdown(node: dict[str, Any]) -> str:
    chunks = []
    for path in node_paths(node):
        target = ROOT / path
        if target.exists():
            chunks.append(target.read_text(encoding="utf-8", errors="ignore"))
    return "\n".join(chunks)


def has_review_hook(node: dict[str, Any], markdown: str) -> bool:
    metadata = node_metadata(node)
    review_questions = metadata.get("review_questions")
    if isinstance(review_questions, list) and any(str(item).strip() for item in review_questions):
        return True
    return "复习问题" in markdown or "复盘问题" in markdown or "下次复习" in markdown


def has_boundary_hook(markdown: str) -> bool:
    return "反例" in markdown or "边界" in markdown or "误区" in markdown


def related_edges(graph: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    related: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for edge in graph.get("edges", []):
        related[edge.get("from", "")].append(edge)
        related[edge.get("to", "")].append(edge)
    return related


def analyze(graph: dict[str, Any]) -> dict[str, Any]:
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    by_id = {node["id"]: node for node in nodes if "id" in node}
    related = related_edges(graph)

    orphan_nodes = [node for node in nodes if not related.get(node.get("id"))]
    no_source_nodes = [
        node
        for node in nodes
        if node.get("type") not in {"book", "theme"}
        and not node.get("source")
        and not node_paths(node)
        and not node_metadata(node).get("source_type")
    ]
    missing_paths = []
    for node in nodes:
        for path in node_paths(node):
            if not (ROOT / path).exists():
                missing_paths.append({"node": node, "path": path})

    degree = Counter()
    for edge in edges:
        degree[edge.get("from", "")] += 1
        degree[edge.get("to", "")] += 1
    bridge_nodes = sorted(nodes, key=lambda node: degree[node.get("id", "")], reverse=True)

    node_markdown_by_id = {
        node.get("id", ""): node_markdown(node)
        for node in nodes
        if isinstance(node, dict)
    }
    open_questions = [
        node
        for node in nodes
        if node.get("type") == "question" and node_metadata(node).get("status") != "done"
    ]
    active_actions = [
        node
        for node in nodes
        if node.get("type") == "action" and node_metadata(node).get("status") == "active"
    ]
    low_confidence_nodes = [
        node
        for node in nodes
        if node.get("confidence") in {"low", "medium"} and node.get("type") not in {"book", "theme"}
    ]
    review_candidate_types = {"concept", "method", "claim", "belief", "reflection", "action", "question", "decision"}
    missing_review_nodes = [
        node
        for node in nodes
        if node.get("type") in review_candidate_types
        and node_paths(node)
        and not has_review_hook(node, node_markdown_by_id.get(node.get("id", ""), ""))
    ]
    boundary_candidate_types = {"concept", "method", "claim", "belief"}
    missing_boundary_nodes = [
        node
        for node in nodes
        if node.get("type") in boundary_candidate_types
        and node_paths(node)
        and not has_boundary_hook(node_markdown_by_id.get(node.get("id", ""), ""))
    ]
    weak_edges = [edge for edge in edges if edge.get("type") == "reminds_of"]

    tags = Counter(tag for node in nodes for tag in node_tags(node))
    types = Counter(node.get("type", "unknown") for node in nodes)
    confidence = Counter(node.get("confidence", "unknown") for node in nodes)

    return {
        "nodes": nodes,
        "edges": edges,
        "by_id": by_id,
        "orphan_nodes": orphan_nodes,
        "no_source_nodes": no_source_nodes,
        "missing_paths": missing_paths,
        "bridge_nodes": bridge_nodes,
        "tags": tags,
        "types": types,
        "confidence": confidence,
        "degree": degree,
        "open_questions": open_questions,
        "active_actions": active_actions,
        "low_confidence_nodes": low_confidence_nodes,
        "missing_review_nodes": missing_review_nodes,
        "missing_boundary_nodes": missing_boundary_nodes,
        "weak_edges": weak_edges,
    }


def write_index(graph: dict[str, Any], analysis: dict[str, Any]) -> None:
    INDEX_DIR.mkdir(parents=True, exist_ok=True)

    nodes = analysis["nodes"]
    lines = [
        "# 知识库索引",
        "",
        f"- 更新时间：{graph.get('updated_at', '未知')}",
        f"- 节点数：{len(nodes)}",
        f"- 关系数：{len(analysis['edges'])}",
        "",
        "## 类型分布",
        "",
    ]
    for item, count in analysis["types"].most_common():
        lines.append(f"- {item}: {count}")

    lines.extend(["", "## 主题标签", ""])
    for tag, count in analysis["tags"].most_common():
        lines.append(f"- {tag}: {count}")

    lines.extend(["", "## 高连接节点", ""])
    for node in [item for item in analysis["bridge_nodes"] if not is_source_archive(item)][:12]:
        node_id = node.get("id", "")
        lines.append(f"- {node.get('label', node_id)} (`{node_id}`): {analysis['degree'][node_id]} 条连接")

    source_archives = [node for node in nodes if is_source_archive(node)]
    if source_archives:
        lines.extend(["", "## 来源档案", ""])
        for node in source_archives:
            node_id = node.get("id", "")
            lines.append(f"- {node.get('label', node_id)} (`{node_id}`): {analysis['degree'][node_id]} 条连接，作为来源追溯保留")

    (INDEX_DIR / "index.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_source_index(analysis: dict[str, Any]) -> None:
    lines = ["# 来源索引", ""]
    has_source = False
    for node in analysis["nodes"]:
        paths = node_paths(node)
        if not paths:
            continue
        has_source = True
        lines.append(f"## {node.get('label', node.get('id'))}")
        for path in paths:
            status = "OK" if (ROOT / path).exists() else "MISSING"
            lines.append(f"- {status}: `{path}`")
        lines.append("")

    if not has_source:
        lines.append("暂无来源路径。")
    (INDEX_DIR / "source-index.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def write_report(analysis: dict[str, Any]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    lines = [
        "# 知识库健康检查",
        "",
        f"- 生成日期：{date.today().isoformat()}",
        f"- 节点数：{len(analysis['nodes'])}",
        f"- 关系数：{len(analysis['edges'])}",
        f"- 孤立节点：{len(analysis['orphan_nodes'])}",
        f"- 缺少来源节点：{len(analysis['no_source_nodes'])}",
        f"- 缺失文档路径：{len(analysis['missing_paths'])}",
        f"- 开放问题：{len(analysis['open_questions'])}",
        f"- Active 行动：{len(analysis['active_actions'])}",
        f"- 低/中置信节点：{len(analysis['low_confidence_nodes'])}",
        f"- 缺复习钩子节点：{len(analysis['missing_review_nodes'])}",
        f"- 缺反例边界节点：{len(analysis['missing_boundary_nodes'])}",
        f"- 弱关系 reminds_of：{len(analysis['weak_edges'])}",
        "",
        "## 孤立节点",
        "",
    ]
    lines.extend(issue_lines(analysis["orphan_nodes"], "暂无孤立节点。"))
    lines.extend(["", "## 缺少来源节点", ""])
    lines.extend(issue_lines(analysis["no_source_nodes"], "暂无缺少来源的非书籍节点。"))
    lines.extend(["", "## 缺失文档路径", ""])
    if analysis["missing_paths"]:
        for item in analysis["missing_paths"]:
            node = item["node"]
            lines.append(f"- {node.get('label', node.get('id'))}: `{item['path']}`")
    else:
        lines.append("暂无缺失路径。")

    lines.extend(["", "## 开放问题", ""])
    lines.extend(issue_lines(analysis["open_questions"][:12], "暂无开放问题。"))
    lines.extend(["", "## Active 行动", ""])
    lines.extend(issue_lines(analysis["active_actions"][:12], "暂无 active 行动。"))
    lines.extend(["", "## 低/中置信节点", ""])
    lines.extend(issue_lines(analysis["low_confidence_nodes"][:12], "暂无低/中置信节点。"))
    lines.extend(["", "## 缺复习钩子节点", ""])
    lines.extend(issue_lines(analysis["missing_review_nodes"][:12], "暂无缺复习钩子的节点。"))
    lines.extend(["", "## 缺反例边界节点", ""])
    lines.extend(issue_lines(analysis["missing_boundary_nodes"][:12], "暂无缺反例边界的节点。"))
    lines.extend(["", "## 弱关系 reminds_of", ""])
    if analysis["weak_edges"]:
        for edge in analysis["weak_edges"][:12]:
            lines.append(f"- `{edge.get('id')}`: `{edge.get('from')}` -> `{edge.get('to')}`")
    else:
        lines.append("暂无弱关系。")

    lines.extend(["", "## 建议", ""])
    if analysis["orphan_nodes"]:
        lines.append("- 为孤立节点补充至少一条关系，或确认它是否应该保留。")
    if analysis["no_source_nodes"]:
        lines.append("- 为缺少来源的节点补充 `source`、`metadata.source_path` 或 `metadata.source_type`。")
    if analysis["open_questions"]:
        lines.append("- 从开放问题中选择一个进入每日 AI 对话，避免不确定性长期悬空。")
    if analysis["active_actions"]:
        lines.append("- 对 active 行动做一周复盘，记录是否继续、调整或关闭。")
    if analysis["missing_review_nodes"]:
        lines.append("- 为缺复习钩子的关键节点补充 `metadata.review_questions` 或 Markdown 复习问题。")
    if analysis["missing_boundary_nodes"]:
        lines.append("- 为重要观点补充反例或边界，防止知识变成口号。")
    if len(analysis["weak_edges"]) >= 4:
        lines.append("- 检查 `reminds_of` 弱关系，能升级的改为 supports、contrasts、updates 或 reframes。")
    if not any(
        analysis[key]
        for key in (
            "orphan_nodes",
            "no_source_nodes",
            "open_questions",
            "active_actions",
            "missing_review_nodes",
            "missing_boundary_nodes",
        )
    ):
        lines.append("- 当前结构和成长闭环都健康，可以继续通过读书或复盘扩展新节点。")

    (REPORT_DIR / "latest-lint.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def issue_lines(nodes: list[dict[str, Any]], empty_text: str) -> list[str]:
    if not nodes:
        return [empty_text]
    return [f"- {node.get('label', node.get('id'))} (`{node.get('id')}`)" for node in nodes]


def main() -> int:
    parser = argparse.ArgumentParser(description="Maintain local personal knowledge indexes and reports.")
    parser.add_argument("--check-only", action="store_true", help="Analyze without writing index/report files.")
    args = parser.parse_args()

    graph = load_graph()
    analysis = analyze(graph)

    if not args.check_only:
        write_index(graph, analysis)
        write_source_index(analysis)
        write_report(analysis)

    print(
        "[OK] Knowledge base analyzed: "
        f"{len(analysis['nodes'])} nodes, "
        f"{len(analysis['edges'])} edges, "
        f"{len(analysis['orphan_nodes'])} orphans, "
        f"{len(analysis['no_source_nodes'])} missing-source nodes, "
        f"{len(analysis['open_questions'])} open questions, "
        f"{len(analysis['active_actions'])} active actions"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

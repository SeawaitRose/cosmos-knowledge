#!/usr/bin/env python3
"""Generate a daily active-growth brief from the local knowledge wiki."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import date, datetime
from pathlib import Path
from typing import Any

import query_knowledge_base as wiki


ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "knowledge" / "reports"
RECOMMENDATION_PATH = ROOT / "knowledge" / "index" / "book-recommendations.json"


def node_metadata(node: dict[str, Any]) -> dict[str, Any]:
    return node.get("metadata") if isinstance(node.get("metadata"), dict) else {}


def load_recommendations() -> list[dict[str, Any]]:
    if not RECOMMENDATION_PATH.exists():
        return []
    try:
        data = json.loads(RECOMMENDATION_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    if isinstance(data, dict):
        items = data.get("books", [])
    else:
        items = data
    return [item for item in items if isinstance(item, dict)]


def extract_markdown_signals(docs: dict[str, str]) -> dict[str, list[dict[str, str]]]:
    review: list[dict[str, str]] = []
    pending: list[dict[str, str]] = []
    for path, markdown in docs.items():
        lines = markdown.splitlines()
        in_pending = False
        for line in lines:
            text = line.strip()
            if not text:
                continue
            if re.match(r"^#+\s*待追问", text):
                in_pending = True
                continue
            if re.match(r"^#+\s*", text) and not re.match(r"^#+\s*待追问", text):
                in_pending = False
            review_match = re.search(r"复习问题[:：]\s*(.+)$", text)
            if review_match:
                review.append({"text": review_match.group(1), "source": path})
            pending_match = re.match(r"^\d+[.、]\s*(.+)$", text)
            if in_pending and pending_match:
                pending.append({"text": pending_match.group(1), "source": path})
            todo_match = re.search(r"待确认问题[:：]\s*(.+)$", text)
            if todo_match:
                pending.append({"text": todo_match.group(1), "source": path})
    return {"review": review, "pending": pending}


def degree_map(graph: dict[str, Any]) -> Counter[str]:
    degree: Counter[str] = Counter()
    for node in graph.get("nodes", []):
        if isinstance(node, dict) and node.get("id"):
            degree[str(node["id"])] = 0
    for edge in graph.get("edges", []):
        if not isinstance(edge, dict):
            continue
        degree[str(edge.get("from", ""))] += 1
        degree[str(edge.get("to", ""))] += 1
    return degree


def select_focus_question(graph: dict[str, Any], docs: dict[str, str], signals: dict[str, list[dict[str, str]]]) -> dict[str, str]:
    questions = []
    degree = degree_map(graph)
    for node in graph.get("nodes", []):
        if not isinstance(node, dict) or node.get("type") != "question":
            continue
        metadata = node_metadata(node)
        if metadata.get("status") == "done":
            continue
        questions.append(node)
    if questions:
        questions.sort(key=lambda node: (-degree[str(node.get("id", ""))], str(node.get("label", ""))))
        node = questions[0]
        return {
            "text": str(node.get("label", "")),
            "source": str(node.get("id", "")),
            "reason": "开放问题，适合今天和 AI 深聊",
        }
    if signals["pending"]:
        item = signals["pending"][0]
        return {
            "text": item["text"],
            "source": item["source"],
            "reason": "Markdown 待追问",
        }
    gaps = wiki.knowledge_gaps(graph, docs, limit=1)
    if gaps:
        item = gaps[0]
        return {
            "text": f"补清楚：{item['label']}为什么{item['reason']}",
            "source": item["node_id"],
            "reason": item["reason"],
        }
    return {
        "text": "今天用一个真实场景检验最近最重要的知识节点。",
        "source": "fallback",
        "reason": "暂无明显开放问题，转入应用复盘",
    }


def select_fuzzy_points(graph: dict[str, Any], docs: dict[str, str], limit: int = 3) -> list[dict[str, str]]:
    gaps = wiki.knowledge_gaps(graph, docs, limit=24)
    seen_nodes: set[str] = set()
    points: list[dict[str, str]] = []
    for gap in gaps:
        if gap["node_id"] in seen_nodes:
            continue
        seen_nodes.add(gap["node_id"])
        points.append(
            {
                "text": f"{gap['label']}：{gap['reason']}",
                "source": gap["node_id"],
                "reason": gap["reason"],
            }
        )
        if len(points) >= limit:
            return points
    for node in graph.get("nodes", []):
        if not isinstance(node, dict):
            continue
        if node.get("confidence") in {"low", "medium"} and node.get("type") not in {"book", "theme"}:
            points.append(
                {
                    "text": f"{node.get('label')}：置信度是 {node.get('confidence')}",
                    "source": str(node.get("id", "")),
                    "reason": "置信度仍需追问",
                }
            )
            if len(points) >= limit:
                break
    return points


def select_supplements(graph: dict[str, Any], docs: dict[str, str], signals: dict[str, list[dict[str, str]]], limit: int = 2) -> list[dict[str, str]]:
    supplements: list[dict[str, str]] = []
    for gap in wiki.knowledge_gaps(graph, docs, limit=20):
        if gap["reason"] in {"缺少反例或边界", "缺少复习或复盘问题"}:
            supplements.append(
                {
                    "text": f"给「{gap['label']}」补充：{gap['reason']}",
                    "source": gap["node_id"],
                }
            )
        if len(supplements) >= limit:
            return supplements
    for item in signals["review"][:limit]:
        supplements.append({"text": f"回答复习问题：{item['text']}", "source": item["source"]})
    if not supplements:
        supplements.append({"text": "为一个高连接节点补一个现实案例和反例边界。", "source": "graph"})
    return supplements[:limit]


def select_action_review(graph: dict[str, Any]) -> dict[str, str]:
    actions = []
    for node in graph.get("nodes", []):
        if not isinstance(node, dict) or node.get("type") != "action":
            continue
        metadata = node_metadata(node)
        actions.append((metadata.get("status", "open"), node))
    active = [node for status, node in actions if status == "active"]
    fallback = [node for _, node in actions]
    if active or fallback:
        node = (active or fallback)[0]
        metadata = node_metadata(node)
        return {
            "text": str(node.get("label", "")),
            "source": str(node.get("id", "")),
            "status": str(metadata.get("status", "open")),
            "prompt": f"过去 24 小时里，「{node.get('label')}」有没有真实发生？有效信号是什么？",
        }
    return {
        "text": "今天从一个知识点设计最小行动实验。",
        "source": "fallback",
        "status": "missing",
        "prompt": "选择一个最近最常出现的知识点，设计一个一周内能尝试的最小行动。",
    }


def graph_tags(graph: dict[str, Any]) -> Counter[str]:
    counts: Counter[str] = Counter()
    for node in graph.get("nodes", []):
        if not isinstance(node, dict):
            continue
        for tag in node.get("tags", []):
            if isinstance(tag, str):
                counts[tag] += 1
        discipline = node_metadata(node).get("discipline")
        if isinstance(discipline, list):
            for item in discipline:
                counts[str(item)] += 1
        elif isinstance(discipline, str):
            counts[discipline] += 1
    return counts


def select_book_recommendation(graph: dict[str, Any], focus: dict[str, str], fuzzy: list[dict[str, str]]) -> dict[str, Any]:
    recommendations = load_recommendations()
    if not recommendations:
        return {
            "title": "示例：提问的艺术",
            "author": "Demo",
            "why_read": "当前知识库还没有推荐书单；先用一本提问方法示例来补足追问质量。",
            "domain": ["提问", "学习方法", "知识管理"],
            "priority": "medium",
        }

    read_titles = {
        str(node.get("label", "")).strip()
        for node in graph.get("nodes", [])
        if isinstance(node, dict) and node.get("type") == "book"
    }
    node_ids = {
        str(node.get("id", ""))
        for node in graph.get("nodes", [])
        if isinstance(node, dict) and node.get("id")
    }
    tags = graph_tags(graph)
    fuzzy_text = " ".join([focus.get("text", ""), *[item["text"] for item in fuzzy]])
    scored: list[tuple[float, dict[str, Any]]] = []
    for item in recommendations:
        title = str(item.get("title", ""))
        score = 0.0
        if title in read_titles:
            score -= 60
        domains = item.get("domain", [])
        if isinstance(domains, str):
            domains = [domains]
        for domain in domains:
            score += tags.get(str(domain), 0) * 2.4
            if str(domain) in fuzzy_text:
                score += 4
        for node_id in item.get("connects_to_nodes", []) if isinstance(item.get("connects_to_nodes"), list) else []:
            if str(node_id) in node_ids:
                score += 5
            if str(node_id) == focus.get("source"):
                score += 8
        priority = str(item.get("priority", "medium"))
        score += {"high": 8, "medium": 4, "low": 0}.get(priority, 2)
        difficulty = str(item.get("difficulty", "medium"))
        score += {"intro": 2, "medium": 1, "hard": 0}.get(difficulty, 0)
        scored.append((score, item))
    scored.sort(key=lambda pair: (-pair[0], str(pair[1].get("title", ""))))
    if scored:
        return scored[0][1]
    return recommendations[0]


def build_ai_prompt(focus: dict[str, str], fuzzy: list[dict[str, str]], supplements: list[dict[str, str]], action: dict[str, str]) -> str:
    fuzzy_lines = "\n".join(f"- {item['text']}" for item in fuzzy) or "- 暂无明确模糊点，请从今天的主问题开始。"
    supplement_lines = "\n".join(f"- {item['text']}" for item in supplements) or "- 补一个现实案例和反例边界。"
    return (
        "请使用 personal-knowledge-growth skill 和我进行今日认知成长对话。\n"
        f"今天最该聊的问题：{focus['text']}\n\n"
        "请先帮我澄清这个问题，再围绕下面的模糊点追问：\n"
        f"{fuzzy_lines}\n\n"
        "如果适合入库，请最后整理成 Knowledge Package 草稿；如果不适合入库，只保留对话。\n"
        f"需要补充的知识：\n{supplement_lines}\n\n"
        f"行动回访：{action['prompt']}"
    )


def short_message(brief: dict[str, Any]) -> str:
    fuzzy = "\n".join(f"{index}. {item['text']}" for index, item in enumerate(brief["fuzzy_points"][:3], start=1))
    supplements = "\n".join(f"- {item['text']}" for item in brief["supplements"][:2])
    rec = brief["recommendation"]
    return (
        "今日认知成长对话\n\n"
        f"最该聊：\n{brief['focus_question']['text']}\n\n"
        f"模糊点：\n{fuzzy or '暂无明显模糊点'}\n\n"
        f"需要补充：\n{supplements or '补一个现实案例和反例边界'}\n\n"
        f"行动回访：\n{brief['action_review']['prompt']}\n\n"
        f"荐书：\n{rec.get('title', '暂无')} - {rec.get('why_read', '')}"
    )


def build_markdown(brief: dict[str, Any]) -> str:
    rec = brief["recommendation"]
    lines = [
        f"# 每日认知成长简报 {brief['date']}",
        "",
        "## 今日最该聊",
        "",
        f"- 问题：{brief['focus_question']['text']}",
        f"- 来源：`{brief['focus_question']['source']}`",
        f"- 原因：{brief['focus_question']['reason']}",
        "",
        "## 模糊点",
        "",
    ]
    if brief["fuzzy_points"]:
        for item in brief["fuzzy_points"]:
            lines.append(f"- {item['text']}（`{item['source']}`）")
    else:
        lines.append("- 暂无明显模糊点。")
    lines.extend(["", "## 需要补充", ""])
    for item in brief["supplements"]:
        lines.append(f"- {item['text']}（`{item['source']}`）")
    lines.extend(
        [
            "",
            "## 行动回访",
            "",
            f"- 行动：{brief['action_review']['text']}（`{brief['action_review']['source']}`）",
            f"- 状态：{brief['action_review']['status']}",
            f"- 回访问题：{brief['action_review']['prompt']}",
            "",
            "## 今日荐书",
            "",
            f"- 书名：{rec.get('title', '暂无')}",
            f"- 作者：{rec.get('author', '未知')}",
            f"- 推荐理由：{rec.get('why_read', '')}",
            f"- 领域：{', '.join(str(item) for item in rec.get('domain', [])) if isinstance(rec.get('domain'), list) else rec.get('domain', '')}",
            "",
            "## 给 AI 的开场白",
            "",
            "```text",
            brief["ai_prompt"],
            "```",
        ]
    )
    return "\n".join(lines).rstrip() + "\n"


def generate_brief(target_date: str) -> dict[str, Any]:
    graph = wiki.load_graph()
    docs = wiki.load_markdown_documents(graph)
    signals = extract_markdown_signals(docs)
    focus = select_focus_question(graph, docs, signals)
    fuzzy = select_fuzzy_points(graph, docs)
    supplements = select_supplements(graph, docs, signals)
    action = select_action_review(graph)
    recommendation = select_book_recommendation(graph, focus, fuzzy)
    ai_prompt = build_ai_prompt(focus, fuzzy, supplements, action)
    brief: dict[str, Any] = {
        "date": target_date,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "focus_question": focus,
        "fuzzy_points": fuzzy,
        "supplements": supplements,
        "action_review": action,
        "recommendation": recommendation,
        "ai_prompt": ai_prompt,
    }
    brief["message"] = short_message(brief)
    return brief


def write_outputs(brief: dict[str, Any]) -> dict[str, str]:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    markdown_path = REPORT_DIR / f"daily-growth-{brief['date']}.md"
    json_path = REPORT_DIR / f"daily-growth-{brief['date']}.json"
    latest_path = REPORT_DIR / "daily-growth-latest.json"
    markdown_path.write_text(build_markdown(brief), encoding="utf-8")
    json_text = json.dumps(brief, ensure_ascii=False, indent=2) + "\n"
    json_path.write_text(json_text, encoding="utf-8")
    latest_path.write_text(json_text, encoding="utf-8")
    return {
        "markdown": str(markdown_path.relative_to(ROOT)),
        "json": str(json_path.relative_to(ROOT)),
        "latest_json": str(latest_path.relative_to(ROOT)),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate today's active personal-growth brief.")
    parser.add_argument("--date", default=date.today().isoformat(), help="Brief date in YYYY-MM-DD format.")
    parser.add_argument("--dry-run", action="store_true", help="Print the brief without writing reports.")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of Markdown.")
    args = parser.parse_args()

    brief = generate_brief(args.date)
    if args.dry_run:
        if args.json:
            print(json.dumps(brief, ensure_ascii=False, indent=2))
        else:
            print(build_markdown(brief))
        return 0

    paths = write_outputs(brief)
    if args.json:
        output = dict(brief)
        output["paths"] = paths
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(f"[OK] Daily growth brief written: {paths['markdown']}")
        print(f"[OK] Latest JSON written: {paths['latest_json']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

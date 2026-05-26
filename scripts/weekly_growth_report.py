#!/usr/bin/env python3
"""Generate a weekly active-growth report from the local knowledge wiki."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import daily_growth_brief as daily
import query_knowledge_base as wiki


ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "knowledge" / "reports"


def parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise SystemExit(f"[FAIL] Invalid date, expected YYYY-MM-DD: {value}") from exc


def node_metadata(node: dict[str, Any]) -> dict[str, Any]:
    metadata = node.get("metadata")
    return metadata if isinstance(metadata, dict) else {}


def date_range(end_date: date) -> tuple[date, date]:
    return end_date - timedelta(days=6), end_date


def load_daily_reports(start: date, end: date) -> list[dict[str, Any]]:
    reports: list[dict[str, Any]] = []
    for path in sorted(REPORT_DIR.glob("daily-growth-*.json")):
        if path.name == "daily-growth-latest.json":
            continue
        report_date = path.stem.replace("daily-growth-", "")
        try:
            current = date.fromisoformat(report_date)
        except ValueError:
            continue
        if not start <= current <= end:
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict):
            reports.append(data)
    return reports


def dedupe_items(items: list[dict[str, Any]], key: str = "source", limit: int = 5) -> list[dict[str, Any]]:
    seen: set[str] = set()
    result: list[dict[str, Any]] = []
    for item in items:
        marker = str(item.get(key) or item.get("text") or item.get("label") or item)
        if marker in seen:
            continue
        seen.add(marker)
        result.append(item)
        if len(result) >= limit:
            break
    return result


def top_connected_nodes(graph: dict[str, Any], limit: int = 5) -> list[dict[str, Any]]:
    degree = daily.degree_map(graph)
    nodes = [node for node in graph.get("nodes", []) if isinstance(node, dict)]
    nodes.sort(key=lambda node: (-degree[str(node.get("id", ""))], str(node.get("label", ""))))
    return nodes[:limit]


def choose_weekly_theme(graph: dict[str, Any], daily_reports: list[dict[str, Any]]) -> dict[str, str]:
    recent_focus = [
        report.get("focus_question", {})
        for report in daily_reports
        if isinstance(report.get("focus_question"), dict)
    ]
    if recent_focus:
        counts = Counter(str(item.get("text", "")) for item in recent_focus if item.get("text"))
        theme_text, _ = counts.most_common(1)[0]
        return {
            "text": theme_text,
            "reason": "来自本周每日简报中最常出现的主问题",
            "source": "daily-growth-reports",
        }

    open_questions = wiki.open_questions(graph, limit=3)
    if open_questions:
        item = open_questions[0]
        return {
            "text": item["label"],
            "reason": "当前知识库里优先级最高的开放问题",
            "source": item["node_id"],
        }

    bridge_nodes = top_connected_nodes(graph, limit=1)
    if bridge_nodes:
        node = bridge_nodes[0]
        return {
            "text": f"围绕「{node.get('label')}」做一次应用复盘",
            "reason": "该节点连接度高，适合作为一周主线",
            "source": str(node.get("id", "")),
        }

    return {
        "text": "回顾本周最有牵引力的问题，并把它转成下周行动。",
        "reason": "暂无明显主线，使用复盘兜底",
        "source": "fallback",
    }


def collect_open_loops(graph: dict[str, Any], docs: dict[str, str], limit: int = 5) -> list[dict[str, str]]:
    loops: list[dict[str, str]] = []
    for item in wiki.open_questions(graph, limit=limit):
        loops.append(
            {
                "text": item["label"],
                "source": item["node_id"],
                "reason": item.get("status", "open"),
            }
        )
    for gap in wiki.knowledge_gaps(graph, docs, limit=limit * 2):
        loops.append(
            {
                "text": f"{gap['label']}：{gap['reason']}",
                "source": gap["node_id"],
                "reason": gap["reason"],
            }
        )
    return dedupe_items(loops, limit=limit)


def collect_actions(graph: dict[str, Any], limit: int = 3) -> list[dict[str, str]]:
    actions: list[dict[str, str]] = []
    for node in graph.get("nodes", []):
        if not isinstance(node, dict) or node.get("type") != "action":
            continue
        metadata = node_metadata(node)
        status = str(metadata.get("status", "open"))
        if status not in {"active", "open"}:
            continue
        label = str(node.get("label", ""))
        actions.append(
            {
                "text": label,
                "source": str(node.get("id", "")),
                "status": status,
                "prompt": f"过去一周里，「{label}」实际发生了几次？下周要继续、调整还是关闭？",
            }
        )
    actions.sort(key=lambda item: (item["status"] != "active", item["text"]))
    return actions[:limit]


def score_recommendations(graph: dict[str, Any], theme: dict[str, str], open_loops: list[dict[str, str]]) -> list[dict[str, Any]]:
    recommendations = daily.load_recommendations()
    if not recommendations:
        return []

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
    tags = daily.graph_tags(graph)
    context = " ".join([theme.get("text", ""), *[item["text"] for item in open_loops]])
    scored: list[tuple[float, dict[str, Any]]] = []
    for item in recommendations:
        title = str(item.get("title", ""))
        score = 0.0
        if title in read_titles:
            score -= 50
        domains = item.get("domain", [])
        if isinstance(domains, str):
            domains = [domains]
        for domain in domains:
            score += tags.get(str(domain), 0) * 2.0
            if str(domain) in context:
                score += 4
        connects = item.get("connects_to_nodes", [])
        if isinstance(connects, list):
            for node_id in connects:
                if str(node_id) in node_ids:
                    score += 4
                if str(node_id) in context or str(node_id) == theme.get("source"):
                    score += 6
        score += {"high": 8, "medium": 4, "low": 0}.get(str(item.get("priority", "medium")), 2)
        score += {"intro": 3, "medium": 1, "hard": 0}.get(str(item.get("difficulty", "medium")), 0)
        scored.append((score, item))
    scored.sort(key=lambda pair: (-pair[0], str(pair[1].get("title", ""))))
    return [item for _, item in scored[:2]]


def build_next_prompts(theme: dict[str, str], open_loops: list[dict[str, str]], actions: list[dict[str, str]]) -> list[str]:
    prompts = [
        f"围绕「{theme['text']}」，帮我区分事实、解释、价值判断和下一步行动。",
    ]
    if open_loops:
        prompts.append(f"请追问我：{open_loops[0]['text']}，并找出这里最模糊的概念。")
    if actions:
        prompts.append(actions[0]["prompt"])
    prompts.append("如果本周有值得入库的收获，请整理成 Knowledge Package 草稿。")
    return prompts[:3]


def short_message(report: dict[str, Any]) -> str:
    loops = "\n".join(
        f"{index}. {item['text']}" for index, item in enumerate(report["open_loops"][:4], start=1)
    )
    actions = "\n".join(f"- {item['prompt']}" for item in report["actions"][:2])
    books = "\n".join(
        f"{index}. {item.get('title', '暂无')} - {item.get('why_read', '')}"
        for index, item in enumerate(report["reading_recommendations"][:2], start=1)
    )
    prompts = "\n".join(f"- {item}" for item in report["next_ai_prompts"][:3])
    return (
        f"每周认知成长周报（{report['week_start']} 至 {report['week_end']}）\n\n"
        f"本周主线：\n{report['weekly_theme']['text']}\n"
        f"原因：{report['weekly_theme']['reason']}\n\n"
        f"开放回路 / 模糊点：\n{loops or '暂无明显开放回路'}\n\n"
        f"行动回访：\n{actions or '本周没有 active 行动，可从一个知识点设计最小实验。'}\n\n"
        f"推荐阅读：\n{books or '暂无推荐'}\n\n"
        f"接下来和 AI 聊：\n{prompts}"
    )


def build_markdown(report: dict[str, Any]) -> str:
    lines = [
        f"# 每周认知成长周报 {report['week_start']} 至 {report['week_end']}",
        "",
        "## 本周主线",
        "",
        f"- 主题：{report['weekly_theme']['text']}",
        f"- 来源：`{report['weekly_theme']['source']}`",
        f"- 原因：{report['weekly_theme']['reason']}",
        "",
        "## 开放回路 / 模糊点",
        "",
    ]
    if report["open_loops"]:
        for item in report["open_loops"]:
            lines.append(f"- {item['text']}（`{item['source']}`，{item['reason']}）")
    else:
        lines.append("- 暂无明显开放回路。")

    lines.extend(["", "## 行动回访", ""])
    if report["actions"]:
        for item in report["actions"]:
            lines.append(f"- {item['prompt']}（`{item['source']}`，{item['status']}）")
    else:
        lines.append("- 本周没有 active 行动，可从一个知识点设计最小实验。")

    lines.extend(["", "## 推荐阅读", ""])
    if report["reading_recommendations"]:
        for item in report["reading_recommendations"]:
            domains = item.get("domain", [])
            if isinstance(domains, list):
                domain_text = ", ".join(str(domain) for domain in domains)
            else:
                domain_text = str(domains)
            lines.append(f"- 《{item.get('title', '暂无')}》 / {item.get('author', '未知')}：{item.get('why_read', '')}")
            if domain_text:
                lines.append(f"  - 领域：{domain_text}")
    else:
        lines.append("- 暂无推荐。")

    lines.extend(["", "## 接下来和 AI 聊", ""])
    for item in report["next_ai_prompts"]:
        lines.append(f"- {item}")

    lines.extend(["", "## 图谱概况", ""])
    summary = report["graph_summary"]
    lines.append(f"- 节点数：{summary['nodes']}")
    lines.append(f"- 关系数：{summary['edges']}")
    lines.append(f"- 开放问题：{summary['open_questions']}")
    lines.append(f"- 知识缺口：{summary['gaps']}")

    return "\n".join(lines).rstrip() + "\n"


def generate_report(target_date: str) -> dict[str, Any]:
    end = parse_date(target_date)
    start, end = date_range(end)
    graph = wiki.load_graph()
    docs = wiki.load_markdown_documents(graph)
    daily_reports = load_daily_reports(start, end)
    theme = choose_weekly_theme(graph, daily_reports)
    open_loops = collect_open_loops(graph, docs)
    actions = collect_actions(graph)
    recommendations = score_recommendations(graph, theme, open_loops)
    next_prompts = build_next_prompts(theme, open_loops, actions)
    graph_summary = wiki.graph_summary()
    report: dict[str, Any] = {
        "week_start": start.isoformat(),
        "week_end": end.isoformat(),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "weekly_theme": theme,
        "open_loops": open_loops,
        "actions": actions,
        "reading_recommendations": recommendations,
        "next_ai_prompts": next_prompts,
        "daily_report_count": len(daily_reports),
        "graph_summary": {
            "nodes": graph_summary["nodes"],
            "edges": graph_summary["edges"],
            "open_questions": len(graph_summary["open_questions"]),
            "gaps": len(graph_summary["gaps"]),
        },
    }
    report["message"] = short_message(report)
    return report


def write_outputs(report: dict[str, Any]) -> dict[str, str]:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    markdown_path = REPORT_DIR / f"weekly-growth-{report['week_end']}.md"
    json_path = REPORT_DIR / f"weekly-growth-{report['week_end']}.json"
    latest_path = REPORT_DIR / "weekly-growth-latest.json"
    markdown_path.write_text(build_markdown(report), encoding="utf-8")
    json_text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    json_path.write_text(json_text, encoding="utf-8")
    latest_path.write_text(json_text, encoding="utf-8")
    return {
        "markdown": str(markdown_path.relative_to(ROOT)),
        "json": str(json_path.relative_to(ROOT)),
        "latest_json": str(latest_path.relative_to(ROOT)),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a weekly active personal-growth report.")
    parser.add_argument("--date", default=date.today().isoformat(), help="Week end date in YYYY-MM-DD format.")
    parser.add_argument("--dry-run", action="store_true", help="Print the report without writing files.")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of Markdown.")
    args = parser.parse_args()

    report = generate_report(args.date)
    if args.dry_run:
        if args.json:
            print(json.dumps(report, ensure_ascii=False, indent=2))
        else:
            print(build_markdown(report))
        return 0

    paths = write_outputs(report)
    if args.json:
        output = dict(report)
        output["paths"] = paths
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(f"[OK] Weekly growth report written: {paths['markdown']}")
        print(f"[OK] Latest JSON written: {paths['latest_json']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

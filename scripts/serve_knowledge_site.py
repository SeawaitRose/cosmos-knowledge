#!/usr/bin/env python3
"""Serve and manage the local personal knowledge website."""

from __future__ import annotations

import argparse
import functools
import http.server
import importlib.util
import json
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover - Python 3.8 fallback
    ZoneInfo = None  # type: ignore[assignment]


DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765
BEIJING_TZ_NAME = "Asia/Shanghai"
ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT / "scripts"
GRAPH_PATH = ROOT / "knowledge" / "data" / "graph.json"
LIFECYCLE_PATH = ROOT / "knowledge" / "data" / "cosmos-lifecycle.json"
NOTIFICATION_CONFIG_PATH = ROOT / "knowledge" / "profile" / "notification-config.local.json"
DEMO_KNOWLEDGE_DIR = ROOT / "examples" / "demo-knowledge"
GRAPH_VALIDATOR_PATH = ROOT / "skills" / "personal-knowledge-growth" / "scripts" / "validate_graph.py"

ALLOWED_DOCUMENT_PREFIXES = (
    "knowledge/books/",
    "knowledge/cards/",
    "knowledge/imports/",
)
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
ALLOWED_COSMOS_ROLES = {"", "galaxy", "star", "planet", "bridge", "comet"}
WEEKDAY_NAMES = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}

sys.path.insert(0, str(SCRIPTS_DIR))

import daily_growth_brief  # noqa: E402
import validate_knowledge_package  # noqa: E402
import weekly_growth_report  # noqa: E402


def beijing_tz() -> timezone:
    if ZoneInfo is not None:
        return ZoneInfo(BEIJING_TZ_NAME)  # type: ignore[return-value]
    return timezone.utc


def now_beijing() -> datetime:
    return datetime.now(beijing_tz())


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def beijing_iso() -> str:
    return now_beijing().isoformat(timespec="seconds")


def read_json(path: Path, fallback: Any = None) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return fallback


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def empty_graph() -> dict[str, Any]:
    return {"version": 1, "updated_at": date.today().isoformat(), "nodes": [], "edges": []}


def empty_lifecycle() -> dict[str, Any]:
    return {"version": 1, "updated_at": date.today().isoformat(), "records": {}, "syntheses": []}


def ensure_knowledge_base(mode: str = "demo") -> None:
    if GRAPH_PATH.exists() and LIFECYCLE_PATH.exists():
        return
    if mode == "blank" or not DEMO_KNOWLEDGE_DIR.exists():
        write_json(GRAPH_PATH, empty_graph())
        write_json(LIFECYCLE_PATH, empty_lifecycle())
        (ROOT / "knowledge" / "books").mkdir(parents=True, exist_ok=True)
        (ROOT / "knowledge" / "cards").mkdir(parents=True, exist_ok=True)
        (ROOT / "knowledge" / "imports").mkdir(parents=True, exist_ok=True)
        (ROOT / "knowledge" / "reports").mkdir(parents=True, exist_ok=True)
        return
    copy_demo_knowledge()


def copy_demo_knowledge() -> None:
    target = ROOT / "knowledge"
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(DEMO_KNOWLEDGE_DIR, target)


def reset_blank_knowledge() -> None:
    target = ROOT / "knowledge"
    if target.exists():
        shutil.rmtree(target)
    write_json(GRAPH_PATH, empty_graph())
    write_json(LIFECYCLE_PATH, empty_lifecycle())
    for relative in ("books", "cards", "imports", "index", "profile", "reports", "spec"):
        (ROOT / "knowledge" / relative).mkdir(parents=True, exist_ok=True)
    write_json(ROOT / "knowledge" / "index" / "book-recommendations.json", {"books": []})
    write_json(ROOT / "knowledge" / "reports" / "daily-growth-latest.json", {})
    write_json(ROOT / "knowledge" / "reports" / "weekly-growth-latest.json", {})


def is_safe_relative_path(path: str) -> bool:
    if not isinstance(path, str) or not path.strip():
        return False
    if path.startswith("/") or "\\" in path or ".." in path or "//" in path:
        return False
    allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-./")
    return all(char in allowed for char in path)


def safe_markdown_path(path: str) -> Path:
    if not is_safe_relative_path(path) or not path.endswith(".md") or not path.startswith(ALLOWED_DOCUMENT_PREFIXES):
        raise ValueError(f"Unsafe knowledge Markdown path: {path}")
    target = (ROOT / path).resolve()
    if ROOT not in target.parents:
        raise ValueError(f"Path escapes project root: {path}")
    return target


def import_graph_validator():
    spec = importlib.util.spec_from_file_location("knowledge_graph_validator", GRAPH_VALIDATOR_PATH)
    if spec is None or spec.loader is None:
        raise ValueError(f"Cannot load graph validator: {GRAPH_VALIDATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_graph(graph: dict[str, Any]) -> None:
    try:
        import_graph_validator().validate_graph(graph)
    except SystemExit as exc:
        raise ValueError(f"graph validation failed with exit code {exc.code}") from exc


def load_graph() -> dict[str, Any]:
    ensure_knowledge_base()
    graph = read_json(GRAPH_PATH, empty_graph())
    if not isinstance(graph, dict):
        raise ValueError("knowledge/data/graph.json must be an object")
    graph.setdefault("version", 1)
    graph.setdefault("updated_at", "")
    graph.setdefault("nodes", [])
    graph.setdefault("edges", [])
    return graph


def save_graph(graph: dict[str, Any]) -> None:
    graph["updated_at"] = date.today().isoformat()
    validate_graph(graph)
    write_json(GRAPH_PATH, graph)


def load_lifecycle() -> dict[str, Any]:
    ensure_knowledge_base()
    lifecycle = read_json(LIFECYCLE_PATH, empty_lifecycle())
    if not isinstance(lifecycle, dict):
        raise ValueError("knowledge/data/cosmos-lifecycle.json must be an object")
    lifecycle.setdefault("version", 1)
    lifecycle.setdefault("updated_at", "")
    lifecycle.setdefault("records", {})
    lifecycle.setdefault("syntheses", [])
    return lifecycle


def save_lifecycle(lifecycle: dict[str, Any]) -> None:
    if not isinstance(lifecycle.get("records"), dict):
        raise ValueError("lifecycle.records must be an object")
    if not isinstance(lifecycle.get("syntheses"), list):
        raise ValueError("lifecycle.syntheses must be a list")
    lifecycle["version"] = 1
    lifecycle["updated_at"] = date.today().isoformat()
    write_json(LIFECYCLE_PATH, lifecycle)


def current_graph_ids() -> tuple[set[str], set[str]]:
    graph = load_graph()
    nodes = graph.get("nodes") if isinstance(graph.get("nodes"), list) else []
    edges = graph.get("edges") if isinstance(graph.get("edges"), list) else []
    return (
        {node.get("id") for node in nodes if isinstance(node, dict) and isinstance(node.get("id"), str)},
        {edge.get("id") for edge in edges if isinstance(edge, dict) and isinstance(edge.get("id"), str)},
    )


def sanitize_node(node: dict[str, Any]) -> dict[str, Any]:
    required = ("id", "type", "label", "summary", "confidence")
    for key in required:
        if not isinstance(node.get(key), str) or not node[key].strip():
            raise ValueError(f"node.{key} must be a non-empty string")
    if node["type"] not in ALLOWED_NODE_TYPES:
        raise ValueError(f"Invalid node type: {node['type']}")
    if node["confidence"] not in ALLOWED_CONFIDENCE:
        raise ValueError(f"Invalid confidence: {node['confidence']}")
    if not node["id"].startswith(f"{node['type']}:"):
        raise ValueError(f"Node id should start with {node['type']}:")
    metadata = node.get("metadata")
    node["metadata"] = metadata if isinstance(metadata, dict) else {}
    cosmos = node["metadata"].get("cosmos")
    cosmos = cosmos if isinstance(cosmos, dict) else {}
    role = cosmos.get("role", "")
    if role not in ALLOWED_COSMOS_ROLES:
        raise ValueError(f"Invalid cosmos role: {role}")
    if role == "galaxy" and node["type"] != "theme":
        raise ValueError("cosmos.role galaxy is reserved for theme nodes")
    if "tags" in node and not isinstance(node["tags"], list):
        raise ValueError("node.tags must be a list")
    if isinstance(node.get("tags"), list):
        node["tags"] = [str(tag).strip() for tag in node["tags"] if str(tag).strip()]
    return node


def sanitize_edge(edge: dict[str, Any], node_ids: set[str]) -> dict[str, Any]:
    required = ("id", "type", "from", "to", "confidence")
    for key in required:
        if not isinstance(edge.get(key), str) or not edge[key].strip():
            raise ValueError(f"edge.{key} must be a non-empty string")
    if not edge["id"].startswith("edge:"):
        raise ValueError("edge.id should start with edge:")
    if edge["type"] not in ALLOWED_EDGE_TYPES:
        raise ValueError(f"Invalid edge type: {edge['type']}")
    if edge["confidence"] not in ALLOWED_CONFIDENCE:
        raise ValueError(f"Invalid confidence: {edge['confidence']}")
    if edge["from"] not in node_ids or edge["to"] not in node_ids:
        raise ValueError("edge endpoints must exist in graph nodes")
    metadata = edge.get("metadata")
    edge["metadata"] = metadata if isinstance(metadata, dict) else {}
    return edge


def mask_webhook(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 12:
        return "*" * len(value)
    return f"{value[:8]}...{value[-6:]}"


def default_notification_config() -> dict[str, Any]:
    return {
        "timezone": BEIJING_TZ_NAME,
        "daily_enabled": False,
        "daily_time": "09:00",
        "weekly_enabled": False,
        "weekly_day": "sunday",
        "weekly_time": "18:00",
        "feishu_webhook": "",
        "last_daily_sent_date": "",
        "last_weekly_sent_week_end": "",
    }


def load_notification_config(include_secret: bool = False) -> dict[str, Any]:
    config = default_notification_config()
    raw = read_json(NOTIFICATION_CONFIG_PATH, {})
    if isinstance(raw, dict):
        config.update(raw)
    webhook = str(config.get("feishu_webhook") or config.get("lark_webhook") or "")
    config["has_webhook"] = bool(webhook)
    config["webhook_masked"] = mask_webhook(webhook)
    if include_secret:
        config["feishu_webhook"] = webhook
    else:
        config.pop("feishu_webhook", None)
        config.pop("lark_webhook", None)
    return config


def save_notification_config(update: dict[str, Any]) -> dict[str, Any]:
    current = load_notification_config(include_secret=True)
    for key in ("daily_enabled", "weekly_enabled"):
        if key in update:
            current[key] = bool(update[key])
    for key in ("daily_time", "weekly_time"):
        if key in update:
            current[key] = normalize_time_string(str(update[key]))
    if "weekly_day" in update:
        day = str(update["weekly_day"]).lower()
        if day not in WEEKDAY_NAMES:
            raise ValueError("weekly_day must be monday..sunday")
        current["weekly_day"] = day
    current["timezone"] = BEIJING_TZ_NAME
    if "feishu_webhook" in update:
        current["feishu_webhook"] = str(update["feishu_webhook"]).strip()
    serializable = {key: value for key, value in current.items() if key not in {"has_webhook", "webhook_masked"}}
    write_json(NOTIFICATION_CONFIG_PATH, serializable)
    return load_notification_config()


def normalize_time_string(value: str) -> str:
    parts = value.strip().split(":")
    if len(parts) != 2:
        raise ValueError("time must use HH:MM")
    hour = int(parts[0])
    minute = int(parts[1])
    if hour < 0 or hour > 23 or minute < 0 or minute > 59:
        raise ValueError("time must use HH:MM")
    return f"{hour:02d}:{minute:02d}"


def send_feishu_text(webhook: str, text: str, timeout: int = 20) -> dict[str, Any]:
    if not webhook:
        raise ValueError("Missing Feishu/Lark webhook")
    payload = json.dumps({"msg_type": "text", "content": {"text": text}}, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        webhook,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.URLError as exc:
        raise ValueError(f"Feishu request failed: {exc}") from exc
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {"raw": raw}
    return data if isinstance(data, dict) else {"raw": raw}


def report_for_kind(kind: str, target_date: str | None = None, write: bool = False) -> dict[str, Any]:
    target_date = target_date or date.today().isoformat()
    if kind == "daily":
        report = daily_growth_brief.generate_brief(target_date)
        paths = daily_growth_brief.write_outputs(report) if write else {}
    elif kind == "weekly":
        report = weekly_growth_report.generate_report(target_date)
        paths = weekly_growth_report.write_outputs(report) if write else {}
    else:
        raise ValueError("kind must be daily or weekly")
    return {"report": report, "paths": paths}


def send_report(kind: str, webhook: str, target_date: str | None = None, write: bool = False) -> dict[str, Any]:
    payload = report_for_kind(kind, target_date, write=write)
    report = payload["report"]
    response = send_feishu_text(webhook, report.get("message") or json.dumps(report, ensure_ascii=False))
    payload["response"] = response
    payload["sent"] = response.get("StatusCode") == 0 or response.get("code") == 0 or response.get("msg") == "success"
    return payload


def next_send_times(config: dict[str, Any]) -> dict[str, str]:
    now = now_beijing()
    result: dict[str, str] = {}
    daily_time = str(config.get("daily_time") or "09:00")
    weekly_time = str(config.get("weekly_time") or "18:00")
    daily_hour, daily_minute = [int(part) for part in normalize_time_string(daily_time).split(":")]
    next_daily = now.replace(hour=daily_hour, minute=daily_minute, second=0, microsecond=0)
    if next_daily <= now:
        next_daily = next_daily.replace(day=next_daily.day)  # keep type stable
        next_daily = next_daily + timedelta_days(1)
    result["daily"] = next_daily.isoformat(timespec="seconds")
    weekly_day = WEEKDAY_NAMES.get(str(config.get("weekly_day") or "sunday").lower(), 6)
    weekly_hour, weekly_minute = [int(part) for part in normalize_time_string(weekly_time).split(":")]
    days_ahead = (weekly_day - now.weekday()) % 7
    next_weekly = (now + timedelta_days(days_ahead)).replace(hour=weekly_hour, minute=weekly_minute, second=0, microsecond=0)
    if next_weekly <= now:
        next_weekly = next_weekly + timedelta_days(7)
    result["weekly"] = next_weekly.isoformat(timespec="seconds")
    return result


def timedelta_days(days: int):
    from datetime import timedelta

    return timedelta(days=days)


class NotificationScheduler:
    def __init__(self) -> None:
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, name="knowledge-notification-scheduler", daemon=True)

    def start(self) -> None:
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        self._thread.join(timeout=2)

    def _run(self) -> None:
        while not self._stop.wait(30):
            try:
                self.tick()
            except Exception as exc:  # pragma: no cover - defensive runtime logging
                print(f"[knowledge-site] notification scheduler skipped: {exc}", file=sys.stderr)

    def tick(self) -> None:
        config = load_notification_config(include_secret=True)
        webhook = str(config.get("feishu_webhook") or "")
        if not webhook:
            return
        now = now_beijing()
        today = now.date().isoformat()
        current_time = now.strftime("%H:%M")
        if config.get("daily_enabled") and current_time == normalize_time_string(str(config.get("daily_time") or "09:00")):
            if config.get("last_daily_sent_date") != today:
                send_report("daily", webhook, today, write=True)
                config["last_daily_sent_date"] = today
                write_json(NOTIFICATION_CONFIG_PATH, {key: value for key, value in config.items() if key not in {"has_webhook", "webhook_masked"}})
        weekly_day = WEEKDAY_NAMES.get(str(config.get("weekly_day") or "sunday").lower(), 6)
        if config.get("weekly_enabled") and now.weekday() == weekly_day and current_time == normalize_time_string(str(config.get("weekly_time") or "18:00")):
            week_end = today
            if config.get("last_weekly_sent_week_end") != week_end:
                send_report("weekly", webhook, week_end, write=True)
                config["last_weekly_sent_week_end"] = week_end
                write_json(NOTIFICATION_CONFIG_PATH, {key: value for key, value in config.items() if key not in {"has_webhook", "webhook_masked"}})


class KnowledgeSiteHandler(http.server.SimpleHTTPRequestHandler):
    root = ROOT

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/":
            self.send_response(302)
            self.send_header("Location", "/site/")
            self.end_headers()
            return
        if self.path.startswith("/api/"):
            self.handle_api("GET")
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path.startswith("/api/"):
            self.handle_api("POST")
            return
        self.send_error(404)

    def do_PUT(self) -> None:
        if self.path.startswith("/api/"):
            self.handle_api("PUT")
            return
        self.send_error(404)

    def do_DELETE(self) -> None:
        if self.path.startswith("/api/"):
            self.handle_api("DELETE")
            return
        self.send_error(404)

    def handle_api(self, method: str) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        try:
            if method == "GET" and path == "/api/status":
                graph = load_graph()
                config = load_notification_config()
                self.send_json({
                    "ok": True,
                    "server_now": now_iso(),
                    "beijing_now": beijing_iso(),
                    "knowledge_ready": GRAPH_PATH.exists(),
                    "graph": {"nodes": len(graph.get("nodes", [])), "edges": len(graph.get("edges", [])), "updated_at": graph.get("updated_at", "")},
                    "notification": {**config, "next_send_times": next_send_times(config)},
                })
            elif method == "GET" and path == "/api/time":
                config = load_notification_config()
                self.send_json({"server_now": now_iso(), "beijing_now": beijing_iso(), "timezone": BEIJING_TZ_NAME, "next_send_times": next_send_times(config)})
            elif method == "GET" and path == "/api/graph":
                self.send_json(load_graph())
            elif method == "PUT" and path == "/api/graph":
                graph = self.read_json_body()
                if not isinstance(graph, dict):
                    raise ValueError("graph body must be an object")
                save_graph(graph)
                self.send_json({"ok": True, "graph": load_graph()})
            elif method == "GET" and path == "/api/lifecycle":
                self.send_json(load_lifecycle())
            elif method == "PUT" and path == "/api/lifecycle":
                lifecycle = self.read_json_body()
                if not isinstance(lifecycle, dict):
                    raise ValueError("lifecycle body must be an object")
                save_lifecycle(lifecycle)
                self.send_json({"ok": True, "lifecycle": load_lifecycle()})
            elif method == "GET" and path == "/api/document":
                relative = (query.get("path") or [""])[0]
                target = safe_markdown_path(relative)
                self.send_json({"path": relative, "content_markdown": target.read_text(encoding="utf-8") if target.exists() else ""})
            elif method == "PUT" and path == "/api/document":
                body = self.read_json_body()
                target = safe_markdown_path(str(body.get("path") or ""))
                content = str(body.get("content_markdown") or "")
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content.rstrip() + "\n", encoding="utf-8")
                self.send_json({"ok": True, "path": str(target.relative_to(ROOT))})
            elif method == "POST" and path == "/api/knowledge-package/merge":
                self.send_json(self.merge_package(self.read_json_body()))
            elif method == "POST" and path == "/api/nodes/update":
                self.send_json(self.update_node(self.read_json_body()))
            elif method == "POST" and path == "/api/nodes/delete":
                self.send_json(self.delete_node(self.read_json_body()))
            elif method == "POST" and path == "/api/edges/update":
                self.send_json(self.update_edge(self.read_json_body()))
            elif method == "POST" and path == "/api/edges/delete":
                self.send_json(self.delete_edge(self.read_json_body()))
            elif method == "POST" and path == "/api/lifecycle/update":
                self.send_json(self.update_lifecycle_record(self.read_json_body()))
            elif method == "GET" and path == "/api/notification":
                config = load_notification_config()
                self.send_json({**config, "next_send_times": next_send_times(config), "beijing_now": beijing_iso()})
            elif method == "PUT" and path == "/api/notification":
                config = save_notification_config(self.read_json_body())
                self.send_json({**config, "next_send_times": next_send_times(config), "beijing_now": beijing_iso()})
            elif method == "POST" and path == "/api/notification/test":
                body = self.read_json_body()
                config = load_notification_config(include_secret=True)
                webhook = str(body.get("feishu_webhook") or config.get("feishu_webhook") or "")
                result = send_report(str(body.get("kind") or "daily"), webhook, write=False)
                self.send_json(result)
            elif method == "POST" and path == "/api/reports/generate":
                body = self.read_json_body()
                self.send_json(report_for_kind(str(body.get("kind") or "daily"), body.get("date"), bool(body.get("write"))))
            elif method == "POST" and path == "/api/examples/reset":
                mode = str(self.read_json_body().get("mode") or "demo")
                if mode == "blank":
                    reset_blank_knowledge()
                elif mode == "demo":
                    copy_demo_knowledge()
                else:
                    raise ValueError("mode must be demo or blank")
                self.send_json({"ok": True, "mode": mode, "graph": load_graph()})
            else:
                self.send_json({"ok": False, "error": "Unknown API endpoint"}, status=404)
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, status=400)

    def merge_package(self, body: dict[str, Any]) -> dict[str, Any]:
        package = body.get("package")
        if not isinstance(package, dict):
            raise ValueError("package must be an object")
        with tempfile.NamedTemporaryFile("w", suffix=".json", encoding="utf-8", delete=False) as handle:
            json.dump(package, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            temp_path = Path(handle.name)
        args = [sys.executable, "-B", str(SCRIPTS_DIR / "ingest_knowledge_package.py"), str(temp_path)]
        if body.get("dry_run"):
            args.append("--dry-run")
        if body.get("overwrite"):
            args.append("--overwrite")
        try:
            result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True, check=False)
        finally:
            temp_path.unlink(missing_ok=True)
        return {
            "ok": result.returncode == 0,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "graph": load_graph() if result.returncode == 0 and not body.get("dry_run") else None,
        }

    def update_node(self, body: dict[str, Any]) -> dict[str, Any]:
        node = sanitize_node(dict(body.get("node") or {}))
        graph = load_graph()
        nodes = graph.get("nodes") if isinstance(graph.get("nodes"), list) else []
        replaced = False
        for index, current in enumerate(nodes):
            if isinstance(current, dict) and current.get("id") == node["id"]:
                nodes[index] = node
                replaced = True
                break
        if not replaced:
            nodes.append(node)
        graph["nodes"] = nodes
        save_graph(graph)
        return {"ok": True, "node": node, "graph": load_graph()}

    def delete_node(self, body: dict[str, Any]) -> dict[str, Any]:
        node_id = str(body.get("id") or "")
        if not node_id:
            raise ValueError("id is required")
        graph = load_graph()
        graph["nodes"] = [node for node in graph.get("nodes", []) if not (isinstance(node, dict) and node.get("id") == node_id)]
        graph["edges"] = [edge for edge in graph.get("edges", []) if not (isinstance(edge, dict) and (edge.get("from") == node_id or edge.get("to") == node_id))]
        save_graph(graph)
        lifecycle = load_lifecycle()
        lifecycle.get("records", {}).pop(node_id, None)
        lifecycle["syntheses"] = [
            item for item in lifecycle.get("syntheses", [])
            if isinstance(item, dict)
            and item.get("theory_node_id") != node_id
            and node_id not in (item.get("predecessor_node_ids") or [])
        ]
        save_lifecycle(lifecycle)
        return {"ok": True, "id": node_id, "graph": load_graph(), "lifecycle": load_lifecycle()}

    def update_edge(self, body: dict[str, Any]) -> dict[str, Any]:
        graph = load_graph()
        node_ids = {node.get("id") for node in graph.get("nodes", []) if isinstance(node, dict)}
        edge = sanitize_edge(dict(body.get("edge") or {}), node_ids)
        edges = graph.get("edges") if isinstance(graph.get("edges"), list) else []
        replaced = False
        for index, current in enumerate(edges):
            if isinstance(current, dict) and current.get("id") == edge["id"]:
                edges[index] = edge
                replaced = True
                break
        if not replaced:
            edges.append(edge)
        graph["edges"] = edges
        save_graph(graph)
        return {"ok": True, "edge": edge, "graph": load_graph()}

    def delete_edge(self, body: dict[str, Any]) -> dict[str, Any]:
        edge_id = str(body.get("id") or "")
        if not edge_id:
            raise ValueError("id is required")
        graph = load_graph()
        graph["edges"] = [edge for edge in graph.get("edges", []) if not (isinstance(edge, dict) and edge.get("id") == edge_id)]
        save_graph(graph)
        return {"ok": True, "id": edge_id, "graph": load_graph()}

    def update_lifecycle_record(self, body: dict[str, Any]) -> dict[str, Any]:
        node_id = str(body.get("node_id") or "")
        record = body.get("record")
        if not node_id or not isinstance(record, dict):
            raise ValueError("node_id and record are required")
        graph = load_graph()
        node_ids = {node.get("id") for node in graph.get("nodes", []) if isinstance(node, dict)}
        if node_id not in node_ids:
            raise ValueError("node_id does not exist")
        lifecycle = load_lifecycle()
        lifecycle.setdefault("records", {})[node_id] = record
        save_lifecycle(lifecycle)
        return {"ok": True, "node_id": node_id, "lifecycle": load_lifecycle()}

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        data = json.loads(raw or "{}")
        if not isinstance(data, dict):
            raise ValueError("request body must be a JSON object")
        return data

    def send_json(self, value: Any, status: int = 200) -> None:
        raw = json.dumps(value, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, format: str, *args: object) -> None:
        sys.stderr.write("[knowledge-site] " + (format % args) + "\n")


class ReusableTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def serve(host: str, port: int, open_browser: bool, init_mode: str) -> None:
    if init_mode == "demo" and not (ROOT / "knowledge").exists():
        copy_demo_knowledge()
    elif init_mode == "blank" and not (ROOT / "knowledge").exists():
        reset_blank_knowledge()
    else:
        ensure_knowledge_base()

    handler = functools.partial(KnowledgeSiteHandler, directory=str(ROOT))
    scheduler = NotificationScheduler()
    scheduler.start()

    last_error: OSError | None = None
    for candidate_port in range(port, port + 20):
        try:
            with ReusableTCPServer((host, candidate_port), handler) as httpd:
                url = f"http://{host}:{candidate_port}/site/"
                print(f"Serving personal knowledge site at {url}")
                print("Management API available under /api/.")
                print("Press Ctrl+C to stop.")
                if open_browser:
                    webbrowser.open(url)
                try:
                    httpd.serve_forever()
                finally:
                    scheduler.stop()
                return
        except OSError as exc:
            last_error = exc
            continue
        except KeyboardInterrupt:
            print("\nStopped personal knowledge site.")
            scheduler.stop()
            return

    scheduler.stop()
    raise SystemExit(f"Could not bind a local port starting at {port}: {last_error}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve and manage the local personal knowledge website.")
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"Host to bind. Default: {DEFAULT_HOST}")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port to try first. Default: {DEFAULT_PORT}")
    parser.add_argument("--open", action="store_true", help="Open the site in the default browser.")
    parser.add_argument("--init", choices=["demo", "blank"], default="demo", help="Initialize missing knowledge/ from demo or blank data.")
    args = parser.parse_args()

    serve(args.host, args.port, args.open, args.init)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

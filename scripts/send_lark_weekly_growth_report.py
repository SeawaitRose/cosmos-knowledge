#!/usr/bin/env python3
"""Generate the weekly growth report and send it to a Feishu/Lark bot."""

from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path
from typing import Any

import weekly_growth_report


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "knowledge" / "profile" / "notification-config.local.json"


def load_webhook(args: argparse.Namespace) -> str:
    if args.webhook:
        return args.webhook
    env_value = os.environ.get(args.webhook_env)
    if env_value:
        return env_value
    config_path = Path(args.config)
    if config_path.exists():
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise SystemExit(f"[FAIL] Invalid notification config: {config_path}") from exc
        if isinstance(config, dict):
            value = config.get("feishu_webhook") or config.get("lark_webhook")
            if value:
                return str(value)
    raise SystemExit(
        "[FAIL] Missing Feishu webhook. Pass --webhook, set FEISHU_BOT_WEBHOOK, "
        f"or create {DEFAULT_CONFIG.relative_to(ROOT)}."
    )


def send_text(webhook: str, text: str, timeout: int = 20) -> dict[str, Any]:
    payload = json.dumps(
        {"msg_type": "text", "content": {"text": text}},
        ensure_ascii=False,
    ).encode("utf-8")
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
        raise SystemExit(f"[FAIL] Feishu request failed: {exc}") from exc
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {"raw": raw}
    return data if isinstance(data, dict) else {"raw": raw}


def main() -> int:
    parser = argparse.ArgumentParser(description="Send a weekly growth report to a Feishu/Lark bot.")
    parser.add_argument("--date", default=date.today().isoformat(), help="Week end date in YYYY-MM-DD format.")
    parser.add_argument("--webhook", help="Feishu/Lark bot webhook URL.")
    parser.add_argument("--webhook-env", default="FEISHU_BOT_WEBHOOK", help="Environment variable containing webhook URL.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="Local notification config JSON path.")
    parser.add_argument("--dry-run", action="store_true", help="Generate and print without sending.")
    parser.add_argument("--json", action="store_true", help="Print JSON output.")
    args = parser.parse_args()

    report = weekly_growth_report.generate_report(args.date)

    if args.dry_run:
        output = {"sent": False, "paths": {}, "report": report}
        if args.json:
            print(json.dumps(output, ensure_ascii=False, indent=2))
        else:
            print(report["message"])
        return 0

    paths = weekly_growth_report.write_outputs(report)
    webhook = load_webhook(args)
    response = send_text(webhook, report["message"])
    ok = response.get("StatusCode") == 0 or response.get("code") == 0 or response.get("msg") == "success"
    output = {"sent": ok, "paths": paths, "response": response}
    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(f"[OK] Weekly report written: {paths['markdown']}")
        print(f"[OK] Feishu response: {json.dumps(response, ensure_ascii=False)}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

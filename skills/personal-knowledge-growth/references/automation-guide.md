# Automation Guide

Use this reference when generating daily active-growth reminders, fuzzy-point lists, action reviews, or reading recommendations.

## Purpose

The automation layer should make the knowledge base主动一点: it nudges the user into one useful AI conversation per day. It should not spam, auto-ingest, or pretend certainty. The first version is local-only and writes reports for the website.

## Daily Brief Command

Run:

```bash
python3 -B scripts/daily_growth_brief.py
```

This writes:

- `knowledge/reports/daily-growth-YYYY-MM-DD.md`
- `knowledge/reports/daily-growth-YYYY-MM-DD.json`
- `knowledge/reports/daily-growth-latest.json`

Use `--dry-run` to preview without writing.

## Weekly Report Command

Run:

```bash
python3 -B scripts/weekly_growth_report.py
```

This writes:

- `knowledge/reports/weekly-growth-YYYY-MM-DD.md`
- `knowledge/reports/weekly-growth-YYYY-MM-DD.json`
- `knowledge/reports/weekly-growth-latest.json`

Use the weekly report when the user wants a broader reminder about the current learning arc, open loops, action review, and what to read next.

## Daily Brief Content

Each brief should include:

- 今日最该聊: one question or node, not a long list.
- 模糊点: 1-3 items from low/medium confidence, open questions, weak relations, or missing boundaries.
- 需要补充: 1-2 concrete improvements such as source, counterexample, review question, action experiment, or real example.
- 行动回访: one active action node or one proposed minimum action.
- 今日荐书: one main recommendation based on knowledge gaps plus `knowledge/profile/growth-roadmap.md`.
- 给 AI 的开场白: a copy-ready prompt for the next conversation.

## Fuzzy-Point Rules

Treat a knowledge item as fuzzy when:

- It is a `question` node that is still open.
- Its confidence is `low` or `medium`.
- It has only weak `reminds_of` relationships.
- Its card lacks a clear boundary,反例, or failure case.
- It has no review question and no action hook.
- It appears in multiple themes but has no stable definition.

## Book Recommendation Rules

Recommend based on:

- Current open questions.
- High-frequency tags and graph bridge nodes.
- The user's growth roadmap.
- Books that connect to existing nodes but fill a missing layer.

Avoid:

- Recommending many books at once.
- Recommending already-read books unless rereading solves a specific gap.
- Recommending based only on popularity.

## Delivery Boundary

Daily and weekly reports should remain local-first. Delivery adapters consume generated report JSON and should stay separate from the knowledge logic.

The current Feishu/Lark weekly adapter is:

- `scripts/send_lark_weekly_growth_report.py`

It reads a webhook from `knowledge/profile/notification-config.local.json`, `FEISHU_BOT_WEBHOOK`, or `--webhook`. Keep local webhook config out of version control.

Future adapters can follow the same shape:

- `scripts/send_lark_brief.py`
- `scripts/send_dingtalk_brief.py`

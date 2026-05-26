# Reading Output Schema

This file is the reading-specific output schema. For non-book cards and the full graph type system, use `personal-knowledge-schema.md`.

Default language: Chinese.

Use stable IDs so future website code can link data safely. Prefer lowercase kebab-case IDs:

- Book: `book:<slug>`
- Concept: `concept:<slug>`
- Method: `method:<slug>`
- Claim: `claim:<slug>`
- Example: `example:<slug>`
- Action: `action:<slug>`

Use pinyin, concise English, or mixed readable slugs. Stability matters more than perfect translation.

## Book Markdown

Path: `knowledge/books/<book-slug>.md`

Template:

```markdown
# 《书名》

## 元信息

- 作者：
- 阅读日期：
- 主题标签：
- 一句话定位：

## 输入来源

- 用户回忆：
- 上传照片：
- 导入旧笔记：
- 本地已有知识：
- 联网背景：

## 核心模型

用 3-6 句话说明这本书最值得带走的整体模型。

## 知识卡片

### 1. 概念名

- 类型：concept | method | claim | example | action
- 图谱 ID：
- 核心意思：
- 用大白话解释：
- 例子：
- 常见误区：
- 和已有知识的关联：
- 可行动的应用：
- 复习问题：

## 跨书关联

- 关联到：
- 关系类型：
- 为什么有关：
- 置信度：high | medium | low
- 待确认问题：

## 行动实验

- 场景：
- 最小行动：
- 触发条件：
- 反馈信号：
- 复盘时间：

## 下次复习

- 1 天后：
- 7 天后：
- 30 天后：

## 来源与证据

- 用户原话：
- 照片摘录：
- 导入笔记：
- 网页来源：
```

## Graph JSON

Path: `knowledge/data/graph.json`

Reading scenes use the same graph file as the broader personal knowledge base. See `personal-knowledge-schema.md` for the complete node and edge type list.

Node shape:

```json
{
  "id": "concept:example",
  "type": "concept",
  "label": "概念名",
  "summary": "一句话说明",
  "source": "book:book-slug",
  "tags": ["标签"],
  "confidence": "high"
}
```

Reading-focused node types:

- `book`
- `concept`
- `method`
- `claim`
- `example`
- `action`

Required node fields:

- `id`
- `type`
- `label`
- `summary`

Optional node fields:

- `source`
- `tags`
- `confidence`
- `metadata`

Recommended `metadata` fields for source-rich nodes:

- `source_type`: `user_recall` | `uploaded_photo` | `imported_note` | `local_knowledge` | `web_context`
- `source_path`: local path for archived imports or photo transcriptions.
- `quote`: short excerpt or paraphrase. Avoid long copyrighted passages.
- `web_urls`: list of source URLs when web context materially shaped the node.

Edge shape:

```json
{
  "id": "edge:book-slug:concept-a:concept-b",
  "type": "extends",
  "from": "concept:a",
  "to": "concept:b",
  "label": "如何关联",
  "evidence": "来自书中或用户回答的依据",
  "confidence": "medium"
}
```

Reading-focused edge types:

- `contains`: book contains idea.
- `supports`: one idea supports another.
- `contrasts`: ideas disagree or create productive tension.
- `extends`: one idea expands another.
- `applies_to`: concept or method applies to an action or scenario.
- `reminds_of`: weaker memory association worth preserving.

Required edge fields:

- `id`
- `type`
- `from`
- `to`

Optional edge fields:

- `label`
- `evidence`
- `confidence`
- `metadata`

Recommended `metadata` fields for source-rich edges:

- `source_type`
- `source_path`
- `web_urls`

## Import Archives

Use these paths when the user provides substantial source material:

- `knowledge/imports/<book-slug>/photo-notes.md`
- `knowledge/imports/<book-slug>/imported-notes.md`
- `knowledge/imports/<book-slug>/web-context.md`
- `knowledge/imports/unknown-source/imported-notes.md`

Keep archive files concise. They should preserve source material needed for future synthesis, not become full copies of copyrighted text.

For non-book reflections, complaints, decisions, ideas, and practice reviews, use:

- `knowledge/cards/<topic-slug>.md`
- `knowledge/imports/<topic-slug>/`
- the templates in `personal-knowledge-schema.md`

## Quality Bar

- Every book node should connect to at least one concept, method, claim, example, or action.
- Every non-book node should have a clear source or evidence.
- Prefer fewer meaningful cross-book links over many weak associations.
- Use `confidence: "low"` for tentative links and add a question in Markdown.
- Do not create duplicate nodes for the same idea; extend the existing node when possible.

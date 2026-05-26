# Personal Knowledge Schema

Use this reference for non-book knowledge cards and the expanded graph schema.

## Card Paths

- Book synthesis: `knowledge/books/<book-slug>.md`
- Non-book card: `knowledge/cards/<topic-slug>.md`
- Source archive: `knowledge/imports/<topic-slug>/`
- Standard package for direct capture: `knowledge/imports/<topic-slug>/package.json`

Use stable slugs. Prefer pinyin, concise English, or readable mixed slugs.

All new knowledge should enter through a standard Knowledge Package, then be merged with `scripts/ingest_knowledge_package.py`. The Markdown templates below define document content; the website reads the resulting Markdown paths and `knowledge/data/graph.json`.

## Non-Book Card Template

```markdown
# 主题名

## 元信息

- 类型：reflection | question | value | belief | emotion | decision | theme | method | action
- 日期：
- 来源：
- 图谱 ID：
- 主题标签：
- 一句话定位：

## 原始触发

保留最关键的用户原话或输入摘要。不要保存不必要的敏感细节。

## 澄清后的观点

把原始输入整理成更稳定、可复用的表达。

## 辩论与校正

- 最强版本：
- 关键前提：
- 反例或边界：
- 需要继续追问的问题：

## 关联

- 关联到：
- 关系类型：
- 为什么有关：
- 置信度：high | medium | low

## 行动实验或复习问题

- 最小行动：
- 触发条件：
- 反馈信号：
- 复盘问题：
```

## Graph JSON

Path: `knowledge/data/graph.json`

Top-level shape:

```json
{
  "version": 1,
  "updated_at": "YYYY-MM-DD",
  "nodes": [],
  "edges": []
}
```

Allowed node types:

- `book`: book or major reading source.
- `concept`: reusable idea or distinction.
- `method`: process or technique.
- `claim`: proposition that can be supported or challenged.
- `example`: concrete case.
- `action`: specific experiment or behavior.
- `reflection`: reusable insight from life review.
- `question`: important open question.
- `value`: named value or priority.
- `belief`: personal belief or worldview statement.
- `emotion`: recurring emotional pattern worth understanding.
- `decision`: decision record or decision principle.
- `theme`: recurring life/learning theme. Only a `theme` with `metadata.cosmos.role: "galaxy"` is a meta-cognitive galaxy. A batch-import archive may use `type: "theme"` only as a source archive, with `metadata.import_role: "source_archive"`.

Required node fields:

- `id`
- `type`
- `label`
- `summary`

Recommended node fields:

- `source`
- `tags`
- `confidence`
- `metadata.source_type`
- `metadata.source_path`
- `metadata.card_path`
- `metadata.book_note`
- `metadata.discipline`
- `metadata.review_questions`
- `metadata.status`: `open`, `active`, or `done` for action/question/decision tracking.
- `metadata.import_role`: `source_archive` for repository or batch-import archive nodes that should remain provenance, not synthesis.
- `metadata.web_urls`
- `metadata.source_trace`: checked factual provenance for a quote, classic concept, term, historical reference, or book origin.
- `metadata.cosmos`: optional visualization hints for the knowledge universe. Use sparingly.

Allowed edge types:

- `contains`: source contains idea.
- `supports`: one idea supports another.
- `contrasts`: ideas disagree or create productive tension.
- `extends`: one idea expands another.
- `applies_to`: concept or method applies to an action or scenario.
- `reminds_of`: weaker memory association worth preserving.
- `causes`: one pattern contributes to another.
- `challenges`: one idea questions or attacks another.
- `reframes`: one idea changes the interpretation of another.
- `evidences`: example or reflection provides evidence for a claim.
- `updates`: newer insight revises an older belief.
- `recurs_in`: theme appears across multiple inputs.
- `synthesizes`: older knowledge participates in forming a new theory node. Direction goes from predecessor knowledge to the new theory.

Required edge fields:

- `id`
- `type`
- `from`
- `to`

Recommended edge fields:

- `label`
- `evidence`
- `confidence`
- `metadata`

Optional `metadata.source_trace` fields:

- `work`: source work or collection, for example `《礼记·中庸》`.
- `passage`: short original phrase or passage.
- `source_url`: URL used for verification.
- `verified_at`: `YYYY-MM-DD`.
- `source_confidence`: `high`, `medium`, or `low`.

Optional node `metadata.cosmos` fields:

- `role`: `galaxy`, `star`, `planet`, `bridge`, or `comet`. Usually omit this and let the site infer it.
  - `galaxy` is reserved for meta-cognitive `theme` nodes, such as “矛盾建模与实践检验” or “觉察-反思-行动”. A galaxy label should name an organizing path and should not be identical to an ordinary concept label.
  - `star` is inferred for books and for lifecycle `theory_star` records; use explicit `star` only for rare hand-curated cases.
  - `planet` is for concrete concepts, claims, methods, actions, reflections, and questions under a book or theme.
  - `bridge` is for nodes that connect multiple meta-cognitive galaxies or disciplines.
  - `comet` is for open, weakly attached, distant, or still-uncertain knowledge.
- `mass`: manual override for knowledge mass/commonality. Use only for obvious core ideas.
- `source_anchor`: node ID of the meta-cognitive galaxy this node primarily belongs to. Prefer a `theme:*` node with `metadata.cosmos.role: "galaxy"`. Do not use `contains` edges to say a galaxy contains a book; keep `source` for direct provenance and `source_anchor` for visual galaxy ownership.
- `recurrence`: how often this knowledge returns across sessions, books, or action reviews.
- `orbit_bias`: multiplier for visual orbit size when a node needs a wider/narrower orbit.
- `review_half_life_days`: optional base half-life for Ebbinghaus-style review decay. Usually omit and let the site infer by node type.

Optional edge `metadata.cosmos` fields:

- `strength`: manual relation strength override.
- `distance`: preferred visual distance override, either a number or `near` / `medium` / `far`.

## Cosmos Lifecycle

Path: `knowledge/data/cosmos-lifecycle.json`

The website reads this file as a separate, optional lifecycle archive. Do not put review/practice history directly into `graph.json`.

Top-level shape:

```json
{
  "version": 1,
  "updated_at": "YYYY-MM-DD",
  "records": {},
  "syntheses": []
}
```

`records[node_id]` may include:

- `last_reviewed_at`: `YYYY-MM-DD`.
- `review_count`: integer count of meaningful review sessions.
- `last_practiced_at`: `YYYY-MM-DD`.
- `practice_count`: integer count of meaningful practice/applications.
- `mastery`: `0` to `1`, a conservative estimate of current mastery.
- `stage`: `active`, `fading`, `dormant`, `synthesizing`, `remnant`, or `theory_star`.
- `synthesized_into`: node ID of the new theory this old knowledge helped form.

`syntheses[]` records theory formation:

- `id`
- `theory_node_id`
- `predecessor_node_ids`
- `created_at`
- `summary`
- `evidence`
- `mode`: currently `accretion`.

Review decay follows an Ebbinghaus-style exponential curve: the site treats brightness as memory/activity retention, then strengthens the curve as `review_count`, `practice_count`, and `mastery` rise. Default base half-lives are 21 days for action/method nodes, 90 days for book/theme nodes, and 45 days for other nodes.

Knowledge Packages may carry an optional top-level `lifecycle_patch` with `records` and `syntheses`; merge it with `scripts/ingest_knowledge_package.py` so `cosmos-lifecycle.json` stays the lifecycle source of truth.

## High-Value Capture Rules

Capture when the material is likely to matter again:

- A recurring pattern appears.
- A belief or value becomes clearer.
- A question should be revisited.
- A decision principle emerges.
- A practical experiment is defined.
- A new idea links meaningfully to existing knowledge.
- A book insight changes the user's interpretation of life or action.

Do not capture when:

- It is only transient emotion with no reusable pattern.
- The user is still venting and the idea is unstable.
- It would preserve sensitive detail without future value.
- The content duplicates an existing card without adding anything new.

## Imported Material Capture Rules

For user-owned old notes and repositories:

- Preserve the source archive separately from the insight.
- Reconstruct the thinking path before making graph nodes.
- Prefer one synthesis card for the underlying model over a flat set of extracted summaries.
- Use `synthesizes` edges from concrete imported ideas into the synthesis node when multiple files reveal the same deeper model.
- Use `source` and source paths for provenance; use `metadata.cosmos.source_anchor` for visual belonging.
- Do not mark a source archive as `galaxy` or `star`.
- Do not create a galaxy until the same meta-cognitive path recurs across independent sources or sessions.

## Source Types

Use these metadata values:

- `user_recall`
- `uploaded_photo`
- `imported_note`
- `local_knowledge`
- `web_context`
- `daily_reflection`
- `complaint`
- `decision_session`
- `idea_debate`
- `practice_review`
- `imported_repository`

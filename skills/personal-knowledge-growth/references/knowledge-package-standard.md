# Knowledge Package Standard

Use this reference when the user says: “生成知识包”, “导出给别人用”, “手动上传到网站”, “帮我整理成可导入格式”, or when external notes need to be checked before entering the formal knowledge base.

## Two Capture Modes

### Direct Capture Mode

Use this when the current project knowledge base should be updated directly.

1. Discuss and clarify the input.
2. Capture only high-value insights.
3. Build a standard Knowledge Package JSON first.
4. Save it at `knowledge/imports/<topic-slug>/package.json`.
5. Merge it with `scripts/ingest_knowledge_package.py <package-path>`.
6. Open the local knowledge website if data changed.

### Portable Package Mode

Use this when content should be portable, reviewed, uploaded, or shared before merging.

1. Produce one JSON file that follows `knowledge/spec/knowledge-package.schema.json`.
2. Do not mutate the official `knowledge/data/graph.json` in this mode.
3. Include all Markdown documents inside `documents[].content_markdown`.
4. Put new nodes and edges under `graph_patch`.
5. Require source references on every new node.
6. Validate with `scripts/validate_knowledge_package.py <package.json>`.
7. Preview merge with `scripts/ingest_knowledge_package.py <package.json> --dry-run`.
8. The website upload page may precheck the JSON and generate a merge instruction, but formal merge is still done by Codex.

## Package Shape

```json
{
  "package_version": 1,
  "package_id": "pkg:short-topic-YYYY-MM-DD",
  "created_at": "YYYY-MM-DD",
  "source": {
    "skill": "personal-knowledge-growth",
    "scenario": "reading",
    "language": "zh-CN",
    "origin": "Where the material came from",
    "description": "Why this package exists"
  },
  "documents": [
    {
      "path": "knowledge/cards/topic-slug.md",
      "kind": "card",
      "title": "Card title",
      "content_markdown": "# Card title\n\n..."
    }
  ],
  "graph_patch": {
    "nodes": [],
    "edges": []
  },
  "lifecycle_patch": {
    "records": {},
    "syntheses": []
  }
}
```

## Required Standards

- `package_version` must be `1`.
- `package_id` is required and should be stable, e.g. `pkg:<topic-slug>-YYYY-MM-DD`.
- `created_at` is required and must use `YYYY-MM-DD`.
- `source.skill` must be `personal-knowledge-growth`.
- `source.scenario` must be one of: `reading`, `reflection`, `complaint`, `decision`, `idea`, `practice`, `import`.
- `source.language`, `source.origin`, and `source.description` are required.
- Document paths must be under `knowledge/books/`, `knowledge/cards/`, or `knowledge/imports/`.
- Document paths should be ASCII slugs and must not contain `..`, absolute paths, backslashes, or double slashes.
- Every package must include at least one Markdown document.
- Every document must include `path`, `kind`, `title`, and `content_markdown`.
- `kind: "book"` must use `knowledge/books/`; `kind: "card"` must use `knowledge/cards/`; `kind: "import"` must use `knowledge/imports/`.
- Every new node must include `id`, `type`, `label`, `summary`, `confidence`, and a source reference.
- Node IDs should start with their type, e.g. `concept:...`, `method:...`, `reflection:...`.
- Source references can be `source`, `metadata.book_note`, `metadata.card_path`, `metadata.source_path`, `metadata.import_path`, or `metadata.source_url`.
- Source paths in metadata must either be included in `documents[]` or already exist locally.
- Imported repositories should include a source archive document plus a thinking-path synthesis when the material reflects the user's prior thought. Do not flatten a repository into one card per file.
- Source archive nodes, if included, should carry `metadata.source_type: "imported_repository"` and `metadata.import_role: "source_archive"` and must not use `metadata.cosmos.role: "galaxy"` or `star`.
- Galaxy nodes should represent recurring meta-cognitive paths, not source folders and not duplicate labels of ordinary concept nodes.
- Every edge must include `id`, `type`, `from`, `to`, and `confidence`.
- Edge IDs should start with `edge:`.
- Edge endpoints must point to existing graph nodes or nodes included in the same package.
- `lifecycle_patch` is optional. Use it for real reviews, practice回访, and theory formation; it merges into `knowledge/data/cosmos-lifecycle.json`.
- Do not reuse existing node IDs or edge IDs unless the user explicitly asks for a manual update plan.
- Do not modify `site/` for normal knowledge additions; the website must consume standard package output through `graph.json`.

## Allowed Node Types

- Existing learning graph: `book`, `concept`, `method`, `claim`, `example`, `action`
- Personal growth graph: `reflection`, `question`, `value`, `belief`, `emotion`, `decision`, `theme`

## Allowed Edge Types

- Existing: `contains`, `supports`, `contrasts`, `extends`, `applies_to`, `reminds_of`
- Personal growth: `causes`, `challenges`, `reframes`, `evidences`, `updates`, `recurs_in`, `synthesizes`

## Lifecycle Patch

Use `lifecycle_patch.records[node_id]` to record meaningful review/practice events:

- `last_reviewed_at`, `review_count`
- `last_practiced_at`, `practice_count`
- `mastery`: 0 to 1
- `stage`: `active`, `fading`, `dormant`, `synthesizing`, `remnant`, or `theory_star`
- `synthesized_into`: the new theory node ID when an older node has become predecessor/fuel

Use `lifecycle_patch.syntheses[]` when multiple old nodes form a new theory:

- `id`
- `theory_node_id`
- `predecessor_node_ids`
- `created_at`
- `summary`
- `evidence`
- `mode: "accretion"`

The website computes brightness with an Ebbinghaus-style exponential forgetting curve. Each real review/practice increases memory strength and pushes the next recommended review interval outward.

## Markdown Quality Bar

For a book note, include:

- 元信息
- 输入来源
- 核心模型
- 知识卡片
- 跨书关联
- 行动实验
- 下次复习
- 来源与证据
- 待追问

For a non-book card, include:

- 核心观点
- 适用场景
- 大白话解释
- 证据或来源
- 反例或边界
- 行动实验
- 复习问题
- 相关节点

## Merge Workflow

When a package passes validation and the user asks to merge it:

1. Run `python3 -B scripts/validate_knowledge_package.py <package.json>`.
2. Run `python3 -B scripts/ingest_knowledge_package.py <package.json> --dry-run`.
3. Run `python3 -B scripts/ingest_knowledge_package.py <package.json>`.
4. Open the local website with `python3 -B scripts/serve_knowledge_site.py --open`.

The ingest script is the only normal merge path. Manual graph editing is reserved for repairs, migrations, or deliberate schema changes.

## Refusal To Capture

Do not generate a package if the input is too vague, purely emotional with no stable insight, or lacks permission to preserve sensitive content. In that case, respond in dialogue mode and ask one focused clarification question.

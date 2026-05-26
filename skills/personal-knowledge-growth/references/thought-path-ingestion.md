# Thought Path Ingestion

Use this reference for old notes, GitHub repositories, exported folders, and other batch imports that represent the user's prior thinking.

## Core Rule

Do not treat a repository as a pile of facts to extract. Treat it as evidence of how the user thinks. Preserve the source, then reconstruct the path underneath the files.

## Reconstruction Pass

Before creating cards or graph nodes, answer these questions in working notes:

- What recurring problem was the user trying to solve?
- What surface claims or examples repeat across files?
- What distinction is the user protecting from simplification?
- What standards are used to judge: practice, consequences, responsibility, relationships, historical structure, personal action, or something else?
- Which points are durable models, and which are only examples or source traces?
- Which existing meta-cognitive galaxy should this attach to? If none fits, is there enough independent recurrence to create a new galaxy?

## Capture Shape

Prefer this structure:

1. A source archive under `knowledge/imports/<slug>/` that records original files and provenance.
2. One synthesis card for the thinking path when the import reveals a reusable method, belief, or question.
3. A small number of concrete cards only for ideas that can be reused independently.
4. Edges from old concrete nodes into the synthesis node with `synthesizes` when they jointly form a more stable model.
5. `recurs_in` edges from synthesis or concrete nodes into the relevant meta-cognitive galaxy.

Avoid this structure:

- One card per imported file.
- A source archive node acting as a meta-cognitive galaxy.
- A galaxy label that duplicates an ordinary concept label, such as a galaxy and a planet both named exactly the same thing.
- `contains` edges that make a repository look like the user's main idea.

## Repository Imports

For user-owned repositories such as `SeawaitRose/Knowledge`, assume the materials are prior thought, not external reference material. The archive should answer "where did this come from"; the synthesis card should answer "what thinking pattern does this reveal."

When writing summaries, prefer verbs that expose the path:

- "把表层争论放回具体条件"
- "用实践后果校验判断"
- "从单因解释转向结构关系"
- "区分解释与辩护"
- "把开放问题保留为待验证边界"

## Cosmos Rules

- `galaxy`: only for a stable meta-cognitive path that recurs across independent sources and can organize future learning.
- `star`: books or mature theory nodes, not import folders.
- `bridge`: a synthesis node that connects multiple galaxies, disciplines, or source families.
- `planet`: concrete concepts, methods, claims, actions, and questions.
- Source archives should use `metadata.source_type: "imported_repository"` and `metadata.import_role: "source_archive"` when retained as graph nodes. Do not mark them as `galaxy` or `star`.

Use `metadata.cosmos.source_anchor` on concrete nodes whenever their primary galaxy is clear. Leave it absent only when the node is intentionally unanchored or still being evaluated.

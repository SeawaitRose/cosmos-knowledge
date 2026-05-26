# Wiki Operations

Use this reference for maintaining the personal knowledge base as a durable wiki, not just a pile of notes.

## Operating Principles

- Read `knowledge/purpose.md` before major synthesis so the knowledge base keeps a stable direction.
- Preserve raw or emotionally meaningful source material under `knowledge/imports/` or `knowledge/raw/` when it may matter later.
- Compile raw input into books/cards/graph nodes only after the user's idea is clearer.
- Prefer traceable nodes: every durable claim should have a source, evidence, or explicit uncertainty.
- Keep indexes and health reports current after substantial updates.

## Maintenance Flow

After a knowledge-base update:

1. Validate graph structure:
   - `skills/personal-knowledge-growth/scripts/validate_graph.py knowledge/data/graph.json`
2. Refresh indexes and health report:
   - `scripts/maintain_knowledge_base.py`
3. Open the local site when useful:
   - `scripts/serve_knowledge_site.py --open`

## What To Watch

- Orphan nodes: useful ideas with no relationships are hard to rediscover.
- Missing sources: unsupported beliefs can drift into false certainty.
- Weak edges: `reminds_of` links are useful, but should sometimes mature into `supports`, `contrasts`, `updates`, or `reframes`.
- Repeated themes: recurring tags or emotions should become `theme` nodes.
- Open questions: valuable uncertainty should not disappear after a single conversation.

## Query Backfill

When the user asks a question and the answer requires synthesizing existing knowledge:

- Use the site/indexes/graph as retrieval aids.
- If the answer creates a durable new distinction or insight, save it as a card or graph node.
- If the query reveals a gap, add or update a `question` node instead of pretending the system is complete.

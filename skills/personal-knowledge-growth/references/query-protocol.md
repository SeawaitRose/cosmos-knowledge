# Query Protocol

Use this reference when the user asks the knowledge base a question, asks what to discuss next, or asks for synthesis across previous books/cards.

## Principle

Treat the local knowledge base as an LLM Wiki: first retrieve the compiled wiki, then synthesize. Do not answer only from memory when the answer should depend on prior local cards, graph relationships, or source documents.

## Default Flow

1. Run a local query:
   - `python3 -B scripts/query_knowledge_base.py query "<question>" --depth 2`
   - Use `--json` when a structured result is easier to inspect.
2. Read the highest-value Markdown paths from the query result.
3. Use graph neighbors to find related books, claims, actions, and open questions.
4. Answer with:
   - direct answer,
   - relevant nodes or card paths,
   - remaining uncertainty,
   - one suggested next conversation or action.
5. If the query reveals a durable new distinction, create a Knowledge Package. If it only reveals a gap, add or update a `question` node when the user asks to capture it.

## Retrieval Signals

Prioritize:

- `question` nodes with `metadata.status: open`.
- `confidence: low` or `confidence: medium`.
- Nodes with many graph connections.
- Cards that have source paths and review questions.
- Edges of type `contrasts`, `updates`, `challenges`, or `reframes`, because they usually contain cognitive movement.

Be cautious with:

- `reminds_of` edges: useful associations, but weaker evidence.
- Old notes without source paths.
- Book nodes that exist only as placeholders for prior user recall.

## Answer Shape

For user-facing synthesis, prefer:

```markdown
我在知识库里看到三条线：

1. ...
2. ...
3. ...

还模糊的是：...

今天最值得聊的问题是：...
```

Use file paths and node IDs when useful, but do not overload the user with raw JSON.

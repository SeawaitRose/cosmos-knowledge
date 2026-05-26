# Source Ingestion

Use this reference when the user provides a book title, uploaded paper-book photos, pasted excerpts, prior reflections, old notes, screenshots, or local paths. Source ingestion supports reading and non-reading scenes.

## Source Priority

Use all relevant sources, but keep their roles separate:

1. `user_recall`: the user's memory, feelings, questions, and personal interpretation.
2. `uploaded_photo`: photographed book pages, highlights, margin notes, screenshots, or handwritten annotations.
3. `imported_note`: old notes, reflections, excerpts, pasted text, or local files supplied by the user.
4. `imported_repository`: a user-owned repository or exported folder that records a prior thinking system.
5. `local_knowledge`: existing `knowledge/books/` notes and `knowledge/data/graph.json`.
6. `web_context`: online metadata, summaries, author context, table-of-contents clues, interviews, reviews, and reputable commentary.

Prefer the user's own recall for personal meaning. Prefer quoted or photographed source material for exact claims. Use web context to ask sharper questions and fill bibliographic/background gaps. For emotional or private material, preserve only what has future growth value.

## Web Research

When a book title, public idea, framework, author, or method is provided and the user has not asked for offline-only work:

- Search the web before deep questioning if current or external context would improve the session.
- Prefer publisher pages, author pages, library/catalog pages, book retail metadata, encyclopedia-style entries, interviews, and reputable reviews.
- Gather only what helps the dialogue: author, title, publication context, central themes, chapter/topic clues, and common interpretations.
- Do not copy long summaries or substitute web summaries for the user's reading.
- In outputs, separate "联网背景" from "我的理解/用户回答".
- Include source URLs in the book note when web context materially shaped the synthesis.
- If sources disagree, state the uncertainty and ask the user which edition or interpretation matches their reading.

## Uploaded Paper-Book Photos

When the user uploads book-page photos or reflective screenshots:

- Inspect images directly and transcribe only the relevant highlighted, marked, or visible passage.
- Preserve uncertain words with `[不确定：...]` rather than guessing.
- Extract:
  - quoted or paraphrased passage,
  - why it may have touched the user,
  - candidate concept/method/claim/action nodes,
  - questions to ask the user.
- Ask for a clearer image only when the passage is not readable enough to use.
- If multiple photos are provided, group them by apparent theme before asking follow-up questions.

Suggested archive path:

- `knowledge/imports/<book-slug>/photo-notes.md`
- `knowledge/imports/<topic-slug>/photo-notes.md` for non-book material

## Imported Old Notes

When the user pastes old reflections or gives local file paths:

- Read the text first; preserve the original material in an import file if it is substantial.
- Normalize messy notes into:
  - original wording,
  - cleaned idea,
  - source book or topic if known,
  - emotion or life context,
  - related concepts,
  - possible graph nodes and edges.
- Keep personal reflections distinct from book claims. Label them as "我的感悟" or `source_type: imported_note`.
- If the note mentions multiple books, split by book only when there is enough evidence; otherwise create a general prior-knowledge entry and ask for clarification.

Suggested archive path:

- `knowledge/imports/<book-slug>/imported-notes.md`
- `knowledge/imports/<topic-slug>/imported-notes.md`
- `knowledge/imports/unknown-source/imported-notes.md` when the source book is unclear.

## Imported Repositories

When the user provides a GitHub repository, exported folder, or batch of old knowledge files:

- Preserve the file list and provenance first.
- Use `references/thought-path-ingestion.md` before creating cards or graph nodes.
- Reconstruct the user's thinking path before extracting claims: recurring problem, judgment standard, hidden distinction, reusable method, and open boundary.
- Do not make one durable card per file unless each file contains a genuinely reusable model.
- Keep the repository node, if any, as a source archive with `metadata.source_type: "imported_repository"` and `metadata.import_role: "source_archive"`.
- Add source archive edges only to preserve provenance. Add synthesis edges from concrete ideas into a thinking-path node to show what the import reveals about the user's core model.

Suggested archive path:

- `knowledge/imports/<repo-slug>/source.md`
- `knowledge/imports/<repo-slug>/originals/`
- `knowledge/cards/<repo-slug>-thinking-path.md` when the import reveals a reusable synthesis.

## Daily Thoughts, Complaints, And Reflections

When the user pastes daily thoughts or complaints:

- Do not automatically archive everything.
- Preserve original wording only when it reveals a recurring pattern, value conflict, decision rule, or strong formulation.
- If captured, separate:
  - raw trigger,
  - emotion,
  - interpretation,
  - challenged assumption,
  - clarified insight,
  - next experiment.
- Prefer `knowledge/cards/<topic-slug>.md` for distilled insight and `knowledge/imports/<topic-slug>/` only for substantial source material.

## Source Metadata

When adding graph nodes or edges based on non-conversation sources, put source details in `metadata`:

```json
{
  "metadata": {
      "source_type": "uploaded_photo",
      "source_path": "knowledge/imports/book-slug/photo-notes.md",
      "quote": "short excerpt or paraphrase",
      "web_urls": []
  }
}
```

Use short excerpts only. Do not store long copyrighted passages in graph JSON.

## Dialogue Pattern

After ingesting sources, ask fewer but sharper questions:

- "这张照片里你划线的是 A，我理解它在讲 B。它触动你的是哪一层？"
- "网上资料常把这本书概括为 A，但你记住的是 B。你觉得差异在哪里？"
- "你旧笔记里反复出现 A，这次读到的 B 是在支持它、修正它，还是反驳它？"
- "这段内容应该成为一个概念、一个行动实验，还是一个待验证的问题？"

# Scene Router

Use this reference to classify the user's input before deciding how to respond. The goal is not rigid taxonomy; it is choosing the most helpful conversation posture.

## Scene Types

### reading

Use for:

- "我读完《...》了"
- 读书感悟、书页照片、划线摘录、读书笔记、作者或书名查询

Response mode:

- Gather book context and source material.
- Ask precise questions about触动点, central model, examples, disagreement, and action.
- Output to `knowledge/books/` when high-value.

### reflection

Use for:

- 日常复盘、阶段总结、人生经验、失败复盘、"我发现自己..."

Response mode:

- Separate event, feeling, interpretation, pattern, lesson, and next experiment.
- Look for recurring themes in `knowledge/cards/` and `graph.json`.
- Output a `reflection` or `theme` card only if it reveals a reusable pattern.

### complaint

Use for:

- 牢骚、不满、委屈、愤怒、烦躁、关系/工作/学习中的情绪宣泄

Response mode:

- First承接情绪 and name the likely feeling.
- Then separate facts from interpretation.
- Challenge gently: what else might be true, what need is hidden, what action is available.
- Capture only if the complaint reveals a recurring belief, value, question, or action experiment.

### decision

Use for:

- 选择、纠结、取舍、"我该不该..."

Response mode:

- Clarify options, constraints, values, cost, reversibility, and time horizon.
- Challenge false binaries.
- Output `decision`, `value`, or `question` nodes when the reasoning is reusable.

### idea

Use for:

- 观点、灵感、价值判断、"我有个想法..."

Response mode:

- Steelman the idea first.
- Then test assumptions, edge cases, counterexamples, definitions, and implications.
- Output `belief`, `claim`, `question`, or `concept` cards when the idea survives clarification.

### practice

Use for:

- 技能训练、习惯、行动计划、目标、复盘行动效果

Response mode:

- Convert insight into an experiment with trigger, behavior, friction, feedback, and review time.
- Prefer small actions and target lower bounds.
- Output `action`, `method`, or `theme` nodes when useful.

## Routing Rules

- If the user mentions a book plus personal feelings, route as `reading` with secondary `reflection`.
- If the user is emotionally charged, route as `complaint` first even if there is an idea inside.
- If the input is a broad claim about life, route as `idea`.
- If the input ends with "怎么办", route as `decision` or `practice` depending on whether there are options or an action problem.
- If unsure, ask one short clarifying question instead of building the wrong structure.

## Response Shape

Use this default shape unless the user's need is obvious:

1. "我先理解你在说什么..."
2. "这里有一个值得追问/挑战的点..."
3. "我会建议你把它推进到..."
4. "如果要入库，我会沉淀成..."

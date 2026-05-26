# 会追问的个人知识宇宙

一个本地优先的个人知识管理项目：用 Codex skill 进行深度讨论和知识沉淀，用网站管理 Markdown + JSON 文件知识库，用宇宙视图观察书籍、概念、行动、问题和元认知星系之间的关系。

它不是剪藏工具。目标是形成一个能持续追问、校正判断、推动行动和复习的个人知识系统。

## 快速开始

```bash
python3 -B scripts/serve_knowledge_site.py --open
```

默认打开：

```text
http://127.0.0.1:8765/site/
```

如果本地没有 `knowledge/`，服务会从 `examples/demo-knowledge/` 复制一个示例知识库。你也可以启动空白库：

```bash
python3 -B scripts/serve_knowledge_site.py --init blank --open
```

## 项目结构

```text
site/                         可视化网站和管理台
scripts/                      本地服务、校验、合并、日报/周报脚本
skills/personal-knowledge-growth/  Codex skill：深聊、追问、生成知识包
examples/demo-knowledge/      可公开提交的示例知识库
knowledge/                    用户真实知识库，默认被 .gitignore 忽略
```

## 核心工作流

1. 在 Codex 中使用 `personal-knowledge-growth` skill 深聊一个想法、读书笔记、复盘或决策。
2. skill 先追问事实、反例、边界和行动信号，再生成标准 Knowledge Package。
3. 打开网站的“导入知识”页面上传 JSON，预检通过后直接合并。
4. 在“管理”页面编辑节点、关系、星系归属、彗星角色、来源路径和生命周期。
5. 在“知识星球”里观察图谱结构。
6. 在“自动化”页面配置北京时间提醒和飞书机器人。

## 网站能力

- 总览：查看节点、关系、今日对话和待追问。
- 知识星球：3D/2D 宇宙视图，支持元认知星系、元认知和彗星镜头。
- 成长任务：行动实验、复习问题、知识健康和阅读建议。
- 管理：编辑节点、关系、星系归属、宇宙角色、生命周期记录。
- 自动化：填写飞书 webhook，按北京时间发送每日/每周提醒。
- 示例库：恢复公开示例库，或一键清空示例开始自己的知识库。
- 导入知识：上传 Knowledge Package，预检并通过本地服务合并。

## Knowledge Package

知识进入系统前应先成为标准 JSON：

```json
{
  "package_version": 1,
  "package_id": "pkg:example",
  "created_at": "2026-05-26",
  "source": {
    "skill": "personal-knowledge-growth",
    "scenario": "reflection",
    "language": "zh-CN",
    "origin": "conversation",
    "description": "why this package exists"
  },
  "documents": [],
  "graph_patch": {
    "nodes": [],
    "edges": []
  }
}
```

校验与合并：

```bash
python3 -B scripts/validate_knowledge_package.py knowledge/imports/<topic>/package.json
python3 -B scripts/ingest_knowledge_package.py knowledge/imports/<topic>/package.json --dry-run
python3 -B scripts/ingest_knowledge_package.py knowledge/imports/<topic>/package.json
```

## 可视化规则与算法

网站把知识节点映射成宇宙对象：元认知星系、恒星、行星、星际桥和彗星。视觉不是随意装饰，而是由图谱结构、置信度、复习状态和关系强度共同推导。

### 节点质量

节点质量 `mass` 的默认推导：

```text
mass = 类型基础质量
     + 连接度 * 0.82
     + 跨元认知星系数量 * 1.2
     + 复现度 * 0.92
     + 置信度权重 * 1.1
```

类型基础质量：

```text
book 8.4, theme 7.6, concept 5.6, method 5.4,
belief 4.7, value 4.5, claim 4.2, reflection 3.5,
question 3.3, action 3.2, decision 3.1, example 2.8, emotion 2.6
```

置信度权重：

```text
high 1.0, medium 0.68, low 0.42
```

可以用 `metadata.cosmos.mass` 手动覆盖质量。

### 角色推断

- `galaxy`：只给 `theme` 类型的元认知母题，必须是长期组织路径。
- `star`：书籍默认是恒星；生命周期中形成的新理论也会成为恒星。
- `planet`：普通概念、方法、行动、观点、反思等。
- `bridge`：连接多个星系、来源或学科的节点。
- `comet`：开放、低置信度、弱连接、远距离或仍待归属的问题。

可以用 `metadata.cosmos.role` 手动指定，用 `metadata.cosmos.source_anchor` 指定所属元认知星系。

### 边权与轨道距离

关系强度：

```text
strength = 关系类型基础强度 * 置信度权重 * (1 + 标签相似度 * 0.36)
```

关系类型基础强度：

```text
contains 1.18, supports 1.10, extends 1.04, applies_to 0.98,
evidences 0.86, updates 0.82, reframes 0.78, causes 0.74,
challenges 0.66, contrasts 0.58, recurs_in 0.54,
reminds_of 0.42, synthesizes 0.36
```

轨道距离由关系类型、跨星系关系和标签相似度共同决定。`contains`、`supports` 较近，`reminds_of`、`synthesizes` 较远；跨星系关系会拉远，标签相似会拉近。也可以用 `edge.metadata.cosmos.distance` 设为 `near`、`medium`、`far` 或具体数字。

### 艾宾浩斯亮度衰减

生命周期数据在 `knowledge/data/cosmos-lifecycle.json`。节点亮度由记忆留存、掌握度、复习和实践共同决定。

默认半衰期：

```text
action/method 21 天
book/theme 90 天
其他节点 45 天
```

复习、实践、掌握度会拉长半衰期：

```text
half_life = base * (1 + ln(1 + review_count) * 0.48
                      + ln(1 + practice_count) * 0.62
                      + mastery * 0.36)
```

记忆留存使用指数衰减：

```text
R = e^(-t / S), S = half_life / ln(2)
```

## 飞书机器人

网站不会要求 Codex 创建外部自动化。请在“自动化”页面填写飞书机器人 webhook，并设置每日/每周北京时间。

注意：

- 本地服务必须保持运行，才能按计划发送。
- webhook 保存在 `knowledge/profile/notification-config.local.json`。
- `.local.json` 默认被 `.gitignore` 忽略，不应提交到 GitHub。
- “测试每日/每周”会立即生成一条测试消息并发送。

## 隐私与 GitHub 发布

本项目默认忽略真实 `knowledge/`。公开仓库应提交 `examples/demo-knowledge/`，不要提交私人知识库。

发布前检查：

```bash
rg -n "open.feishu|webhook|secret|token|password|你的名字|私人|身份证|手机号|邮箱" .
find . -iname "*.pdf" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png"
```

确认不要上传：

- 真实 `knowledge/`
- 飞书 webhook
- `.local.json`
- 原始 PDF、图片、XMind、聊天记录
- 任何私人报告或视频素材

如果你希望用 Git 管理自己的私人知识库，可以删除 `.gitignore` 中的 `knowledge/` 规则，但请确保仓库是私有的。

## 验证

```bash
python3 -B skills/personal-knowledge-growth/scripts/validate_graph.py examples/demo-knowledge/data/graph.json
python3 -B scripts/validate_knowledge_package.py examples/demo-knowledge/spec/knowledge-package-example.json
python3 -B scripts/send_lark_weekly_growth_report.py --dry-run --json
```

启动服务后也可以访问：

```bash
curl http://127.0.0.1:8765/api/status
```

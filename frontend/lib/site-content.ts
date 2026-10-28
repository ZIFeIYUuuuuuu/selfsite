import { rewrittenNotes } from "./rewritten-notes";

export type Principle = {
  title: string;
  detail: string;
};

export type WorkflowStep = {
  step: string;
  title: string;
  detail: string;
};

export type WorkItem = {
  title: string;
  summary: string;
  tag: string;
  year: string;
  detail: string;
  github?: string;
  homepage?: string;
  updatedAt?: string;
  stack?: readonly string[];
  highlights?: readonly string[];
};

export type GitHubRepository = {
  name: string;
  href: string;
  description: string;
  language: string;
};

export type NoteSection = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  quote?: string;
};

export type NoteItem = {
  date?: string;
  paragraphs?: readonly string[];
  slug: string;
  cover: string;
  title: string;
  shortTitle: string;
  format: string;
  summary: string;
  lead: string;
  sections: readonly NoteSection[];
  checklist?: readonly string[];
  closing?: readonly string[];
};

export const siteProfile = {
  name: "子非鱼",
  handle: "ZIFeIYUuuuuuu",
  role: "Applied AI / Agent Builder",
  intro: "我现在主要在做 AI Agent、前后端系统和自动化工具，把想法做成能运行、能解释、能持续迭代的项目。",
  about: "这里收集我正在推进的项目、开发笔记和一些值得留下来的工程记录。",
  philosophy: "页面要清楚，代码要诚实，交付要能跑，复杂系统也要能被解释。",
  // Deployment-owned contact data stays outside Git; anything enabled here is public on the website.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
  github: "https://github.com/ZIFeIYUuuuuuu",
  githubAvatar: "https://avatars.githubusercontent.com/u/273586639?v=4",
  publicRepos: 10,
  qq: "",
  wechat: "",
} as const;

export const githubRepositories: readonly GitHubRepository[] = [
  {
    name: "solo-company-harness",
    href: "https://github.com/ZIFeIYUuuuuuu/solo-company-harness",
    description: "面向独立开发者的 AI Coding 交付 Skill，把目标、合同、证据和复盘串成闭环。",
    language: "Python / Markdown"
  },
  {
    name: "Radeon-hackathon-2026-07",
    href: "https://github.com/ZIFeIYUuuuuuu/Radeon-hackathon-2026-07/tree/claimcourt",
    description: "ClaimCourt 私有证据智能体：本地混合检索、多 Agent 裁决与证据账本。",
    language: "Python"
  },
  {
    name: "super-agent",
    href: "https://github.com/ZIFeIYUuuuuuu/super-agent",
    description: "智能体工作台，串起对话、工具调用、RAG、审批和会话恢复。",
    language: "TypeScript / Python"
  },
  {
    name: "Auto-Stata",
    href: "https://github.com/ZIFeIYUuuuuuu/Auto-Stata",
    description: "自动化实证分析系统，从 Excel 到 Stata 分析与报告生成。",
    language: "Python"
  },
] as const;

export const capabilities = [
  "关注 AI Agent、自动化工作流和前后端协作能不能真正跑起来。",
  "喜欢先把目录、配置、数据流和运行方式理顺，再往里面加功能。",
  "愿意把复杂问题拆成可验证的小块，用项目和笔记持续沉淀。"
] as const;

export const principles: readonly Principle[] = [
  {
    title: "先理解问题，再开始动手",
    detail: "先确认目标、边界和真正需要交付的东西，再决定页面、接口和数据结构怎么组织。"
  },
  {
    title: "能少一层，就少一层",
    detail: "能用简单结构表达清楚的，就不额外堆抽象、配置和概念负担。"
  },
  {
    title: "页面和代码都应该可读",
    detail: "设计上的清晰、内容上的清楚，以及代码上的清爽，本质上是同一件事。"
  }
] as const;

export const workflow: readonly WorkflowStep[] = [
  {
    step: "01",
    title: "理解问题",
    detail: "先确认目标、范围和真正需要解决的痛点，而不是急着堆功能。"
  },
  {
    step: "02",
    title: "搭好结构",
    detail: "先把目录、数据流和页面关系理顺，再往里面填内容和交互。"
  },
  {
    step: "03",
    title: "稳定交付",
    detail: "优先让页面、接口和启动方式先跑通，后续再持续补细节。"
  }
] as const;

export const selectedWork: readonly WorkItem[] = [
  {
    title: "MOYAG Agent Canvas",
    summary: "AI 设计工作台，把项目库、资料库、无限画布、剪辑中心与 3D 入口汇集到同一条创作路径。",
    tag: "AI Design",
    year: "2026",
    detail:
      "这个项目展示的是一个面向设计任务的 Agent Canvas。当前作品集图片取自你提供的部署录屏：首页可见提示输入区、无限画布入口、项目库、资料库、剪辑中心和 3D 入口。",
    updatedAt: "2026",
    stack: ["AI Agent", "Canvas", "Product UI"],
    highlights: ["项目介绍与能力范围仅按录屏中可见的产品入口描述。"]
  },
  {
    title: "ClaimCourt",
    summary: "面向私有文档的本地证据智能体，把模糊请求转成可解释检索计划和可追溯裁决。",
    tag: "Python",
    year: "2026",
    detail:
      "ClaimCourt 位于 Radeon-hackathon-2026-07 的 claimcourt 分支，面向 AMD Radeon / ROCm 的本地私有 AI Agent 场景。系统将 SQLite FTS5/BM25、BGE 向量检索和 Cross-Encoder 重排组合起来，再用控方、辩方、法官的多 Agent 流程组织证据。这里展示的是仓库 README 和证据文件中的项目结果，不把自报 benchmark 当成独立验收。",
    github: "https://github.com/ZIFeIYUuuuuuu/Radeon-hackathon-2026-07/tree/claimcourt",
    updatedAt: "2026-07",
    stack: ["Python", "Streamlit", "Qwen3-14B", "vLLM", "ROCm", "SQLite FTS5"],
    highlights: [
      "用混合检索和重排处理多格式私有文件，并保留可解释的检索路径。",
      "用引用 ID 白名单、SHA-256 证据账本、脱敏和人工审批限制无依据结论。",
      "仓库 README 报告了 320/320 条合成对抗查询通过；这些数字仍需要按仓库说明复现。"
    ]
  },
  {
    title: "solo-company-harness",
    summary: "一人公司 AI Coding 交付 Skill，用合同、证据和反作弊验收约束 Agent 工作。",
    tag: "Agent Skills",
    year: "2026",
    detail:
      "Solo Company Harness 是一个公开的 Agent Skill，不是代码生成模板。它把 Intent、Context、Contract、Execute、Verify、Release、Observe、Distill 串成可追踪的交付流程，并用 Design-Locked 与 Discovery-Gated 区分可以实现的模块和仍需补设计的模块。",
    github: "https://github.com/ZIFeIYUuuuuuu/solo-company-harness",
    updatedAt: "2026",
    stack: ["Python", "Markdown", "Codex", "Claude Code", "OpenCode"],
    highlights: [
      "按 explore、delivery、high-assurance 三种模式匹配任务风险和验证重量。",
      "用 L0-L4 证据等级区分静态检查、本地验证、集成验证、真实路径和 dogfood。",
      "用 Anti-gaming 规则阻止把 fixture、mock、写死返回值或页面能打开冒充真实交付。"
    ]
  },
  {
    title: "super-agent",
    summary: "一个面向 AI Agent 应用的工作台，把流式对话、工具调用、RAG 检索、人工审批和会话恢复放进同一套前后端系统。",
    tag: "Python",
    year: "2026",
    detail:
      "这个项目的目标是做一个可以演示真实 Agent 工作流的应用，而不是只停留在聊天框。用户在浏览器里发起任务，前端通过 API 代理连接 FastAPI 后端，后端用 LangGraph 编排模型、工具、MCP 客户端、RAG 检索和人工审批节点，并通过 SSE 把 token、工具调用、检索来源和恢复执行过程实时返回到页面。",
    github: "https://github.com/ZIFeIYUuuuuuu/super-agent",
    homepage: "https://zifeiyuuuuuuu.github.io/super-agent/",
    updatedAt: "2026-05-19",
    stack: ["Python", "TypeScript", "CSS", "Dockerfile"],
    highlights: [
      "适合展示复杂 Agent 产品的基本骨架：前端工作台、FastAPI 服务、LangGraph runtime、PostgreSQL/PGVector、Redis 和工具层集成。",
      "支持流式聊天、工具调用、MCP 接入、RAG 文档检索、人工审批 checkpoint、恢复执行和 Redis 线程历史。",
      "带有 trace 视图，用来解释 Agent 为什么检索某些内容、调用哪些工具、在哪些节点等待审批，以及最终引用了哪些来源。",
      "仓库提供本地 deterministic eval harness，可在不调用外部模型、数据库、Redis 或向量库凭据的情况下跑基础评估。"
    ]
  },
  {
    title: "InterviewPilot-AI",
    summary: "一个面向技术求职者的模拟面试教练，把 JD 和简历转成差距诊断、模拟面试、评分报告和改进计划。",
    tag: "Python",
    year: "2026",
    detail:
      "这个项目服务的是准备后端、全栈或 AI 应用岗位面试的候选人。它先分析目标岗位 JD 和候选人简历，再生成能力差距诊断，安排更贴近岗位的模拟面试，最后用 rubric 输出表现报告和后续练习建议。项目强调候选人练习和反馈，不做招聘筛选或录用判断。",
    github: "https://github.com/ZIFeIYUuuuuuu/InterviewPilot-AI",
    homepage: "https://zifeiyuuuuuuu.github.io/InterviewPilot-AI/",
    updatedAt: "2026-05-19",
    stack: ["Python", "JavaScript", "CSS", "HTML"],
    highlights: [
      "流程覆盖 JD 分析、简历分析、差距诊断、简历优化、面试规划、模拟提问、rubric 评分和 coaching plan。",
      "用多 Agent 分工处理候选人准备链路，每个环节有明确输入输出，避免只生成一组泛泛的面试题。",
      "使用严格的 Pydantic schema 和 JSON-only prompt contract，让报告和前端展示更稳定。",
      "提供本地 deterministic fallback，外部 LLM 不可用时也能演示核心流程，并用回归测试覆盖 API 合同、降级输入、会话持久化和报告生成。"
    ]
  },
  {
    title: "selfsite",
    summary: "这个个人站点本身：用于集中展示个人项目、学习笔记和联系方式。",
    tag: "TypeScript",
    year: "2026",
    detail:
      "selfsite 是一个个人 Applied AI 作品集的部署外壳。前端用 Next.js 做页面和交互，后端用 FastAPI 提供服务接口，PostgreSQL/Redis 作为数据层，Caddy 做反向代理。它既是作品展示页，也是后续接入更多项目页、运行状态和自托管内容的基础。",
    github: "https://github.com/ZIFeIYUuuuuuu/selfsite",
    updatedAt: "2026-05-18",
    stack: ["TypeScript", "CSS", "Python", "Dockerfile", "Mako", "JavaScript"],
    highlights: [
      "首页展示 GitHub 身份、精选项目、笔记入口和联系方式，让访问者先知道作者是谁、做过什么。",
      "作品页按 GitHub 公开仓库整理项目，并为每个项目补充用途、功能和技术栈。",
      "以个人作品和学习记录为主，不提供公开留言或音乐播放服务。",
      "支持 Docker Compose 部署：Next.js、FastAPI、PostgreSQL、Redis 和 Caddy 可以按同一套配置启动。"
    ]
  },
  {
    title: "Auto-Stata",
    summary: "自动化实证分析系统：从 Excel 数据出发，完成变量识别、Stata 分析与 Word 报告生成。",
    tag: "Python",
    year: "2026",
    detail:
      "这个项目面向需要做第一轮实证分析的人：把 Excel 数据放进 `input/` 后，系统读取数据、清洗字段、识别中文表头，把变量映射成 Stata 可用名称，并判断被解释变量、解释变量、控制变量、面板 ID 和时间变量。随后它生成可复现的 `.do` 文件，调用 Stata 跑统计分析，最后把表格、图表、日志和解释写进 Word 报告。",
    github: "https://github.com/ZIFeIYUuuuuuu/Auto-Stata",
    updatedAt: "2026-05-18",
    stack: ["Python"],
    highlights: [
      "适合计量经济学教学演示、面板数据和截面问卷数据的原型分析，以及正式论文前的快速探索。",
      "覆盖描述统计、相关性、VIF、OLS/Logit/Probit、固定效应/随机效应、Hausman、稳健性、异质性和可用情况下的 2SLS。",
      "输出包括 `variable_mapping.json`、Stata logs、图表、表格、生成的 `.do` 文件和 Word 实证报告。",
      "正式论文仍需要人工复核，项目更适合节省重复分析和报告整理时间。"
    ]
  },
  {
    title: "ZIFeIYUuuuuuu",
    summary: "GitHub 个人主页 README，用来集中说明个人方向、项目入口和 Applied AI / Agent Builder 身份。",
    tag: "Profile",
    year: "2026",
    detail:
      "这是 GitHub 个人主页仓库。它的作用不是承载应用代码，而是在访问者进入 GitHub 主页时给出第一层介绍：你关注 Applied AI、Agent 工程和相关项目，并把重要仓库组织成更容易浏览的入口。",
    github: "https://github.com/ZIFeIYUuuuuuu/ZIFeIYUuuuuuu",
    updatedAt: "2026-05-18",
    stack: ["Markdown"],
    highlights: [
      "用于维护 GitHub profile README，让个人主页不只是仓库列表。",
      "适合放置项目导航、技术方向、联系方式和最近更新。",
      "和 selfsite 互相补充：GitHub profile 负责开发者主页入口，selfsite 负责更完整的个人博客和作品展示。"
    ]
  }
] as const;

export const legacyNotes: readonly NoteItem[] = [
  {
    slug: "agent-first-team-practice",
    cover: "/notes/agent-engineering-cover.jpg",
    title: "普通团队怎么进入 Agent-first 开发：10 条可以直接照抄的做法",
    shortTitle: "Agent-first 开发",
    format: "Essay",
    summary: "不是教你用 AI 写代码，而是把团队改造成适合 agent 工作的工程环境。",
    lead:
      "过去大家讨论 AI 编程，重点通常是模型会不会写代码。但真正决定团队能不能吃到红利的，往往不是模型本身，而是工程环境是否适合 agent 工作。",
    sections: [
      {
        title: "真正该优化的，不是提示词，而是工程环境",
        paragraphs: [
          "很多团队对 AI 编程的期待是错位的。他们以为问题出在模型不够聪明，其实大量失败都来自任务太模糊、上下文不可见、验证链路不完整。",
          "补全工具只需要看局部代码；agent 要完成完整任务，就需要目标、边界、文档、测试、运行环境、日志和回归机制。工程师的重心也会从亲手写每一行代码，逐步转向拆任务、写约束、定验收标准和维护反馈闭环。"
        ],
        quote: "对人可见，不等于对 agent 可见。对 agent 不可见，就等于不存在。"
      },
      {
        title: "1. 不要先追求 AI 写代码，先让人改成写约束",
        paragraphs: [
          "很多团队接入 AI 后，默认工作流还是老样子：脑中有个模糊需求，然后让 AI 顺手写一下。只要边界、验收条件和不该改的东西没有写清楚，输出天然就会飘。",
          "第一步不是追求全自动，而是改变人类工程师的工作重心：少写模糊指令，多写任务边界，多写不该改什么，多写验收标准。"
        ],
        bullets: [
          "差的任务描述：优化一下设置页。",
          "好的任务描述：将通知设置提取为独立组件；不修改后端接口；补齐 3 个单元测试；通过 typecheck、lint 和 smoke test。"
        ]
      },
      {
        title: "2. 大任务不适合直接扔给 agent，必须拆小",
        paragraphs: [
          "很多人说 agent 不好用，实际上是因为他们把“做一个完整系统”这种模糊任务一次性丢出去。",
          "普通团队应该把任务拆成 agent 能独立闭环的小块：改一个页面，而不是重构前端；加一个 API，而不是做权限系统；写一个迁移脚本，而不是升级数据库架构。"
        ],
        quote: "对 agent 来说，任务越大，不确定性越高；任务越小，反馈越快，纠错成本越低。"
      },
      {
        title: "3. 给 AI 一个固定的 PR 流程，而不是让它一次生成完",
        paragraphs: [
          "更稳定的方式不是“提需求 -> 生成代码 -> 人工看一眼 -> 合并”，而是让 agent 进入一个固定的交付闭环。",
          "更靠谱的流程应该是：agent 先改，自动跑 lint、typecheck、test，agent 自查，再做一次 review，再根据 review 继续修。"
        ],
        quote: "把 AI 当成会持续修正的工程同事，而不是会吐代码的机器，使用效果会完全不同。"
      },
      {
        title: "4. 重要上下文必须留在仓库里，不要靠聊天记录",
        paragraphs: [
          "很多团队的问题不是没有规范，而是规范存在于 Slack、飞书、会议记录或者某个资深同事脑子里。对 agent 来说，这些东西几乎都等于不存在。",
          "普通团队至少要把架构约束、产品规则、运行方式、常见排错步骤和当前执行计划迁回 repo。"
        ]
      },
      {
        title: "5. 文档不要写成一本百科全书，要写成入口 + 分层结构",
        paragraphs: [
          "很多团队会建一个很长的 AGENTS.md 或开发手册，试图把所有内容都塞进去。结果通常是太长、太杂、太旧。",
          "更合理的做法是：一个短入口文件，配几类分层文档，再加上明确的链接关系。"
        ],
        bullets: [
          "AGENTS.md：仓库地图和基本规则。",
          "docs/architecture/：系统结构。",
          "docs/product-specs/：产品逻辑。",
          "docs/runbooks/：运维与排错。",
          "docs/exec-plans/：当前计划。"
        ]
      },
      {
        title: "6. 测试不是为了覆盖率，是为了让 agent 能验证自己",
        paragraphs: [
          "没有测试时，AI 写完代码只能停在“我觉得差不多”。有测试时，它才能形成真正闭环：我改了，我验证了，我知道通过了。",
          "普通团队不用一上来就追求完整测试矩阵。最低配也可以是 lint、typecheck、单元测试、一条 smoke test，再加一条关键路径 e2e。"
        ],
        quote: "测试对 agent 的价值，不只是防回归，而是提供自我修正所需的反馈信号。"
      },
      {
        title: "7. 让 UI 和运行环境可见",
        paragraphs: [
          "纯代码层面的正确，不等于页面真的可用。尤其是前端场景，如果团队想让 agent 处理 UI 问题，就要尽量让它能启动页面、看 DOM、看截图、跑交互流程、复现 bug。",
          "普通团队不必一开始就搭复杂环境，先做到一键启动预览环境、有固定 smoke 路径、能产出截图或测试结果，就已经很有价值。"
        ]
      },
      {
        title: "8. 日志、指标和报错也应该进入 AI 的反馈链路",
        paragraphs: [
          "很多线上问题并不是代码写错了，而是启动慢、接口超时、流程偶发失败，或者某个错误在日志里持续出现。",
          "如果 agent 完全看不到这些信号，它只能在源码层猜；一旦能看到日志和关键指标，它才真正有机会从写代码进化到修系统。"
        ]
      },
      {
        title: "9. 用 CI 检查文档和规范，不要只检查代码",
        paragraphs: [
          "很多团队的 CI 只检查代码：lint、test、build。但如果文档、规则和计划已经成了 agent 的工作上下文，那它们也应该进入 CI。",
          "你可以检查失效链接、文档引用是否存在、架构说明是否对应真实模块，以及新模块是否带最小文档或执行计划。"
        ],
        quote: "当文档开始承担系统输入的角色，它就不再只是说明书，而是工程基础设施的一部分。"
      },
      {
        title: "10. 选择更容易被理解的技术，而不是看起来更高级的技术",
        paragraphs: [
          "在 agent-first 的环境里，技术选型标准会悄悄变化。过去我们更在意框架是否先进、语法是否优雅、抽象是否高级。",
          "但当 agent 成为主要执行者之后，还要多看一个维度：这个技术栈是否容易被解释、被导航、被验证、被修改。少一点黑盒和过度魔法，多一点显式约定、可观测、可测试、可追踪的系统。"
        ]
      }
    ],
    checklist: [
      "建一个短版 AGENTS.md，把仓库地图和基本规则先固定下来。",
      "把 Slack / 飞书里的核心规则迁回仓库，别再散落在聊天记录里。",
      "给每个任务补上边界和验收标准，而不是只写一句“做一下”。",
      "统一一个 verify 脚本，让 lint、typecheck、test 能一键跑完。",
      "把 PR 流程改成“生成 -> 验证 -> 复查 -> 修正”，而不是一次生成完就合并。",
      "先补一条最关键路径的 smoke test，建立最小反馈闭环。",
      "让 agent 能看到页面结果、运行日志和关键报错，而不是只能猜。"
    ],
    closing: [
      "agent-first 开发并不是让 AI 替代工程师，而是重新定义工程师的价值。",
      "真正重要的，不再只是写出代码，而是设计一个让代码能够被稳定生成、验证、修正和维护的系统。"
    ]
  },
  {
    slug: "claimcourt-private-evidence-agent",
    cover: "/notes/claimcourt-evidence-cover.jpg",
    title: "ClaimCourt：把模糊记忆编译成可审计的证据链",
    shortTitle: "ClaimCourt 证据智能体",
    format: "Project Note",
    summary: "在本地私有边界里，让检索、裁决和引用都能回到具体证据。",
    lead:
      "很多问答系统的问题不是不会生成答案，而是无法回答：这句话来自哪个文件、哪个版本、哪一段证据？ClaimCourt 的重点，是把一个模糊请求先编译成检索计划，再让每个结论回到可以复核的证据 ID。",
    sections: [
      {
        title: "先把检索变成计划",
        paragraphs: [
          "ClaimCourt 的 claimcourt 分支把 SQLite FTS5/BM25、BGE 向量检索和 Cross-Encoder 重排组合起来。关键词匹配负责召回，向量检索补充语义相似度，重排器再把候选压缩成更适合裁决的证据集合。",
          "这个顺序比直接把所有文档塞给模型更容易解释：每一步都有输入、候选和筛选结果，出现错误时可以定位到底是召回漏了，还是重排和裁决出了问题。"
        ],
        quote: "先证明证据在哪里，再讨论模型应该怎么说。"
      },
      {
        title: "控方、辩方和法官不是装饰",
        paragraphs: [
          "多 Agent 流程的价值不在于角色名字，而在于把单次生成拆成相互制约的步骤。控方寻找支持主张的证据，辩方主动寻找反例和缺口，法官只在引用 ID 白名单允许的范围内组织结论。",
          "SHA-256 证据账本、脱敏和人工审批把“模型说了什么”变成“模型引用了什么”。这仍然不能自动保证结论正确，但让错误具备可追责和可复核的入口。"
        ]
      },
      {
        title: "指标要和边界一起发布",
        paragraphs: [
          "仓库 README 报告了 320/320 条合成对抗查询通过、危险错误自动选择为 0，以及 Radeon PRO W7900 上的延迟和吞吐数据。这些是仓库提供的 benchmark 结果，应该按复现条件理解，不能直接包装成独立第三方验收。",
          "项目定位是私有本地 AI Agent 的 hackathon 作品。加密、多用户隔离和后台同步仍属于进入生产前需要继续补齐的门槛。"
        ]
      }
    ],
    checklist: [
      "查看 claimcourt 分支中的 README、tests 和 evidence 文件。",
      "复现 benchmark 时记录 GPU、模型、数据集和查询生成方式。",
      "把证据引用、人工审批和数据隔离作为上线前的独立验收项。"
    ],
    closing: [
      "私有证据智能体的核心竞争力，不是回答更像人，而是每个回答都更容易被追问和复核。"
    ]
  },
  {
    slug: "solo-company-harness-delivery",
    cover: "/notes/delivery-contract-cover.jpg",
    title: "Solo Company Harness：AI Coding 为什么需要合同、证据和反作弊验收",
    shortTitle: "AI Coding 交付闭环",
    format: "Engineering Note",
    summary: "把 Agent 从代码生成器变成有边界、有证据、能复盘的交付执行者。",
    lead:
      "AI Coding 最容易展示的是生成速度，最难证明的是交付质量。Solo Company Harness 试图解决的不是“怎么让模型多写几行代码”，而是怎样让一次改动从目标开始，到真实路径验证和经验沉淀结束。",
    sections: [
      {
        title: "八个阶段把模糊任务拆开",
        paragraphs: [
          "Intent 明确为什么做，Context 固定必须知道的项目事实，Contract 写清验收标准和非目标，Execute 保持小步可逆，Verify 记录实际证据，Release 控制发布范围，Observe 收集残余风险，Distill 把重复经验沉淀下来。",
          "这条链路的意义，是让“完成”不再等于代码写完，而是等于目标、范围、证据和回滚边界都能被另一个人复查。"
        ],
        quote: "没有验收合同的生成，只是一次看起来很顺利的猜测。"
      },
      {
        title: "Design-Locked 和 Discovery-Gated",
        paragraphs: [
          "当模块设计、用户故事和验收标准已经完整时，模块进入 Design-Locked，Agent 才适合按合同实现。设计缺失、过期或仍是草稿时，Discovery-Gated 允许调研和补文档，但不应直接修改生产代码、数据库结构或公开 API。",
          "这个门槛把“先写了再说”的冲动变成一个显式决定，也给用户留下真正需要确认的地方。"
        ]
      },
      {
        title: "L0-L4 让证据强度说清楚",
        paragraphs: [
          "L0 是静态检查，L1 是本地测试或构建，L2 是集成验证，L3 是真实第三方和真实用户路径，L4 是自己或种子用户的 dogfood。不同风险的任务需要不同最低等级，不能用绿色 lint 冒充真实路径通过。",
          "Anti-gaming 规则进一步排除了 fixture、mock、写死返回值和只验证页面能打开等伪证据。它的价值不是让流程变重，而是防止指标通过和用户目标完成被混为一谈。"
        ]
      }
    ],
    checklist: [
      "给正式功能写出目标、非目标、验收标准和回滚方式。",
      "在运行记录里标明实际达到的证据等级。",
      "把重复故障沉淀为 case log 或 playbook，而不是只留在聊天记录里。"
    ],
    closing: [
      "Agent 越能写代码，人越需要把边界、证据和责任写清楚。"
    ]
  },
  {
    slug: "super-agent-workbench-boundaries",
    cover: "/notes/super-agent-workbench-cover.jpg",
    title: "Super Agent：把 RAG、MCP 和人工审批放进一个可解释工作台",
    shortTitle: "Super Agent 工作台",
    format: "Project Note",
    summary: "从流式对话走向可暂停、可追踪、可恢复的 Agent 工作流。",
    lead:
      "聊天框能展示模型会不会回答问题，工作台才开始回答系统能不能把任务做完。Super Agent 把流式对话、工具调用、RAG 检索、MCP、人工审批和会话恢复放进同一套前后端骨架。",
    sections: [
      {
        title: "把过程变成一等数据",
        paragraphs: [
          "前端通过 API 连接 FastAPI 后端，后端用 LangGraph 编排模型、工具、检索和审批节点，再通过 SSE 返回 token、工具调用、检索来源和恢复执行过程。这样用户看到的不是一段孤立文本，而是一条能解释“为什么走到这里”的执行轨迹。",
          "人工审批不是流程中断，而是一个可恢复的 checkpoint。系统需要保存线程历史、待审批状态和后续恢复动作，才能把半自动流程变成真正可用的工作台。"
        ]
      },
      {
        title: "Demo 的边界要写在页面上",
        paragraphs: [
          "项目仓库提供 GitHub Pages 静态 demo，也提供离线 deterministic harness。RAG、MCP、Redis、PostgreSQL/PGVector 和真实模型链路仍需要本地或私有部署，不能把静态页面或离线 benchmark 写成线上服务已经具备这些能力。",
          "这条边界本身就是项目的一部分：作品集展示的是系统设计和可复现入口，线上可用性则需要另外的环境和真实路径证据。"
        ],
        quote: "能打开 demo，不等于后端真的完成了一次任务。"
      }
    ],
    checklist: [
      "先用离线 harness 验证编排和 API 合同。",
      "再用真实模型、数据库、Redis 和 MCP 走一条端到端路径。",
      "发布时区分静态 demo、私有部署和线上服务三个状态。"
    ],
    closing: [
      "一个值得信任的 Agent 产品，应该同时展示能力、过程和仍然没有解决的边界。"
    ]
  }
] as const;

export const notes = rewrittenNotes;

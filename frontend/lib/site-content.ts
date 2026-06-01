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
  slug: string;
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
  intro: "写前端、后端，也在做 AI Agent 工程。",
  about: "这里收集我正在推进的项目、开发笔记和一些值得留下来的工程记录。",
  philosophy: "页面要清楚，代码要诚实，交付要能跑，复杂系统也要能被解释。",
  email: "",
  github: "https://github.com/ZIFeIYUuuuuuu",
  githubAvatar: "https://avatars.githubusercontent.com/u/273586639?v=4",
  publicRepos: 6,
  qq: "",
  wechat: ""
} as const;

export const githubRepositories: readonly GitHubRepository[] = [
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
  {
    name: "programmer-voice-input",
    href: "https://github.com/ZIFeIYUuuuuuu/programmer-voice-input",
    description: "面向程序员的语音输入 HUD，探索更轻的编码输入方式。",
    language: "Python"
  }
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
    summary: "这个个人博客站点本身：用于集中展示项目、笔记、联系方式和一个自托管音乐播放器。",
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
      "包含本地音乐目录读取能力，未配置外部音频时可通过 `/api/audio` 和 `/api/audio/tracks` 播放自托管音乐。",
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
    title: "programmer-voice-input",
    summary: "一个给程序员用的语音输入 HUD，把实时语音识别、文本润色、剪贴板和粘贴流程串起来。",
    tag: "TypeScript",
    year: "2026",
    detail:
      "这个项目解决的是编码时长文本输入不够顺手的问题。它把语音转文字放进一个轻量 HUD：用户说出需求、注释或说明，系统通过 DashScope ASR 做实时识别，可选地对文本进行润色，然后写入剪贴板或直接粘贴到当前工作流里。它更像一个面向开发者的输入辅助工具，而不是通用录音软件。",
    github: "https://github.com/ZIFeIYUuuuuuu/programmer-voice-input",
    updatedAt: "2026-05-18",
    stack: ["TypeScript", "Rust", "CSS", "PowerShell", "JavaScript", "Batchfile", "VBScript", "HTML"],
    highlights: [
      "使用 TypeScript 和 Rust 构建桌面/HUD 类交互，配合脚本处理 Windows 上的启动、剪贴板和粘贴体验。",
      "支持实时 DashScope ASR，把口述内容快速转成可编辑文本。",
      "可在写代码、写 commit message、写说明文档时减少键盘输入成本。",
      "仓库公开简介强调 optional text polish，说明它不仅转写语音，也考虑把口语整理成更适合粘贴的文本。"
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

export const notes: readonly NoteItem[] = [
  {
    slug: "agent-first-team-practice",
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
  }
] as const;

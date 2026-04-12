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
  stack?: readonly string[];
  highlights?: readonly string[];
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
  role: "一个路过的程序员",
  intro: "写前端，也写后端。",
  about: "这里先放作品、笔记和一些值得留下来的开发记录。",
  philosophy: "页面要清楚，代码要诚实，交付要能跑。",
  email: "17849063915@163.com",
  github: "https://github.com/ZIFeIYUuuuuuu",
  qq: "1597609560",
  wechat: "子非鱼"
} as const;

export const capabilities = [
  "关注前后端协作是否顺畅，而不只是页面好不好看。",
  "喜欢先把目录、配置和运行方式理顺，再往里面加功能。",
  "愿意把复杂问题拆成可落地的小块，再逐步交付。"
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
    title: "Auto-Stata",
    summary: "自动化实证分析系统：从 Excel 数据出发，完成变量识别、Stata 分析与 Word 报告生成。",
    tag: "Automation",
    year: "2026",
    detail:
      "把 Excel、LLM、Stata 和 Word 报告串成一条完整流程，适合教学演示、基础计量分析和需要快速产出结果与报告的研究场景。",
    github: "https://github.com/ZIFeIYUuuuuuu/Auto-Stata",
    stack: ["Python", "Stata", "DashScope / Qwen", "Excel", "Word"],
    highlights: [
      "自动读取和清洗 Excel 数据，处理中文表头与变量映射。",
      "识别被解释变量、解释变量、控制变量、面板标识和时间变量。",
      "调用 Stata 执行描述统计、VIF、回归、稳健性和面板分析。",
      "自动生成 .do 文件和 Word 报告，保留分析过程的可复现性。"
    ]
  },
  {
    title: "super-agent",
    summary: "智能体工作台：把流式聊天、工具调用、RAG、人工审批和会话缓存放进同一套前后端应用。",
    tag: "Agent Platform",
    year: "2026",
    detail:
      "项目用 FastAPI、LangGraph、PostgreSQL/PGVector、Redis 和 Next.js 15 组成完整工作台，面向多工具接入、文档检索、人工审批与恢复执行这类智能体场景。",
    github: "https://github.com/ZIFeIYUuuuuuu/super-agent",
    stack: ["FastAPI", "LangGraph", "PostgreSQL", "PGVector", "Redis", "Next.js 15"],
    highlights: [
      "支持流式聊天与 SSE 输出，便于把智能体执行过程直接展示到前端。",
      "接入 MCP 与工具调用链路，支持外部工具扩展。",
      "提供 RAG 文档上传与检索能力，把文档知识接进对话流程。",
      "加入人工审批、恢复执行和 Redis 会话历史缓存，适合继续往真实生产场景扩展。"
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

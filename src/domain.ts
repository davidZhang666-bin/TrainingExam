export type Page =
  'dashboard' | 'catalog' | 'learning' | 'exams' | 'certificates' | 'analytics' | 'settings';
export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  paragraphs: string[];
  takeaway: string;
}
export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  instructor: string;
  role: string;
  color: 'purple' | 'peach' | 'mint' | 'blue';
  art: 'design' | 'data' | 'talk' | 'shield';
  level: string;
  rating: number;
  students: number;
  lessons: Lesson[];
  skills: string[];
}
export interface Question {
  id: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface Exam {
  id: string;
  title: string;
  category: string;
  minutes: number;
  pass: number;
  courseId: string;
  questions: Question[];
}
export interface Attempt {
  id: string;
  examId: string;
  answers: Record<string, number>;
  score: number;
  submittedAt: string;
}
export interface Draft {
  examId: string;
  answers: Record<string, number>;
  deadline: number;
  index: number;
}
export interface Activity {
  date: string;
  minutes: number;
  courseId: string;
}
export interface Profile {
  name: string;
  department: string;
  role: string;
  goal: number;
  reminder: boolean;
}
export interface LearningState {
  version: 1;
  profile: Profile;
  enrolled: string[];
  completed: string[];
  favorites: string[];
  notes: Record<string, string>;
  attempts: Attempt[];
  draft: Draft | null;
  activity: Activity[];
  readNotifications: string[];
}

export const pageNames: Record<Page, string> = {
  dashboard: '学习概览',
  catalog: '课程中心',
  learning: '我的学习',
  exams: '考试中心',
  certificates: '我的证书',
  analytics: '学习报告',
  settings: '个人设置',
};

export const courses: Course[] = [
  {
    id: 'design',
    title: '设计思维与创新实践',
    subtitle: '从发现问题到创造价值，用设计思维打开新视角。',
    category: '通用能力',
    instructor: '林知夏',
    role: '资深体验设计师',
    color: 'purple',
    art: 'design',
    level: '入门',
    rating: 4.9,
    students: 1286,
    skills: ['用户洞察', '创意思考', '原型验证'],
    lessons: [
      {
        id: 'design-1',
        title: '重新认识设计思维',
        minutes: 12,
        paragraphs: [
          '设计思维是一种以人为中心的问题解决方法。它从真实需求出发，把可取性、可行性与商业价值放在一起考虑。',
          '在优化培训报名流程前，先观察学员在哪里犹豫。你可能发现，真正的障碍并非按钮不够醒目，而是大家不知道课程是否适合自己。',
          '设计思维常见的五个阶段是共情、定义、构思、原型与测试。这些阶段可以反复迭代，并不是只能执行一次的线性流程。',
        ],
        takeaway: '先理解人的需求，再决定要解决什么问题。',
      },
      {
        id: 'design-2',
        title: '用共情发现真实需求',
        minutes: 18,
        paragraphs: [
          '访谈时使用开放问题，例如“请讲讲你最近一次学习的经历”。避免用“你是不是觉得课程太难”这样的引导式问题。',
          '把观察分成事实与推断。事实是“学员在课程介绍页停留了三分钟”，推断是“学员可能看不懂介绍”。推断需要进一步验证。',
          '用需求陈述整理洞察：某类用户需要某种帮助，因为某个真实原因。聚焦问题，而不是在陈述中预设解决方案。',
        ],
        takeaway: '观察行为、倾听经历，并区分事实与假设。',
      },
      {
        id: 'design-3',
        title: '从创意到低成本原型',
        minutes: 15,
        paragraphs: [
          '先发散再收敛。团队可以在限定时间内分别写出方案，再按用户价值与实现成本进行比较，避免最先发言的人决定所有方向。',
          '原型是用来回答问题的工具。纸面草图、可点击页面和模拟服务都可以是原型，精细程度应由需要验证的假设决定。',
          '把“制作完整平台”缩小为“用三张页面验证学员是否理解选课流程”，可以更快得到有价值的反馈。',
        ],
        takeaway: '选择能验证核心假设的最小原型。',
      },
      {
        id: 'design-4',
        title: '测试反馈与持续迭代',
        minutes: 16,
        paragraphs: [
          '测试前先设定可观察的成功标准，例如“用户能在两分钟内找到适合自己的入门课程”。',
          '让用户独立完成任务，记录卡点，不要在旁边不断解释界面。观察用户做了什么，比只问喜不喜欢更可靠。',
          '将反馈按严重程度、出现频率与影响范围排序。每轮优先修复关键问题，再重复验证。',
        ],
        takeaway: '用真实行为验证方案，以证据推动迭代。',
      },
    ],
  },
  {
    id: 'data',
    title: '人人都能学的数据分析',
    subtitle: '把复杂数据变成清晰洞察，让决策更有依据。',
    category: '数字技能',
    instructor: '陈一川',
    role: '数据分析负责人',
    color: 'peach',
    art: 'data',
    level: '入门',
    rating: 4.8,
    students: 962,
    skills: ['指标拆解', '数据可视化', '分析表达'],
    lessons: [
      {
        id: 'data-1',
        title: '从业务问题定义指标',
        minutes: 15,
        paragraphs: [
          '分析从问题开始。将“学习效果不好”改写为“本月新员工的课程完成率下降了多少”，可以明确人群、时间和衡量标准。',
          '完成率应有一致口径，例如已完成课程人数除以已报名人数。分子与分母必须采用同一时间范围和人群。',
          '同时关注结果指标与过程指标。考试通过率反映结果，章节完成进度与练习频次帮助解释变化。',
        ],
        takeaway: '先明确问题与口径，再收集数据。',
      },
      {
        id: 'data-2',
        title: '清洗数据与识别异常',
        minutes: 20,
        paragraphs: [
          '先检查缺失值、重复记录和字段类型。时间字符串未统一格式会让同一天被错误分组。',
          '异常值不应直接删除。先确认它是录入错误、系统重复上报，还是一个真实的特殊案例。',
          '保留原始数据和清洗步骤，记录每一步的理由，使分析结果可以复现。',
        ],
        takeaway: '异常需要解释，处理过程需要可追溯。',
      },
      {
        id: 'data-3',
        title: '选对图表讲清事实',
        minutes: 16,
        paragraphs: [
          '趋势适合折线图，类别比较适合条形图，占比可以用百分比堆叠图。先决定要表达的关系，再选择图表。',
          '条形图应从零开始，避免夸大差异。用明确的单位、时间范围和数据来源帮助读者判断。',
          '相关性不代表因果关系。课程学习时长与成绩一起上升，并不能单独证明延长学习时间一定提高成绩。',
        ],
        takeaway: '图表要准确传达关系，避免视觉误导。',
      },
      {
        id: 'data-4',
        title: '把洞察转化为行动',
        minutes: 14,
        paragraphs: [
          '分析结论应同时包含事实、可能原因和建议行动。例如某章节退出率高，可以先访谈学员，再验证内容是否过长。',
          '针对建议设置负责人、完成日期和效果指标。没有后续验证的建议很难形成闭环。',
          '使用小规模实验评估改动效果，尽量控制其他变量，并说明样本量与结果的不确定性。',
        ],
        takeaway: '好分析以可验证的行动结束。',
      },
    ],
  },
  {
    id: 'communication',
    title: '高效沟通与团队协作',
    subtitle: '让表达被理解，让协作更顺畅。',
    category: '通用能力',
    instructor: '许清和',
    role: '组织发展顾问',
    color: 'mint',
    art: 'talk',
    level: '进阶',
    rating: 4.9,
    students: 2048,
    skills: ['结构表达', '积极倾听', '团队反馈'],
    lessons: [
      {
        id: 'communication-1',
        title: '先对齐目标，再开始表达',
        minutes: 10,
        paragraphs: [
          '沟通前先明确希望对方知道什么、决定什么或采取什么行动。信息越多不代表沟通越有效。',
          '使用“结论、理由、事实、行动”的结构。先给结论，再提供对方判断所需的依据。',
        ],
        takeaway: '以目标组织表达，以事实支持结论。',
      },
      {
        id: 'communication-2',
        title: '倾听与澄清的技巧',
        minutes: 14,
        paragraphs: [
          '倾听不是等待自己发言。复述对方的核心意思，再请对方确认，可以减少误解。',
          '遇到模糊表述时询问具体例子，例如“你提到流程慢，最近一次发生在哪个环节？”',
        ],
        takeaway: '用复述和开放提问验证理解。',
      },
      {
        id: 'communication-3',
        title: '给出可执行的反馈',
        minutes: 16,
        paragraphs: [
          '描述具体情境、可观察行为及其影响，不给对方贴人格标签。',
          '提出可执行的下一步，并邀请对方解释背景。共同确定改进方式和回顾时间。',
        ],
        takeaway: '反馈聚焦行为和影响，最终落到行动。',
      },
      {
        id: 'communication-4',
        title: '处理分歧与推动共识',
        minutes: 12,
        paragraphs: [
          '分歧出现时，先确认共同目标，再把不同方案背后的约束写清楚。',
          '区分可以立即决定的事项和需要补充证据的事项。记录结论、负责人和截止日期。',
        ],
        takeaway: '把立场分歧转成对目标与证据的讨论。',
      },
    ],
  },
  {
    id: 'security',
    title: '信息安全必修课',
    subtitle: '识别身边的安全风险，守护每一份信任。',
    category: '合规必修',
    instructor: '周予安',
    role: '信息安全专家',
    color: 'blue',
    art: 'shield',
    level: '必修',
    rating: 4.8,
    students: 3560,
    skills: ['风险识别', '数据保护', '安全习惯'],
    lessons: [
      {
        id: 'security-1',
        title: '识别钓鱼邮件与可疑链接',
        minutes: 12,
        paragraphs: [
          '攻击者常通过紧急通知、中奖或冒充同事索取密码。收到可疑邮件时，检查完整发件地址与链接目标。',
          '不要通过可疑邮件中的入口登录账号。通过已知的官方入口核实，并向企业安全团队报告。',
        ],
        takeaway: '不轻信紧急请求，通过可信渠道核实。',
      },
      {
        id: 'security-2',
        title: '密码与多因素认证',
        minutes: 10,
        paragraphs: [
          '为不同服务使用独立的长密码，并使用可靠的密码管理器。',
          '启用多因素认证。任何人索取验证码都应保持警惕，不要把验证码告诉他人。',
        ],
        takeaway: '独立密码与多因素认证一起保护账号。',
      },
      {
        id: 'security-3',
        title: '敏感数据的安全处理',
        minutes: 15,
        paragraphs: [
          '按企业制度对数据分类分级。共享文件前确认接收者、权限与保存期限。',
          '遵循最小权限原则，只授予完成当前工作所必需的访问权限。',
        ],
        takeaway: '只收集必要数据，只授予必要权限。',
      },
      {
        id: 'security-4',
        title: '发现风险后的正确响应',
        minutes: 11,
        paragraphs: [
          '发现误发文件或账号异常后，及时报告，不要擅自删除所有日志。',
          '记录发现时间、异常表现和已采取的措施，按安全响应流程减少影响。',
        ],
        takeaway: '及时报告、保留证据、按流程响应。',
      },
    ],
  },
];

export const exams: Exam[] = [
  {
    id: 'design-exam',
    title: '设计思维能力测评',
    category: '通用能力',
    courseId: 'design',
    minutes: 15,
    pass: 80,
    questions: [
      {
        id: 'd1',
        text: '设计思维最核心的出发点是什么？',
        options: ['使用最新技术', '理解人的真实需求', '尽快完成开发', '复制热门方案'],
        answer: 1,
        explanation: '设计思维以人为中心，先理解真实需求，再寻找合适的解决方案。',
      },
      {
        id: 'd2',
        text: '以下哪一种访谈提问更有助于发现真实需求？',
        options: [
          '你是不是觉得课程太难？',
          '你一定喜欢视频课程吧？',
          '请讲讲你最近一次学习的经历。',
          '这个按钮是不是很好看？',
        ],
        answer: 2,
        explanation: '开放式问题鼓励用户描述真实经历，避免引导答案。',
      },
      {
        id: 'd3',
        text: '制作早期原型的主要目的是什么？',
        options: ['验证关键假设', '展示全部功能', '代替用户研究', '一次完成最终产品'],
        answer: 0,
        explanation: '原型应以较低成本验证最重要的假设，不必包含全部功能。',
      },
      {
        id: 'd4',
        text: '用户测试中，哪一种做法更可靠？',
        options: [
          '不断指导用户点击',
          '只询问用户喜不喜欢',
          '只邀请项目成员测试',
          '观察用户独立完成任务',
        ],
        answer: 3,
        explanation: '独立完成任务能暴露真实卡点，避免解释和引导掩盖问题。',
      },
      {
        id: 'd5',
        text: '面对测试反馈，首先应该怎么做？',
        options: ['实现所有建议', '按影响与频率确定优先级', '只采纳正面意见', '立即推翻整个方案'],
        answer: 1,
        explanation: '结合严重程度、出现频率及影响范围，优先改进关键问题。',
      },
    ],
  },
  {
    id: 'data-exam',
    title: '数据分析基础测评',
    category: '数字技能',
    courseId: 'data',
    minutes: 15,
    pass: 80,
    questions: [
      {
        id: 'a1',
        text: '开展数据分析的第一步应该是什么？',
        options: ['制作图表', '删除异常值', '明确业务问题和指标口径', '汇总所有数据'],
        answer: 2,
        explanation: '先定义业务问题、时间范围和指标口径，才能有针对性地分析。',
      },
      {
        id: 'a2',
        text: '发现异常值时，正确的处理方式是？',
        options: ['先调查原因再决定处理方式', '全部删除', '统一改为零', '忽略并继续'],
        answer: 0,
        explanation: '异常可能是错误，也可能是真实情况，需要核实来源。',
      },
      {
        id: 'a3',
        text: '展示近七天学习时长的变化，适合使用什么图？',
        options: ['饼图', '关系网络图', '词云', '折线图'],
        answer: 3,
        explanation: '折线图适合展示随时间变化的趋势。',
      },
      {
        id: 'a4',
        text: '两项指标同时上升，能得出什么结论？',
        options: ['一定存在因果关系', '可能相关，因果关系需要验证', '数据一定有错', '无需更多分析'],
        answer: 1,
        explanation: '相关性不能单独证明因果关系，还需要控制变量和补充证据。',
      },
      {
        id: 'a5',
        text: '让分析建议可落地，应该补充什么？',
        options: ['更多装饰图表', '更长的报告', '负责人、时间和验证指标', '模糊的愿景'],
        answer: 2,
        explanation: '明确负责人、时间和验证指标，才能形成行动闭环。',
      },
    ],
  },
  {
    id: 'security-exam',
    title: '信息安全合规考试',
    category: '合规必修',
    courseId: 'security',
    minutes: 10,
    pass: 80,
    questions: [
      {
        id: 's1',
        text: '收到要求立即输入密码的陌生邮件，应如何处理？',
        options: ['立即输入', '通过可信入口核实并报告', '转发给所有同事', '回复自己的验证码'],
        answer: 1,
        explanation: '不要使用可疑链接，应通过已知官方渠道核实并报告。',
      },
      {
        id: 's2',
        text: '以下哪种账号保护方式更安全？',
        options: [
          '所有账号使用同一密码',
          '密码写在公开便签上',
          '关闭登录通知',
          '独立长密码并启用多因素认证',
        ],
        answer: 3,
        explanation: '独立长密码减少撞库风险，多因素认证增加保护。',
      },
      {
        id: 's3',
        text: '最小权限原则的含义是什么？',
        options: [
          '仅授予完成工作所必需的权限',
          '所有成员拥有管理员权限',
          '不设置访问权限',
          '永久保留全部共享链接',
        ],
        answer: 0,
        explanation: '权限应与当前任务所需相匹配，并定期复核。',
      },
      {
        id: 's4',
        text: '发现敏感文件误发后，首先应该怎么做？',
        options: ['隐瞒事件', '删除所有日志', '及时报告并按流程减少影响', '等待别人发现'],
        answer: 2,
        explanation: '及时报告并保留相关证据，有利于控制风险和调查原因。',
      },
      {
        id: 's5',
        text: '同事通过聊天索要你的验证码，正确的做法是？',
        options: ['直接发送', '不提供验证码并核实身份', '发送部分验证码', '公开到群里'],
        answer: 1,
        explanation: '验证码是身份凭证，不应向任何人透露。',
      },
    ],
  },
];

export const courseProgress = (course: Course, completed: string[]) =>
  Math.round(
    (course.lessons.filter((l) => completed.includes(l.id)).length / course.lessons.length) * 100,
  );
export const courseMinutes = (course: Course) =>
  course.lessons.reduce((sum, l) => sum + l.minutes, 0);

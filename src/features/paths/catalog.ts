import type { LearningPath } from './types';

export const learningPaths: LearningPath[] = [
  {
    id: 'onboarding',
    title: '新同事成长路线',
    summary: '从安全习惯到协作表达，为加入团队做好准备。',
    audience: '新入职成员与跨部门协作者',
    outcome: '能够识别常见信息风险，清晰表达目标并组织可追踪的协作行动。',
    color: 'mint',
    steps: [
      {
        courseId: 'security',
        objective: '建立账号、文件分享与风险报告的基本习惯',
        requireExam: true,
      },
      {
        courseId: 'communication',
        objective: '练习澄清目标、倾听反馈与行动记录',
        requireExam: false,
      },
    ],
  },
  {
    id: 'problem-solving',
    title: '从问题到解决方案',
    summary: '先理解真实需求，再用数据验证方案效果。',
    audience: '产品、运营和业务分析岗位',
    outcome: '能够区分事实和假设，设计最小原型，并用一致的指标口径判断效果。',
    color: 'purple',
    steps: [
      { courseId: 'design', objective: '通过共情、原型和测试发现可执行的方案', requireExam: true },
      { courseId: 'data', objective: '用清晰的指标、数据检查和图表验证变化', requireExam: true },
    ],
  },
  {
    id: 'collaborative-analysis',
    title: '让洞察带来行动',
    summary: '将数据判断转化为团队理解和共同执行。',
    audience: '项目负责人、团队骨干',
    outcome: '能够准确呈现证据，并为建议明确负责人、期限和回顾方式。',
    color: 'peach',
    steps: [
      { courseId: 'data', objective: '建立指标口径并识别分析中的局限', requireExam: true },
      { courseId: 'communication', objective: '用结构化表达推动行动共识', requireExam: false },
    ],
  },
];

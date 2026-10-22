import type { Assignment } from './types';

export const assignments: Assignment[] = [
  {
    id: 'research-plan',
    courseId: 'design',
    title: '设计一次学习体验访谈',
    minutes: 30,
    minLength: 120,
    brief: '围绕一个具体的选课困难，写出可以实际执行的访谈计划。',
    context: '新员工常在课程介绍页停留很久，但报名率不高。团队希望理解原因，而不是直接重做页面。',
    deliverable: '写明研究问题、访谈对象、至少三个开放问题、记录方式，以及如何把事实与推断分开。',
    rubric: [
      {
        id: 'problem',
        label: '问题聚焦具体行为',
        guidance: '说明要观察哪类人、哪个环节，避免泛泛询问是否满意。',
      },
      {
        id: 'neutral',
        label: '问题保持中立',
        guidance: '开放问题不预设课程太难、按钮不好找等结论。',
      },
      {
        id: 'evidence',
        label: '有可追踪的证据记录',
        guidance: '明确记录原话、行为和情境，另外标注推断。',
      },
      {
        id: 'decision',
        label: '说明结果如何支持决策',
        guidance: '写出什么证据会让团队采取或放弃一种方案。',
      },
    ],
  },
  {
    id: 'metric-review',
    courseId: 'data',
    title: '审查一份培训数据结论',
    minutes: 35,
    minLength: 150,
    brief: '检查指标口径，并给出有依据的改进计划。',
    context:
      '上月 80 人报名、48 人完成；本月 120 人报名、60 人完成。有人认为“完成人数增加 25%，培训效果显著提升”。',
    deliverable: '计算两个月完成率，指出结论的限制，列出需要补充的信息，并设计一个小规模验证。',
    rubric: [
      {
        id: 'ratio',
        label: '人数和比例分别计算',
        guidance: '上月完成率 60%，本月 50%；人数增长与比例下降同时存在。',
      },
      {
        id: 'cohort',
        label: '检查人群与时间口径',
        guidance: '核对报名时间、课程长度和可完成窗口，避免不同人群直接比较。',
      },
      {
        id: 'causal',
        label: '避免把相关当因果',
        guidance: '说明材料不能独立证明培训方法造成了结果变化。',
      },
      {
        id: 'experiment',
        label: '提出可执行验证',
        guidance: '给出负责人、样本、观察周期和成功标准。',
      },
    ],
  },
  {
    id: 'feedback-plan',
    courseId: 'communication',
    title: '把一次分歧转成行动',
    minutes: 25,
    minLength: 100,
    brief: '用事实、影响和下一步组织一次团队反馈。',
    context:
      '业务团队希望立即上线新培训页面，研发认为需求仍有歧义。会议结束后，双方都以为对方会先发起下一步。',
    deliverable: '写一段中立的反馈，再列出至少两项行动，说明负责人、日期和验收方式。',
    rubric: [
      {
        id: 'fact',
        label: '描述事实而非指责',
        guidance: '指出未明确的事项，避免“总是”“不负责”等人格判断。',
      },
      { id: 'goal', label: '明确共同目标', guidance: '说明双方都希望达到的业务结果以及约束。' },
      {
        id: 'owner',
        label: '行动责任明确',
        guidance: '每项行动都有具体负责人、日期和可判断完成的标准。',
      },
    ],
  },
  {
    id: 'incident-checklist',
    courseId: 'security',
    title: '建立误分享处置清单',
    minutes: 20,
    minLength: 100,
    brief: '为敏感培训资料误分享场景写出有顺序的处理步骤。',
    context:
      '一份包含内部业务案例的培训文件被分享到公开链接。你收到同事提醒，目前尚不清楚访问范围。',
    deliverable: '列出立即处置、报告、证据保留和后续改进步骤。不要填入真实客户或员工信息。',
    rubric: [
      {
        id: 'contain',
        label: '先减少暴露范围',
        guidance: '按权限和流程撤回分享，并记录时间和范围。',
      },
      {
        id: 'report',
        label: '及时报告责任团队',
        guidance: '说明需要报告的信息，不自行隐瞒或作出无依据结论。',
      },
      { id: 'preserve', label: '保留必要调查证据', guidance: '保留访问和操作记录，避免删除日志。' },
      {
        id: 'prevent',
        label: '改进权限与复核流程',
        guidance: '提出最小权限、有效期和发布前复核的具体措施。',
      },
    ],
  },
];

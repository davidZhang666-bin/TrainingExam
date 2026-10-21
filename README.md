# 知序学习 · TrainingExam

基于 **React 19 + TypeScript + Vite** 的中文培训、学习与考试系统。以浅紫色成长工作台为视觉主题，支持桌面和手机访问。

这是可独立运行的前端演示：课程、讲师和初始学习记录为示例数据；个人资料、进度、笔记和考试记录保存在当前浏览器。无需账号或后端即可体验完整流程。

## 快速开始

建议使用 **Node.js 24 LTS** 与 npm 11。

```bash
git clone https://github.com/davidZhang666-bin/TrainingExam.git
cd TrainingExam
git switch codex/training-learning-exams
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://localhost:5173`。

```bash
npm run build      # TypeScript 检查与生产构建，输出 dist/
npm run preview    # 预览生产构建
```

`dist/` 可部署至静态站点服务。使用 hash 导航，无需服务器配置路由回退。所有运行资源均随构建发布，不依赖在线字体或图片服务。

## 功能

| 模块 | 已实现能力 |
| --- | --- |
| 学习概览 | 真实记录统计、继续学习、推荐课程、学习足迹、每周目标、下一步建议 |
| 课程中心 | 4 门课程、16 个图文章节、关键词搜索、分类、排序、收藏、课程详情与报名 |
| 我的学习 | 课程状态筛选、章节导航、按顺序完成、幂等进度记录、章节笔记自动保存 |
| 考试中心 | 3 场测评、15 道带解析的单选题、须知确认、答题卡、草稿恢复、持续计时、手动及超时交卷 |
| 学习复盘 | 自动评分、及格判断、逐题解析、历次成绩、按最近一次作答更新错题集 |
| 我的证书 | 通过测评获得证书、预览、安全转义的 SVG 图片下载 |
| 学习报告 | 时间范围筛选、学习投入、连续天数、分类时长、课程进度、历史最佳成绩 |
| 个人设置 | 资料编辑、目标设置、提醒偏好、恢复示例数据前的输入确认 |
| 数据管理 | JSON 完整备份、校验和预览后恢复、带中文 BOM 和公式防护的 CSV 报告 |
| 通用体验 | 全局搜索（Ctrl / ⌘ K）、学习通知、已读状态、键盘焦点管理、手机导航 |

体验建议：从「课程中心」查看课程并加入学习；完成章节后到「考试中心」测评；交卷查看解析；达到 80 分后到「我的证书」下载证明。每场考试均可重新挑战。

## 测试与检查

```bash
npm test                           # 评分、持久化恢复、备份和导出安全测试
npx playwright install chromium    # 首次运行浏览器测试前安装
npm run test:e2e                    # 桌面与手机端流程测试
npm run format:check                # 代码格式检查
npm run verify:history              # 检查 30 次有效 Conventional Commits 提交
```

如已安装 Google Chrome，可以跳过浏览器下载：

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

macOS / Linux：`PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`。测试失败时可在 `playwright-report/` 查看报告。GitHub Actions 自动执行单元测试、构建及浏览器测试。

## 目录

```text
src/
  components/        通用弹窗、课程卡片、答题器、报告图表等
  pages/             学习概览、课程、学习、考试、证书、报告、设置
  domain.ts          领域类型、完整课程与题库
  store.tsx          React 状态管理与学习操作
  persistence.ts     本地数据校验、修复、加载
  assessment.ts      评分与交卷快照
  backup.ts          备份格式与 CSV 报告
  downloads.ts       文件下载与证书 SVG
  notifications.ts   根据学习记录生成提醒
e2e/                 浏览器流程测试
scripts/             提交历史校验
.github/workflows/   持续集成
```

## 数据与使用边界

- 使用本地存储键 `zhixu-learning-v1`；清除站点数据会删除记录，建议先在个人设置中导出备份。不同源、端口和浏览器各自保存数据。
- 损坏或不支持的本地记录会回退到初始数据，原始字符串尽可能保存到 `zhixu-learning-v1-recovery`。部分字段异常时仅修复异常字段。
- 学习时长由示例初始记录及首次完成章节的标称分钟数累计，**不代表后台监测的实际在线时长**。重复完成章节不会重复累计。
- 倒计时采用绝对截止时间，切换页面、刷新或关闭页面不会暂停。应用运行时到期交卷；浏览器关闭或休眠时，下一次打开应用会处理过期草稿。
- 此版本以单一浏览器标签页使用为准；本地数据可被使用者修改。正式考试需要服务器评分、身份校验和权限控制。
- 证书是演示学习证明，不是专业资格认证。数据备份不加密，请自行妥善保存。
- 页面中的讲师评分、累计学习人数为固定演示信息；个人统计来自本地记录。

## 提交规范

本项目按可审阅的功能增量形成 **30 次非空 Git 提交**，不使用空提交凑数。提交消息采用 Conventional Commits：

```text
feat: add course enrollment
fix: preserve exam deadline after navigation
test: verify certificate download
docs: document local setup and feature roadmap
```

允许类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`。可使用可选作用域，如 `feat(exam): add answer review`。每次提交应对应明确的功能、修复、测试或文档增量。

恰好 5 条有意保留的未完成功能及其验收标准见 [TODO.md](TODO.md)。

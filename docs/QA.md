# 验收记录

验收日期：2026-10-21。环境：Windows、Node.js 24.12.0、npm 11.6.2；浏览器流程使用本机 Google Chrome 无头运行。

| 检查                                         | 结果                                         |
| -------------------------------------------- | -------------------------------------------- |
| `npm test`                                   | 18 项单元测试通过                            |
| `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` | 20 项测试通过，桌面与手机各 10 项            |
| `npm run build`                              | TypeScript 严格检查和 Vite 生产构建通过      |
| `npm run format:check`                       | Prettier 格式检查通过                        |
| `npm audit`                                  | 0 项已知漏洞（含开发依赖）                   |
| `git diff --check`                           | 无空白错误                                   |
| 未完成功能数量                               | TODO.md 中恰好 5 项                          |
| `npm run verify:history`                     | 30 次非空提交，全部符合 Conventional Commits |

浏览器测试覆盖搜索与收藏、选课报名、章节完成与笔记、正确答题及证书下载、空卷和错题集、刷新恢复、超时交卷、跨页面到期交卷、备份覆盖确认和恢复、非法路由，以及所有页面的横向溢出检查。

人工复核了 1440 × 1000 桌面布局、390 × 844 手机布局、手机菜单展开和跳转、生产构建页面。预览图：

- [桌面学习概览](screenshots/overview-desktop.jpg)
- [手机学习概览](screenshots/overview-mobile.jpg)

下载测试浏览器时遇到网络中断，因此本次验收使用已安装的 Chrome；仓库同时保留标准 Playwright Chromium 安装方式与 CI 配置。

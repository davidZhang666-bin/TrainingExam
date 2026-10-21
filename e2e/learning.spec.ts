import { test, expect, type Page } from '@playwright/test';
async function startExam(page: Page) {
  await page.goto('/#exams');
  await page.locator('.exam-card').filter({hasText:'设计思维能力测评'}).getByRole('button',{name:'开始测评'}).click();
  await page.getByLabel('我已阅读须知，准备开始独立作答').check();
  await page.getByRole('button',{name:'正式开始'}).click();
  await expect(page.getByRole('heading',{name:'设计思维最核心的出发点是什么？'})).toBeVisible();
}
test('catalog filters, bookmarks and enrollment survive reload',async({page})=>{
  await page.goto('/#catalog');await page.getByRole('button',{name:'通用能力',exact:true}).click();await expect(page.locator('.course-card')).toHaveCount(2);
  await page.getByRole('textbox',{name:'搜索课程',exact:true}).fill('协作');await expect(page.locator('.course-card')).toHaveCount(1);
  await page.getByRole('button',{name:'收藏高效沟通与团队协作',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'我的收藏 1'}).click();await expect(page.locator('.course-card')).toHaveCount(1);
  await page.getByRole('button',{name:'查看高效沟通与团队协作'}).click();await page.getByRole('button',{name:'加入学习，开启成长'}).click();
  await expect(page.getByRole('heading',{name:'先对齐目标，再开始表达'})).toBeVisible();await page.reload();
  await expect(page.locator('.learning-list-card').filter({hasText:'高效沟通与团队协作'})).toBeVisible();
});
test('chapter completion records progress and notes exactly once',async({page})=>{
  await page.goto('/#learning');await page.locator('.learning-list-card').filter({hasText:'设计思维与创新实践'}).getByRole('button',{name:'继续学习'}).click();
  await expect(page.getByRole('heading',{name:'用共情发现真实需求'})).toBeVisible();await page.getByLabel('本章学习笔记').fill('先观察，再区分事实和假设。');
  await page.getByRole('button',{name:'完成本章，继续学习'}).click();await page.getByRole('button',{name:'完成本章，继续学习'}).click();await page.getByRole('button',{name:'完成课程',exact:true}).click();
  await expect(page.getByText('课程已完成！去考试中心检验所学，领取属于你的成长证书。')).toBeVisible();
  await page.reload();await page.locator('.learning-list-card').filter({hasText:'设计思维与创新实践'}).getByRole('button',{name:'回顾课程'}).click();
  await page.getByRole('navigation',{name:'章节导航'}).getByRole('button',{name:/用共情发现真实需求/}).click();await expect(page.getByLabel('本章学习笔记')).toHaveValue('先观察，再区分事实和假设。');
  const count=await page.evaluate(()=>JSON.parse(localStorage.getItem('zhixu-learning-v1')!).completed.filter((id:string)=>id==='design-2').length);expect(count).toBe(1);
});
test('correct answers produce a passing result and downloadable certificate',async({page})=>{
  await startExam(page);const answers=['理解人的真实需求','请讲讲你最近一次学习的经历。','验证关键假设','观察用户独立完成任务','按影响与频率确定优先级'];
  for(let i=0;i<answers.length;i++){await page.getByRole('radio',{name:new RegExp(answers[i].replace(/[。？]/g,'.'))}).check();if(i<answers.length-1)await page.getByRole('button',{name:'下一题'}).click();}
  await page.getByRole('button',{name:'提交试卷'}).click();await page.getByRole('button',{name:'确认交卷',exact:true}).click();
  await expect(page.locator('.score-ring strong')).toHaveText('100分');await expect(page.locator('.review-question')).toHaveCount(5);await page.getByRole('button',{name:'领取我的证书'}).click();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'下载证书'}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toContain('.svg');
  await expect(page.getByRole('heading',{name:'设计思维能力测评'})).toBeVisible();
});
test('unanswered questions are scored zero and included in mistake review',async({page})=>{
  await startExam(page);await page.getByRole('button',{name:'提交试卷'}).click();await expect(page.getByRole('heading',{name:'还有 5 道题未作答'})).toBeVisible();await page.getByRole('button',{name:'确认交卷',exact:true}).click();
  await expect(page.locator('.score-ring strong')).toHaveText('0分');await page.getByRole('button',{name:'返回考试中心',exact:true}).click();await page.getByRole('button',{name:'错题复习 5'}).click();await expect(page.locator('.wrong-question')).toHaveCount(5);
});
test('exam answers resume after reload and deadline submits only once',async({page})=>{
  await page.clock.install({time:new Date()});await startExam(page);await page.getByRole('radio',{name:/理解人的真实需求/}).check();await page.getByRole('button',{name:'下一题'}).click();await page.reload();
  await expect(page.getByRole('heading',{name:'以下哪一种访谈提问更有助于发现真实需求？'})).toBeVisible();await page.clock.fastForward(16*60*1000);
  await expect(page.locator('.score-ring strong')).toHaveText('20分');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('zhixu-learning-v1')!).attempts.length)).toBe(1);
});
test('global search focuses its input and keeps keyboard focus in dialog',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'搜索课程',exact:true}).click();const input=page.getByRole('textbox',{name:'搜索课程、考试或页面'});await expect(input).toBeFocused();await input.fill('数据');await expect(page.getByRole('dialog').getByRole('button',{name:/人人都能学的数据分析/})).toBeVisible();await input.press('Shift+Tab');
  expect(await page.evaluate(()=>document.activeElement?.closest('[role="dialog"]')!==null)).toBe(true);await input.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('all pages fit the viewport without horizontal overflow',async({page})=>{
  for(const hash of ['dashboard','catalog','learning','exams','certificates','analytics','settings']){await page.goto('/#'+hash);await expect(page.locator('main')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
});

test('backup import requires review and restores profile after reload',async({page})=>{
  await page.goto('/#settings');const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'导出备份',exact:true}).click();const file=await downloadPromise;const path=await file.path();expect(path).toBeTruthy();
  await page.getByLabel('姓名',{exact:true}).fill('测试学员');await page.getByRole('button',{name:'保存设置'}).click();await expect(page.getByText('设置已保存',{exact:true})).toBeVisible();
  await page.getByLabel('选择学习备份文件').setInputFiles(path!);await expect(page.getByRole('dialog',{name:'确认导入备份'})).toBeVisible();await expect(page.getByLabel('姓名',{exact:true})).toHaveValue('测试学员');
  await page.getByRole('button',{name:'确认恢复备份'}).click();await expect(page.getByLabel('姓名',{exact:true})).toHaveValue('林小满');await page.reload();await expect(page.getByLabel('姓名',{exact:true})).toHaveValue('林小满');
  await page.getByLabel('选择学习备份文件').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.getByRole('alert')).toContainText('请选择由知序学习导出的');await expect(page.getByLabel('姓名',{exact:true})).toHaveValue('林小满');
});

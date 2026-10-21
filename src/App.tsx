import { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, Award, ChartNoAxesCombined, Settings, CircleHelp, ArrowUpRight, Search, Bell, Menu, X, Sparkles } from 'lucide-react';
import { LearningProvider, useLearning } from './store';
import { pageNames, type Page } from './domain';
import './styles.css';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Learning from './pages/Learning';
import Exams from './pages/Exams';
import Certificates from './pages/Certificates';
import Analytics from './pages/Analytics';
import CourseDetail from './components/CourseDetail';

const navigation = [{ page: 'dashboard', icon: LayoutDashboard }, { page: 'catalog', icon: BookOpen }, { page: 'learning', icon: GraduationCap }, { page: 'exams', icon: ClipboardCheck }, { page: 'certificates', icon: Award }, { page: 'analytics', icon: ChartNoAxesCombined }] as const;
function Workspace() {
  const [page, setPage] = useState<Page>(() => { const hash = location.hash.slice(1); return hash in pageNames ? hash as Page : 'dashboard'; });
  const [mobile, setMobile] = useState(false);
  const [help, setHelp] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const { state, storageError, enroll } = useLearning();
  const navigate = (next: Page) => { setPage(next); location.hash = next; setMobile(false); window.scrollTo(0, 0); };
  const learn = (id: string) => { setActiveCourse(id); navigate('learning'); };
  useEffect(() => { const onHash = () => { const key = location.hash.slice(1); if (key in pageNames) setPage(key as Page); }; window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []);
  return <div className="app-shell">
    {mobile && <button className="nav-overlay" aria-label="关闭导航" onClick={() => setMobile(false)} />}
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <a className="brand" href="#dashboard" onClick={() => navigate('dashboard')}><span className="brand-mark"><BookOpen size={24} /></span><span>知序<span className="brand-english">ZHIXU ACADEMY</span></span></a>
      <div className="workspace-label"><span className="workspace-dot" /> 成长工作台 <span>个人空间</span></div><span className="nav-label">学习空间</span>
      <nav aria-label="主导航">{navigation.map(({ page: item, icon: Icon }) => <button key={item} className={`nav-item ${page === item ? 'active' : ''}`} aria-current={page === item ? 'page' : undefined} onClick={() => navigate(item)}><Icon size={19} strokeWidth={1.8} />{pageNames[item]}{item === 'learning' && <span className="nav-count">{state.enrolled.length}</span>}{item === 'exams' && <span className="new-dot" />}</button>)}</nav>
      <div className="sidebar-growth"><span className="growth-icon"><Sparkles size={21} /></span><h3>一点一滴，成为更好的你</h3><p>保持好奇，让学习自然发生。</p><button onClick={() => navigate('catalog')}>探索新课程 <ArrowUpRight size={15} /></button><span className="growth-orbit" /></div>
      <div className="sidebar-bottom"><button className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}><Settings size={19} />个人设置</button><button className="nav-item" onClick={() => setHelp(true)}><CircleHelp size={19} />帮助中心<ArrowUpRight size={15} className="push" /></button><div className="sidebar-profile"><span className="avatar">{state.profile.name.slice(-2)}</span><div><strong>{state.profile.name}</strong><small>{state.profile.department}</small></div><span className="online-dot" /></div></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="打开导航" onClick={() => setMobile(true)}><Menu size={21} /></button><span>学习空间</span><span className="slash">/</span><strong>{pageNames[page]}</strong></div><div className="top-actions"><span className="demo-label"><span />本地演示空间</span><button className="icon-button" aria-label="搜索课程" onClick={() => navigate('catalog')}><Search size={20} /></button><button className="icon-button notification-trigger" aria-label="查看学习提醒" onClick={() => setHelp(true)}><Bell size={20} /><i /></button><span className="header-divider" /><button className="avatar avatar-small" aria-label="个人设置" onClick={() => navigate('settings')}>{state.profile.name.slice(-2)}</button></div></header>
      <main id="main-content" className="content">{storageError && <div className="warning-banner" role="alert">浏览器存储暂不可用，当前会话仍可学习。请导出记录以免丢失。</div>}{page === 'dashboard' ? <Dashboard navigate={navigate} onLearn={learn} onOpen={setSelectedCourse} /> : page === 'analytics' ? <Analytics onLearn={learn}/> : page === 'certificates' ? <Certificates onExams={() => navigate('exams')}/> : page === 'exams' ? <Exams onCertificates={() => navigate('certificates')} onLearn={id => { enroll(id); learn(id); }}/> : page === 'learning' ? <Learning key={activeCourse ?? 'list'} courseId={activeCourse} onSelect={setActiveCourse} onCatalog={() => navigate('catalog')} onExam={() => navigate('exams')}/> : page === 'catalog' ? <Catalog onOpen={setSelectedCourse}/> : <section className="page-intro"><div><span className="eyebrow">YOUR GROWTH, IN ORDER</span><h1>{pageNames[page]}</h1><p>在这里，开启今天的成长之旅。</p></div></section>}</main>
      <footer className="footer"><span>© {new Date().getFullYear()} 知序学习</span><span>学有所获，行有所长 <span className="footer-dot">✦</span></span></footer>
    </div>
    {selectedCourse && <CourseDetail courseId={selectedCourse} onClose={() => setSelectedCourse(null)} onLearn={learn}/>}
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="modal help-modal" role="dialog" aria-modal="true" aria-label="帮助中心" onClick={e => e.stopPropagation()}><button className="icon-button modal-close" aria-label="关闭帮助" onClick={() => setHelp(false)}><X /></button><span className="eyebrow">LEARNING GUIDE</span><h2>欢迎来到知序学习</h2><p>在课程中心选择课程，加入学习后按章节完成阅读。学习记录会自动保存到当前浏览器。</p><p>考试中心提供限时测评，交卷后可查看成绩与解析。通过测评即可在「我的证书」领取学习证书。</p><div className="callout">这是本地演示系统。清除浏览器数据会删除学习记录。</div><button className="button primary" onClick={() => setHelp(false)}>开始探索</button></section></div>}
  </div>;
}
export default function App() { return <LearningProvider><Workspace /></LearningProvider>; }

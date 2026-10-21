import { Award, BookOpen, Sparkles, CheckCheck, ArrowUpRight } from 'lucide-react';
import { useLearning } from '../store';
import { getNotifications } from '../notifications';
import type { Page } from '../domain';
import Modal from './Modal';
export default function Notifications({ onClose,navigate }: { onClose: () => void; navigate: (p: Page) => void }) {
  const { state,readNotifications }=useLearning();const items=getNotifications(state);const unread=items.filter(n=>!state.readNotifications.includes(n.id)).length;
  return <Modal title="学习提醒" onClose={onClose} className="notifications-modal"><span className="eyebrow">A GENTLE NUDGE</span><h2>一些关于成长的小消息</h2><div className="notification-heading"><span>{unread?unread+' 条未读消息':'所有消息都已读'}</span><button className="text-button" disabled={!unread} onClick={()=>readNotifications(items.map(n=>n.id))}><CheckCheck size={13}/>全部标为已读</button></div><div className="notification-list">{items.map(n=>{const read=state.readNotifications.includes(n.id);const Icon=n.kind==='certificate'?Award:n.kind==='study'?BookOpen:Sparkles;return <button key={n.id} className={`notification-item ${read?'read':''}`} onClick={()=>{readNotifications([n.id]);onClose();navigate(n.page);}}><span className="notification-icon"><Icon size={19}/></span><div><h3>{n.title}{!read&&<i/>}</h3><p>{n.text}</p><small>{read?'已读':'点击查看'}<ArrowUpRight size={11}/></small></div></button>;})}</div><p className="notification-footnote">可在个人设置中调整学习提醒偏好。</p></Modal>;
}

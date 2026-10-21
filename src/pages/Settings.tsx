import { useState } from 'react';
import { Save, CheckCircle2, RotateCcw, ShieldCheck, UserRound, Target } from 'lucide-react';
import { useLearning, initialState } from '../store';
import PageIntro from '../components/PageIntro';
import Modal from '../components/Modal';
import DataBackup from '../components/DataBackup';
export default function Settings() {
  const { state, updateProfile, reset, storageError } = useLearning();
  const [form, setForm] = useState(state.profile);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [word, setWord] = useState('');
  return (
    <>
      <PageIntro
        title="以适合自己的方式成长"
        subtitle="设定一个刚刚好的目标，让学习成为舒服的日常。"
        eyebrow="MAKE THIS SPACE YOURS"
      />
      <form
        className="settings-layout"
        onChange={() => setSaved(false)}
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim() || !form.department.trim() || !form.role.trim()) return;
          updateProfile({
            ...form,
            name: form.name.trim(),
            department: form.department.trim(),
            role: form.role.trim(),
          });
          setSaved(true);
        }}
      >
        <section className="panel settings-panel">
          <div className="panel-heading">
            <h2>
              <UserRound size={18} />
              个人资料
            </h2>
            <span className="badge">本地学习者</span>
          </div>
          <div className="profile-preview">
            <span className="avatar">{form.name.slice(-2) || '知序'}</span>
            <div>
              <strong>{form.name || '你的名字'}</strong>
              <p>成长，由你定义。</p>
            </div>
          </div>
          <div className="form-grid">
            <label className="form-field">
              姓名
              <input
                required
                maxLength={20}
                pattern=".*\S.*"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="form-field">
              所属部门
              <input
                required
                maxLength={40}
                pattern=".*\S.*"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </label>
            <label className="form-field full">
              我的岗位
              <input
                required
                maxLength={40}
                pattern=".*\S.*"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </label>
          </div>
        </section>
        <section className="panel settings-panel">
          <div className="panel-heading">
            <h2>
              <Target size={18} />
              学习偏好
            </h2>
          </div>
          <label className="form-field">
            每周学习目标
            <span className="goal-input">
              <input
                type="number"
                min="30"
                max="1200"
                step="30"
                required
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: Number(e.target.value) })}
              />
              <span>分钟 / 周</span>
            </span>
          </label>
          <p className="field-help">从每周 120 分钟开始，在忙碌的日常里留一点时间给自己。</p>
          <label className="switch-field">
            <div>
              <strong>学习提醒</strong>
              <p>在通知中心展示课程和目标提醒</p>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked={form.reminder}
              onChange={(e) => setForm({ ...form, reminder: e.target.checked })}
            />
          </label>
          <div className="settings-privacy">
            <ShieldCheck size={18} />
            <p>资料与学习记录仅保存在当前浏览器，不会自动同步到其他设备。</p>
          </div>
        </section>
        <div className="settings-save">
          <span role="status">
            {saved &&
              (storageError ? (
                '资料已更新，浏览器暂未保存'
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  设置已保存
                </>
              ))}
          </span>
          <button className="button primary" type="submit">
            <Save size={14} />
            保存设置
          </button>
        </div>
      </form>
      <DataBackup
        onRestore={(data) => {
          setSaved(false);
          setForm(data.profile);
        }}
      />
      <section className="panel data-settings">
        <div>
          <h3>演示数据管理</h3>
          <p>恢复初始示例会清除当前浏览器中的笔记、进度、考试记录和个人设置。</p>
        </div>
        <button
          className="button"
          onClick={() => {
            setWord('');
            setConfirm(true);
          }}
        >
          <RotateCcw size={13} />
          恢复初始示例
        </button>
      </section>
      {confirm && (
        <Modal title="恢复初始示例" onClose={() => setConfirm(false)} className="exam-rules">
          <span className="eyebrow">A FRESH START</span>
          <h2>恢复初始示例</h2>
          <p>
            此操作会删除当前浏览器中的全部个人学习记录，包括正在进行的考试。输入「重置」以确认。
          </p>
          <label className="form-field reset-confirm">
            确认文字
            <input
              aria-label="输入重置以确认"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="dialog-actions">
            <button className="button" onClick={() => setConfirm(false)}>
              保留我的记录
            </button>
            <button
              className="button primary"
              disabled={word !== '重置'}
              onClick={() => {
                reset();
                setForm(initialState().profile);
                setSaved(false);
                setConfirm(false);
              }}
            >
              确认恢复
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

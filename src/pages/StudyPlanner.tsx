import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Download, Plus } from 'lucide-react';
import { useLearning } from '../store';
import PageIntro from '../components/PageIntro';
import { downloadFile } from '../downloads';
import { dateKey, displayDate, shiftDate, weekStart } from '../workspace/dates';
import MetricCards from '../workspace/ui/MetricCards';
import ProgressBar from '../workspace/ui/ProgressBar';
import ConfirmDialog from '../workspace/ui/ConfirmDialog';
import TaskEditor from '../features/planner/TaskEditor';
import TaskRow from '../features/planner/TaskRow';
import { calendarWeek } from '../features/planner/calendar';
import { orderTasks, taskStats } from '../features/planner/selectors';
import { tasksToCalendar } from '../features/planner/ics';
import { type StudyTask, type TaskInput } from '../features/planner/types';

const blankTask = (): TaskInput => ({
  title: '',
  date: dateKey(),
  time: '18:00',
  minutes: 25,
  kind: 'course',
  courseId: '',
  description: '',
});

export default function StudyPlanner({ onLearn }: { onLearn: (id: string) => void }) {
  const { state, addStudyTask, updateStudyTask, toggleStudyTask, removeStudyTask } = useLearning();
  const today = dateKey();
  const [anchor, setAnchor] = useState(weekStart(today));
  const [filter, setFilter] = useState<'week' | 'all' | 'open'>('week');
  const [form, setForm] = useState<TaskInput>(blankTask());
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<StudyTask | null>(null);
  const days = useMemo(
    () => calendarWeek(anchor, state.studyTasks, today),
    [anchor, state.studyTasks, today],
  );
  const stats = taskStats(state.studyTasks, today);
  const visibleTasks = orderTasks(
    state.studyTasks.filter((task) =>
      filter === 'week'
        ? task.date >= days[0].date && task.date <= days[6].date
        : filter === 'open'
          ? task.status !== 'done'
          : true,
    ),
  );
  const beginEdit = (task: StudyTask) => {
    setEditing(task.id);
    setFormOpen(true);
    setForm({
      title: task.title,
      date: task.date,
      time: task.time,
      minutes: task.minutes,
      kind: task.kind,
      courseId: task.courseId,
      description: task.description,
    });
  };
  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
  };
  const beginNew = (date = today) => {
    setEditing(null);
    setForm({ ...blankTask(), date });
    setFormOpen(true);
  };
  return (
    <>
      <PageIntro
        title="让学习有节奏，也有留白"
        subtitle="按自己的时间安排任务，完成后回看这一周的积累。"
        eyebrow="A PLAN THAT FITS YOUR DAY"
      >
        <button className="button primary" onClick={() => beginNew()}>
          <Plus size={15} /> 新建计划
        </button>
        <button
          className="button"
          disabled={!state.studyTasks.length}
          onClick={() =>
            downloadFile(
              '知序学习-计划.ics',
              tasksToCalendar(state.studyTasks),
              'text/calendar;charset=utf-8',
            )
          }
        >
          <Download size={14} /> 导出日历
        </button>
      </PageIntro>
      <MetricCards
        items={[
          { label: '今天待办', value: stats.today, detail: '按计划慢慢完成' },
          {
            label: '本周计划',
            value: `${stats.weekMinutes} 分钟`,
            detail: `${stats.weekCount} 个安排`,
          },
          { label: '本周完成', value: `${stats.completed} 项`, detail: '完成记录会保存在本机' },
          { label: '待处理逾期', value: stats.overdue, detail: '可以改期后继续学习' },
        ]}
      />
      <section className="panel ws-calendar-panel">
        <div className="ws-calendar-head">
          <div>
            <h2>
              <CalendarDays size={19} /> 一周安排
            </h2>
            <p>
              {displayDate(days[0].date)} — {displayDate(days[6].date)}
            </p>
          </div>
          <div className="ws-calendar-actions">
            <button className="button" onClick={() => setAnchor(shiftDate(anchor, -7))}>
              <ArrowLeft size={15} /> 上一周
            </button>
            <button className="button" onClick={() => setAnchor(weekStart(today))}>
              本周
            </button>
            <button className="button" onClick={() => setAnchor(shiftDate(anchor, 7))}>
              下一周 <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="ws-week-grid">
          {days.map((day) => (
            <button
              type="button"
              key={day.date}
              className={`ws-day ${day.today ? 'is-today' : ''} ${day.date === form.date && !editing ? 'is-selected' : ''}`}
              onClick={() => beginNew(day.date)}
            >
              <span>{day.label}</span>
              <strong>{day.number}</strong>
              <small>{day.tasks.length ? `${day.tasks.length} 项` : '空闲'}</small>
              <div>
                {day.tasks.slice(0, 3).map((task) => (
                  <i key={task.id} className={task.status === 'done' ? 'done' : ''} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="panel ws-task-panel">
        <div className="panel-heading">
          <h2>计划清单</h2>
          <div className="ws-tabs" role="group" aria-label="计划筛选">
            {(['week', 'open', 'all'] as const).map((value) => (
              <button
                key={value}
                className={filter === value ? 'active' : ''}
                onClick={() => setFilter(value)}
              >
                {value === 'week' ? '本周' : value === 'open' ? '待完成' : '全部'}
              </button>
            ))}
          </div>
        </div>
        {!visibleTasks.length ? (
          <div className="ws-inline-empty">这一组还没有计划，给今天安排一个轻松的开始吧。</div>
        ) : (
          <div className="ws-task-list">
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleStudyTask(task.id)}
                onEdit={() => beginEdit(task)}
                onDelete={() => setDeleting(task)}
                onLearn={onLearn}
              />
            ))}
          </div>
        )}
      </section>
      <section className="panel ws-plan-progress">
        <ProgressBar
          value={
            state.profile.goal ? Math.min(100, (stats.weekMinutes / state.profile.goal) * 100) : 0
          }
          label={`每周学习目标 · ${stats.weekMinutes} / ${state.profile.goal} 分钟`}
        />
        <small>计划时长用于个人安排，不代表实际在线学习时长。</small>
      </section>
      {formOpen && (
        <TaskEditor
          initial={form}
          editingId={editing ?? undefined}
          tasks={state.studyTasks}
          onSave={(input) =>
            (editing ? updateStudyTask(editing, input) : addStudyTask(input)).errors
          }
          onClose={closeForm}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="删除这项学习计划？"
          description={`「${deleting.title}」将从当前计划清单中移除。`}
          confirm="删除计划"
          onClose={() => setDeleting(null)}
          onConfirm={() => removeStudyTask(deleting.id)}
        />
      )}
    </>
  );
}

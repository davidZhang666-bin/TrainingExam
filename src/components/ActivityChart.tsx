import { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { useLearning, localDate } from '../store';
export function activityDays(
  activity: { date: string; minutes: number }[],
  count: number,
  now = new Date(),
) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - count + 1 + i);
    const key = localDate(date);
    return {
      date: key,
      label: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
      minutes: activity.filter((a) => a.date === key).reduce((s, a) => s + a.minutes, 0),
    };
  });
}
export default function ActivityChart() {
  const { state } = useLearning();
  const [period, setPeriod] = useState(7);
  const days = activityDays(state.activity, period);
  const total = days.reduce((s, d) => s + d.minutes, 0);
  const max = Math.max(60, ...days.map((d) => d.minutes));
  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <h2>
          学习足迹 <span className="section-kicker">LEARNING ACTIVITY</span>
        </h2>
        <label className="period-select">
          <select
            aria-label="学习足迹时间范围"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value="7">近 7 天</option>
            <option value="14">近 14 天</option>
          </select>
          <ChevronDown size={12} />
        </label>
      </div>
      <div className="activity-summary">
        <strong>
          {(total / 60).toFixed(1)} <small>小时</small>
        </strong>
        <span>
          <TrendingUp size={12} /> 每一点积累，都在靠近目标
        </span>
        <span className="chart-legend">
          <i />
          学习时长
        </span>
      </div>
      <div
        className="bar-chart"
        role="img"
        aria-label={`近${period}天学习${total}分钟。${days.map((d) => `${d.date} ${d.minutes}分钟`).join('；')}`}
      >
        <div className="chart-scale">
          {[max, max * 0.5, 0].map((n) => (
            <span key={n}>
              {Math.round(n)}
              <small>分</small>
            </span>
          ))}
        </div>
        <div className="chart-grid">
          <span />
          <span />
          <span />
        </div>
        <div className="chart-bars">
          {days.map((day, i) => (
            <div className={`chart-column ${i === days.length - 1 ? 'today' : ''}`} key={day.date}>
              <div className="bar-space">
                <span
                  className="chart-bar"
                  style={{ height: `${(day.minutes / max) * 100}%` }}
                  title={`${day.date} · ${day.minutes} 分钟`}
                />
                <span className="bar-value">{day.minutes}m</span>
              </div>
              <span className="chart-day">{period === 7 ? day.label : day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

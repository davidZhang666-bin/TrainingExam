export default function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div className="ws-progress-group">
      <div>
        <span>{label}</span>
        <strong>{Math.round(percent)}%</strong>
      </div>
      <div
        className="ws-progress"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

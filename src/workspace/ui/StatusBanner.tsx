import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';

export default function StatusBanner({
  message,
  tone = 'info',
  onDismiss,
}: {
  message: string;
  tone?: 'info' | 'success' | 'error';
  onDismiss?: () => void;
}) {
  if (!message) return null;
  const Icon = tone === 'error' ? TriangleAlert : tone === 'success' ? CheckCircle2 : Info;
  return (
    <div className={`ws-banner ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <span>{message}</span>
      {onDismiss && (
        <button aria-label="关闭提示" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}

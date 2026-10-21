import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; ref.current?.focus(); const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', handler); return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handler); previous?.focus(); }; }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}><button className="icon-button modal-close" aria-label={`关闭${title}`} onClick={onClose}><X size={20}/></button>{children}</section></div>;
}

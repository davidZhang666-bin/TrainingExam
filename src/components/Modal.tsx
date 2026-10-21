import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
export default function Modal({
  title,
  onClose,
  children,
  className = '',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const background = [...document.querySelectorAll<HTMLElement>('.sidebar,.main-shell')];
    const previousInert = background.map((el) => el.inert);
    background.forEach((el) => {
      el.inert = true;
    });
    const panel = ref.current!;
    (panel.querySelector<HTMLElement>('[data-autofocus]') ?? panel).focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key !== 'Tab') return;
      const focusable = [
        ...panel.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),textarea,select,[tabindex="0"]',
        ),
      ].filter((el) => el.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) {
        e.preventDefault();
        panel.focus();
        return;
      }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last?.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last || document.activeElement === panel)
      ) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = overflow;
      background.forEach((el, i) => {
        el.inert = previousInert[i];
      });
      document.removeEventListener('keydown', handler);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeRef.current();
      }}
    >
      <section
        className={'modal ' + className}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <button className="icon-button modal-close" aria-label={'关闭' + title} onClick={onClose}>
          <X size={20} />
        </button>
        {children}
      </section>
    </div>,
    document.body,
  );
}

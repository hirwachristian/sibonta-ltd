import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import logo from '../../assets/images/sibontaltd-logo-noring.png';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Sticky action bar at the bottom of the window. */
  footer?: ReactNode;
  maxWidth?: string;
  /** Show the company logo in the header (default true). */
  showLogo?: boolean;
}

/** Full-window popup used for site-wide panels (FAQ, etc.). */
export function Dialog({
  open,
  onClose,
  title,
  subtitle = 'SIBONTA Finance Ltd · Finance Today • Better Tomorrow',
  children,
  footer,
  maxWidth = 'max-w-4xl',
  showLogo = true,
}: DialogProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLParagraphElement>(null);

  // Lock page scroll, close on Escape, move focus into the window.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => titleRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#082E43]/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div
            className="min-h-full flex items-start justify-center sm:p-6 lg:p-10"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`relative w-full ${maxWidth} bg-[#FFFDF7] sm:rounded-2xl shadow-2xl`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="sticky top-0 z-10 bg-[#FFFDF7]/95 backdrop-blur-sm border-b border-slate-200 sm:rounded-t-2xl">
                <div className="flex items-center gap-4 px-5 sm:px-8 py-4">
                  {showLogo && <img src={logo} alt="" className="w-11 h-11 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p
                      id={titleId}
                      ref={titleRef}
                      tabIndex={-1}
                      className="font-display text-lg sm:text-xl font-semibold text-[#082E43] leading-tight outline-none"
                    >
                      {title}
                    </p>
                    {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={`Close ${title}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#082E43]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {children}

              {footer && (
                <div className="sticky bottom-0 bg-[#FFFDF7]/95 backdrop-blur-sm border-t border-slate-200 px-5 sm:px-8 py-4 sm:rounded-b-2xl">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

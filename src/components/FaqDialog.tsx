import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { FAQ_ITEMS, type FaqCategory } from '../data/sibontaData';
import { Dialog } from './ui/Dialog';

interface FaqDialogProps {
  open: boolean;
  onClose: () => void;
}

const GROUPS: { id: FaqCategory; label: string }[] = [
  { id: 'eligibility', label: 'Loan Eligibility' },
  { id: 'counselling', label: 'Debt Counselling' },
  { id: 'accounting', label: 'Accounting & Audit' },
];

export function FaqDialog({ open, onClose }: FaqDialogProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Frequently Asked Questions"
      subtitle="Clear answers about our loans, counselling, and accounting services"
      showLogo={false}
      maxWidth="max-w-3xl"
    >
      <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-8">
        {GROUPS.map((group) => {
          const items = FAQ_ITEMS.filter((item) => item.category === group.id);
          if (!items.length) return null;

          return (
            <section key={group.id} aria-labelledby={`faq-group-${group.id}`}>
              <h2
                id={`faq-group-${group.id}`}
                className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#C27803]"
              >
                {group.label}
              </h2>

              <ul className="rounded-xl border border-slate-200 bg-[#FFFDF7] divide-y divide-slate-200 overflow-hidden">
                {items.map((item) => {
                  const isOpen = openId === item.id;
                  const panelId = `faq-panel-${item.id}`;
                  const buttonId = `faq-button-${item.id}`;

                  return (
                    <li
                      key={item.id}
                      className={`relative transition-colors duration-200 ${isOpen ? 'bg-[#F4F8FB]' : ''}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 w-[3px] bg-[#082E43] transition-opacity duration-200 ${
                          isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <h3>
                        <button
                          id={buttonId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          className="w-full flex items-center justify-between gap-5 px-5 py-4 sm:py-5 text-left cursor-pointer group hover:bg-[#F4F8FB] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#082E43]"
                        >
                          <span
                            className={`text-[15px] sm:text-base font-semibold leading-snug transition-colors ${
                              isOpen ? 'text-[#082E43]' : 'text-slate-900 group-hover:text-[#082E43]'
                            }`}
                          >
                            {item.question}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`flex items-center justify-center w-7 h-7 rounded-full border shrink-0 transition-all duration-200 ${
                              isOpen
                                ? 'rotate-45 bg-[#082E43] border-[#082E43] text-white'
                                : 'border-slate-300 text-slate-500 group-hover:border-[#082E43] group-hover:text-[#082E43]'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </span>
                        </button>
                      </h3>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 pr-14 text-[15px] text-slate-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Dialog>
  );
}

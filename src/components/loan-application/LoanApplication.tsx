import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import { LOGO_SRC as logo } from '../../config/images';
import { FieldInput } from './FieldInput';
import {
  INITIAL_DATA,
  toSubmission,
  validateStep,
  visibleFields,
  visibleSteps,
  type ApplicationData,
  type Value,
} from './schema';
import { COMPANY_EMAIL, COMPANY_PHONE, submitLoanApplication } from './submit';

/** Progress is kept only for this browser tab (cleared when the tab closes or on submit). */
const DRAFT_KEY = 'sibonta-loan-application-draft';

function loadDraft(): ApplicationData {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) return { ...INITIAL_DATA, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable */
  }
  return { ...INITIAL_DATA };
}

function saveDraft(d: ApplicationData) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable */
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
}

type Status = 'editing' | 'submitting' | 'success' | 'error';

interface LoanApplicationProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selects a loan product when opened from a specific product. */
  initialProduct?: string;
}

export function LoanApplication({ open, onClose, initialProduct }: LoanApplicationProps) {
  const [data, setData] = useState<ApplicationData>(loadDraft);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('editing');
  const [reference, setReference] = useState('');
  const [submitError, setSubmitError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const steps = useMemo(() => visibleSteps(data), [data]);
  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const fields = visibleFields(step, data);

  // Pre-select the product chosen elsewhere on the site.
  useEffect(() => {
    if (open && initialProduct) {
      setData((d) => (d.product ? d : { ...d, product: initialProduct }));
    }
  }, [open, initialProduct]);

  useEffect(() => {
    if (status === 'editing') saveDraft(data);
  }, [data, status]);

  // Lock page scroll, close on Escape, focus the heading.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => headingRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const goToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  const handleChange = useCallback((name: string, value: Value) => {
    setData((d) => ({ ...d, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const { [name]: _removed, ...rest } = e;
      return rest;
    });
  }, []);

  const focusFirstError = (errs: Record<string, string>) => {
    const first = fields.find((f) => errs[f.name]);
    if (!first) return;
    const el =
      document.getElementById(`la-${first.name}`) ??
      document.querySelector<HTMLInputElement>(`[name="la-${first.name}"]`);
    el?.focus();
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const handleNext = async () => {
    const errs = validateStep(step, data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    if (!isLast) {
      setStepIndex(index + 1);
      goToTop();
      return;
    }

    const ref = `SIB-LA-${Date.now().toString().slice(-6)}`;
    setStatus('submitting');
    setSubmitError('');
    try {
      await submitLoanApplication(
        ref,
        toSubmission(data),
        (data.fullName as string) || 'Applicant',
        (data.email as string) || undefined,
      );
      setReference(ref);
      setStatus('success');
      clearDraft();
      goToTop();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  const handleBack = () => {
    setErrors({});
    setStepIndex(Math.max(0, index - 1));
    goToTop();
  };

  const handleClose = () => {
    if (status === 'success') {
      setData({ ...INITIAL_DATA });
      setStepIndex(0);
      setStatus('editing');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={scrollRef}
          className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#082E43]/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="min-h-full flex items-start justify-center sm:p-6 lg:p-10">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="loan-app-title"
              className="relative w-full min-w-0 overflow-x-clip max-w-4xl bg-[#FFFDF7] sm:rounded-2xl shadow-2xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <header className="sticky top-0 z-10 bg-[#FFFDF7]/95 backdrop-blur-sm border-b border-slate-200 sm:rounded-t-2xl">
                <div className="flex items-center gap-4 px-5 sm:px-8 py-4">
                  <img src={logo} alt="" className="w-9 h-9 sm:w-11 sm:h-11 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p id="loan-app-title" className="font-display text-base sm:text-xl font-semibold text-[#082E43] leading-tight">
                      Loan Application Form
                    </p>
                    <p className="hidden sm:block text-xs text-slate-500">SIBONTA Finance Ltd · Finance Today • Better Tomorrow</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close loan application"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#082E43]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {status !== 'success' && (
                  <div className="px-5 sm:px-8 pb-4">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                      <span>
                        Step {index + 1} of {steps.length}
                      </span>
                      <span className="hidden sm:inline">Your progress is saved in this browser tab</span>
                    </div>
                    <div className="flex gap-1.5" aria-hidden="true">
                      {steps.map((s, i) => (
                        <span
                          key={s.id}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            i <= index ? 'bg-[#073035]' : 'bg-[#C9DFEA]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </header>

              {status === 'success' ? (
                <SuccessScreen reference={reference} headingRef={headingRef} onClose={handleClose} />
              ) : (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 sm:px-8 py-8"
                    >
                      <p className="font-mono text-xs font-semibold text-[#C27803] tabular-nums">
                        Section {step.number}
                      </p>
                      <h2
                        ref={headingRef}
                        tabIndex={-1}
                        className="mt-1 font-display text-2xl font-semibold text-slate-900 tracking-tight outline-none"
                      >
                        {step.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-slate-600">{step.description}</p>

                      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                        {fields.map((f) => (
                          <FieldInput
                            key={f.name}
                            field={f}
                            data={data}
                            error={errors[f.name]}
                            onChange={handleChange}
                          />
                        ))}
                      </div>

                      {Object.keys(errors).length > 0 && (
                        <p role="alert" className="mt-6 flex items-center gap-2 text-sm font-medium text-red-600">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          Please complete the highlighted fields to continue.
                        </p>
                      )}

                      {status === 'error' && (
                        <div role="alert" className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-800">
                          <p className="font-semibold">We couldn’t send your application.</p>
                          <p className="mt-1">
                            Please check your internet connection and try again. If the problem continues, call{' '}
                            <a className="underline font-semibold" href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`}>
                              {COMPANY_PHONE}
                            </a>{' '}
                            or email{' '}
                            <a className="underline font-semibold" href={`mailto:${COMPANY_EMAIL}`}>
                              {COMPANY_EMAIL}
                            </a>
                            .
                          </p>
                          {submitError && <p className="mt-1 text-xs text-red-700/80">Details: {submitError}</p>}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Footer actions */}
                  <div className="sticky bottom-0 bg-[#FFFDF7]/95 backdrop-blur-sm border-t border-slate-200 px-5 sm:px-8 py-4 flex items-center justify-between gap-3 sm:rounded-b-2xl">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={index === 0 || status === 'submitting'}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#082E43] border border-slate-300 hover:border-[#082E43] rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C27803]"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          Sending…
                        </>
                      ) : isLast ? (
                        <>
                          Submit Application
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessScreen({
  reference,
  headingRef,
  onClose,
}: {
  reference: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onClose: () => void;
}) {
  return (
    <div className="px-5 sm:px-8 py-14 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="mx-auto w-16 h-16 rounded-full bg-[#073035]/10 flex items-center justify-center"
      >
        <CheckCircle2 className="w-9 h-9 text-[#073035]" aria-hidden="true" />
      </motion.div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 font-display text-3xl font-semibold text-slate-900 tracking-tight outline-none"
      >
        Application submitted
      </h2>
      <p className="mt-3 text-base text-slate-600 max-w-lg mx-auto">
        Thank you. Your loan application has been sent to SIBONTA Finance Ltd. A loan officer will
        contact you to discuss next steps and collect your supporting documents.
      </p>
      <p className="mt-6 inline-flex flex-col items-center px-6 py-4 rounded-xl bg-[#F4F8FB] border border-slate-200">
        <span className="text-xs font-medium text-slate-500">Your application reference</span>
        <span className="mt-1 font-mono text-xl font-semibold text-[#082E43] tabular-nums">{reference}</span>
      </p>
      <p className="mt-6 text-sm text-slate-500">
        Questions? Call{' '}
        <a className="font-semibold text-[#082E43] underline" href={`tel:${COMPANY_PHONE.replace(/\s/g, '')}`}>
          {COMPANY_PHONE}
        </a>{' '}
        or email{' '}
        <a className="font-semibold text-[#082E43] underline" href={`mailto:${COMPANY_EMAIL}`}>
          {COMPANY_EMAIL}
        </a>
        .
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors cursor-pointer"
      >
        Back to website
      </button>
    </div>
  );
}

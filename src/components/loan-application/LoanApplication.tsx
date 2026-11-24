import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText, Loader2, X } from 'lucide-react';
import { LOGO_SRC as logo } from '../../config/images';
import { FieldInput } from './FieldInput';
import {
  FIELD_RESETS,
  INITIAL_DATA,
  QUICK_LOAN_LIMIT,
  formTypeFor,
  formatRwf,
  toSubmission,
  validateStep,
  visibleFields,
  visibleSteps,
  type ApplicationData,
  type Field,
  type FormType,
  type Value,
} from './schema';
import { COMPANY_EMAIL, COMPANY_PHONE, submitLoanApplication } from './submit';
import { loadRwandaLocations } from '../../lib/rwandaLocations';

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

/** Today's date as YYYY-MM-DD in the visitor's own time zone. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const AMOUNT_FIELD: Field = {
  name: 'amount',
  label: 'Loan amount you want to request (RWF)',
  type: 'money',
  required: true,
  full: true,
  placeholder: '',
};

const FORM_COPY: Record<'start' | FormType, { title: string; subtitle: string }> = {
  start: { title: 'Apply for a Loan', subtitle: 'SIBONTA Finance Ltd · Finance Today • Better Tomorrow' },
  quick: { title: 'Quick Loan Application Form', subtitle: 'SIBONTA Finance Ltd · Simple, quick and takes about 5 to 7 minutes' },
  full: { title: 'Loan Application Form', subtitle: 'SIBONTA Finance Ltd · Finance Today • Better Tomorrow' },
};

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
  /** Hidden spam-bot trap; real applicants never see or fill it. */
  const honeypotRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  /** Before a form is chosen, the applicant first enters the amount they need. */
  const formType = (data.formType as FormType | '') || undefined;
  const onStart = !formType;
  const copy = FORM_COPY[formType ?? 'start'];
  const amountDigits = (data.amount as string) ?? '';
  const suggestedForm: FormType | undefined = Number(amountDigits) > 0 ? formTypeFor(amountDigits) : undefined;

  // The quick form's address dropdowns need Rwanda's location list; fetch it when that form opens.
  const [, setLocationsLoaded] = useState(0);
  useEffect(() => {
    if (open && formType === 'quick') loadRwandaLocations().then(() => setLocationsLoaded((n) => n + 1));
  }, [open, formType]);

  const steps = useMemo(() => visibleSteps(data), [data]);
  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const fields = onStart ? [AMOUNT_FIELD] : visibleFields(step, data);

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
    setData((d) => {
      const next = { ...d, [name]: value };
      // e.g. choosing another district clears the sector, cell and village below it
      if (d[name] !== value) for (const dependant of FIELD_RESETS[name] ?? []) next[dependant] = '';
      return next;
    });
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

  const handleStart = () => {
    if (!(Number(amountDigits) > 0)) {
      const errs = { amount: 'Please enter the amount you would like to request.' };
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    const chosen = formTypeFor(amountDigits);
    const date = today();
    setErrors({});
    setData((d) => ({
      ...d,
      formType: chosen,
      // The quick form's dates start as today; the applicant can still change them.
      ...(chosen === 'quick' && {
        applicationDate: (d.applicationDate as string) || date,
        qDeclarationDate: (d.qDeclarationDate as string) || date,
      }),
    }));
    setStepIndex(0);
    setStatus('editing');
    goToTop();
  };

  const handleNext = async () => {
    if (onStart) {
      handleStart();
      return;
    }
    const errs = validateStep(step, data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    if (!isLast) {
      // Pre-fill the declaration name with the name from Section 1.
      if (formType === 'quick' && steps[index + 1]?.id === 'q-declaration' && !data.qApplicantName) {
        setData((d) => ({ ...d, qApplicantName: d.fullName }));
      }
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
        honeypotRef.current?.value ?? '',
        formType ?? 'full',
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
    setStatus('editing');
    if (index === 0) {
      // Back to the amount screen (answers are kept).
      setData((d) => ({ ...d, formType: '' }));
    } else {
      setStepIndex(index - 1);
    }
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
                      {copy.title}
                    </p>
                    <p className="hidden sm:block text-xs text-slate-500">{copy.subtitle}</p>
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

                {status !== 'success' && !onStart && (
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
                  <input
                    ref={honeypotRef}
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] w-px h-px opacity-0"
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    {onStart ? (
                      <motion.div
                        key="start"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 sm:px-8 py-8"
                      >
                        <p className="font-mono text-xs font-semibold text-[#C27803]">Getting started</p>
                        <h2
                          ref={headingRef}
                          tabIndex={-1}
                          className="mt-1 font-display text-2xl font-semibold text-slate-900 tracking-tight outline-none"
                        >
                          How much would you like to borrow?
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-600">
                          Enter the amount first. We will open the application form that fits your request.
                        </p>

                        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FieldInput field={AMOUNT_FIELD} data={data} error={errors.amount} onChange={handleChange} />
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormOption
                            active={suggestedForm === 'quick'}
                            icon={<Clock className="w-5 h-5" aria-hidden="true" />}
                            title="Quick Loan Application"
                            range={`Up to ${formatRwf(String(QUICK_LOAN_LIMIT))}`}
                            text="5 short sections. Takes about 5 to 7 minutes."
                          />
                          <FormOption
                            active={suggestedForm === 'full'}
                            icon={<FileText className="w-5 h-5" aria-hidden="true" />}
                            title="Full Loan Application"
                            range={`Above ${formatRwf(String(QUICK_LOAN_LIMIT))}`}
                            text="Detailed form with income, business, guarantor and collateral details."
                          />
                        </div>
                      </motion.div>
                    ) : (
                    <motion.div
                      key={`${formType}-${step.id}`}
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
                    )}
                  </AnimatePresence>

                  {/* Footer actions */}
                  <div className="sticky bottom-0 bg-[#FFFDF7]/95 backdrop-blur-sm border-t border-slate-200 px-5 sm:px-8 py-4 flex items-center justify-between gap-3 sm:rounded-b-2xl">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={onStart || status === 'submitting'}
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
                      ) : onStart ? (
                        <>
                          {suggestedForm === 'quick' ? 'Start Quick Application' : suggestedForm === 'full' ? 'Start Full Application' : 'Continue'}
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
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

function FormOption({
  active,
  icon,
  title,
  range,
  text,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  range: string;
  text: string;
}) {
  return (
    <div
      aria-current={active ? 'true' : undefined}
      className={`flex gap-3 p-4 rounded-xl border transition-colors duration-200 ${
        active ? 'border-[#073035] bg-[#073035]/[0.06] ring-1 ring-[#073035]' : 'border-slate-200 bg-[#F4F8FB]'
      }`}
    >
      <span
        className={`mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
          active ? 'bg-[#073035] text-white' : 'bg-[#E3EEF4] text-[#082E43]'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs font-semibold text-[#7A4E00] tabular-nums">{range}</p>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{text}</p>
      </div>
    </div>
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

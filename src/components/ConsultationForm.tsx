import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { CheckCircle2, AlertCircle, Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY_CONTACT, FINANCIAL_SERVICES } from '../data/sibontaData';
import { validatePhone } from '../lib/validators';

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

interface ContactMethod {
  label: string;
  value: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  tile: string;
  external?: boolean;
}

const CONTACT_METHODS: ContactMethod[] = [
  {
    label: 'Visit our office',
    value: 'Diamond House, Gatenga, Kicukiro, Kigali',
    href: COMPANY_CONTACT.mapsUrl,
    Icon: MapPin,
    tile: 'bg-[#FDF3DC] text-[#7A4E00]',
    external: true,
  },
  {
    label: 'Call us',
    value: COMPANY_CONTACT.phone,
    href: `tel:${COMPANY_CONTACT.phone.replace(/\s/g, '')}`,
    Icon: Phone,
    tile: 'bg-[#C9DFEA]/70 text-[#082E43]',
  },
  {
    label: 'Email us',
    value: COMPANY_CONTACT.email,
    href: `mailto:${COMPANY_CONTACT.email}`,
    Icon: Mail,
    tile: 'bg-[#C9DFEA]/70 text-[#082E43]',
  },
  {
    label: 'Chat on WhatsApp',
    value: COMPANY_CONTACT.phone,
    href: `https://wa.me/${COMPANY_CONTACT.whatsapp}?text=${encodeURIComponent(
      'Hello SIBONTA Finance Ltd, I would like to ask about your services.',
    )}`,
    Icon: WhatsAppIcon,
    tile: 'bg-[#25D366]/15 text-[#128C4B]',
    external: true,
  },
];

interface ConsultationFormProps {
  preselectedService: string;
  preselectedCustomerGroup: string;
  preselectedNotes: string;
}

const CUSTOMER_PROFILES = [
  'SMEs',
  'Individual Entrepreneurs',
  'Women',
  'Young People',
  'Salaried Employee',
];

export function ConsultationForm({
  preselectedService,
  preselectedCustomerGroup,
  preselectedNotes,
}: ConsultationFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerGroup, setCustomerGroup] = useState(
    preselectedCustomerGroup || 'SMEs',
  );
  const [selectedService, setSelectedService] = useState(
    preselectedService || FINANCIAL_SERVICES[0].title,
  );
  const [notes, setNotes] = useState(preselectedNotes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  /** Hidden spam-bot trap; real visitors never see or fill it. */
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preselectedService) setSelectedService(preselectedService);
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedCustomerGroup) setCustomerGroup(preselectedCustomerGroup);
  }, [preselectedCustomerGroup]);

  useEffect(() => {
    if (preselectedNotes) setNotes(preselectedNotes);
  }, [preselectedNotes]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name or business contact name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    const phoneError = phone.trim() ? validatePhone(phone) : 'Please enter your phone number.';
    if (phoneError) {
      nextErrors.phone = phoneError;
    }
    if (!selectedService) {
      nextErrors.selectedService = 'Please select a product or service.';
    }
    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSendError('');
    setSending(true);
    const referenceCode = `SIB-${Date.now().toString().slice(-6)}`;
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          reference: referenceCode,
          fullName,
          email,
          phone,
          customerGroup,
          service: selectedService,
          notes,
          website: honeypotRef.current?.value ?? '',
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || `Request failed (${res.status})`);
      setSubmittedRef(referenceCode);
    } catch {
      setSendError(
        `We couldn't send your enquiry. Please check your connection and try again, or call ${COMPANY_CONTACT.phone}.`,
      );
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setErrors({});
  };

  return (
    <section id="consultation" className="py-20 sm:py-24 bg-[#F4F8FB] border-t border-slate-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Commitment & Mission Summary */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-sm font-medium text-[#C27803] tracking-wide">
              Request a Consultation
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight text-balance">
              Talk to an advisor before you decide
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Not sure which product fits, or want to talk through your numbers first? Send us a few
              details and an advisor will get back to you.
            </p>

            {/* Reach us directly */}
            <div>
              <p className="text-xs font-semibold text-slate-500">Prefer to reach us directly?</p>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONTACT_METHODS.map(({ label, value, href, Icon, tile, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex items-center gap-3 h-full p-3.5 rounded-xl bg-[#FFFDF7] border border-slate-200 hover:border-[#082E43]/40 hover:shadow-md hover:shadow-[#082E43]/5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082E43]"
                    >
                      <span className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${tile}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900 group-hover:text-[#082E43]">
                          {label}
                        </span>
                        <span className="block text-xs text-slate-500 break-words">{value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">What Happens Next</p>
                <ol className="mt-3 space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs font-semibold text-[#082E43] mt-0.5 tabular-nums">
                      01.
                    </span>
                    <span>
                      We review your inquiry alongside your customer profile and requested solution.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs font-semibold text-[#082E43] mt-0.5 tabular-nums">
                      02.
                    </span>
                    <span>
                      An advisor schedules a tailored discussion covering documentation,
                      affordability, or advisory scope.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs font-semibold text-[#082E43] mt-0.5 tabular-nums">
                      03.
                    </span>
                    <span>
                      You receive a clear, practical roadmap built for sustainable financial growth.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="lg:col-span-7 bg-[#FFFDF7] border border-slate-200 rounded-2xl p-5 sm:p-8 lg:p-10">
            {submittedRef ? (
              <div className="py-6 space-y-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-6 h-6 text-[#073035] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-slate-900">
                      Consultation request recorded
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Thank you, <span className="font-semibold text-slate-900">{fullName}</span>.
                      Your inquiry regarding{' '}
                      <span className="font-semibold text-slate-900">{selectedService}</span> has
                      been prepared with reference{' '}
                      <span className="font-mono font-semibold text-[#082E43]">{submittedRef}</span>.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[#F4F8FB] border border-slate-200 rounded-xl space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Customer Profile</span>
                    <span className="font-medium text-slate-900">{customerGroup}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Service Requested</span>
                    <span className="font-medium text-slate-900 text-right">{selectedService}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Contact Details</span>
                    <span className="font-medium text-slate-900 text-right">
                      {email} · {phone}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  All credit products remain subject to affordability assessment and applicable
                  lending requirements. Independent audit services are offered where appropriately
                  authorized.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 text-sm font-medium text-[#082E43] bg-[#FFFDF7] border border-slate-300 hover:border-[#082E43] rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="relative space-y-5">
                <input
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] w-px h-px opacity-0"
                />
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Request a Financial Consultation
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Share your details and preferred product or advisory service below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="full-name"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Full Name / Business Name
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Grace N. / Horizon Craft Ltd"
                      className="w-full min-w-0 px-3.5 py-2.5 text-base sm:text-sm bg-[#FFFDF7] border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#082E43] focus:ring-1 focus:ring-[#082E43]"
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="customer-profile"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Customer Profile
                    </label>
                    <select
                      id="customer-profile"
                      value={customerGroup}
                      onChange={(e) => setCustomerGroup(e.target.value)}
                      className="w-full min-w-0 px-3.5 py-2.5 text-base sm:text-sm bg-[#FFFDF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#082E43] focus:ring-1 focus:ring-[#082E43]"
                    >
                      {CUSTOMER_PROFILES.map((profile) => (
                        <option key={profile} value={profile}>
                          {profile}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email-address"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="email-address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-w-0 px-3.5 py-2.5 text-base sm:text-sm bg-[#FFFDF7] border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#082E43] focus:ring-1 focus:ring-[#082E43]"
                    />
                    {errors.email && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone-number"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone-number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="078 123 4567"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      className="w-full min-w-0 px-3.5 py-2.5 text-base sm:text-sm bg-[#FFFDF7] border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#082E43] focus:ring-1 focus:ring-[#082E43]"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="service-interest"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Product or Service of Interest
                  </label>
                  <select
                    id="service-interest"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full min-w-0 px-3.5 py-2.5 text-base sm:text-sm bg-[#FFFDF7] border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#082E43] focus:ring-1 focus:ring-[#082E43]"
                  >
                    <optgroup label="Credit and Loan Products">
                      {FINANCIAL_SERVICES.filter((s) => s.category === 'credit').map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Financial Advisory and Business Support Services">
                      {FINANCIAL_SERVICES.filter((s) => s.category === 'advisory').map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-notes"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Goals or Financing Summary (Optional)
                  </label>
                  <textarea
                    id="inquiry-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe your business need, financing goal, or advisory support request..."
                    className="w-full min-w-0 px-3.5 py-2.5 text-base sm:text-sm bg-[#FFFDF7] border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#082E43] focus:ring-1 focus:ring-[#082E43]"
                  />
                </div>

                {sendError && (
                  <p role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{sendError}</span>
                  </p>
                )}

                <div className="pt-2 flex sm:justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto disabled:opacity-70 disabled:cursor-wait px-6 py-3 text-sm font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C27803]"
                  >
                    {sending ? 'Sending…' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { FINANCIAL_SERVICES, type FinancialServiceItem, type ServiceCategory } from '../data/sibontaData';
import { cardHover, fadeUp, Reveal, RevealGroup } from './motion/Reveal';
import { SHOW_LOAN_PLANNER } from '../config/features';

interface GroupConfig {
  category: ServiceCategory;
  anchor: string;
  title: string;
  intro: string;
  /** Thin accent line on each card, so the two groups are easy to tell apart. */
  accent: string;
  gridCols: string;
}

const GROUPS: GroupConfig[] = [
  {
    category: 'credit',
    anchor: 'services-credit',
    title: 'Credit & Loan Products',
    intro:
      'Responsible financing for working capital, recovery, new ventures, and salary advances, always assessed against what you can comfortably repay.',
    accent: 'bg-[#C27803]',
    gridCols: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  {
    category: 'advisory',
    anchor: 'services-advisory',
    title: 'Advisory & Business Support',
    intro:
      'Practical guidance, accounting, payroll, and debt counselling that keep your finances organised and your business ready to grow.',
    accent: 'bg-[#073035]',
    gridCols: 'sm:grid-cols-2 lg:grid-cols-3',
  },
];

export function ServicesCatalog() {
  return (
    <section id="services" className="py-20 sm:py-24 bg-[#FFFDF7] border-y border-slate-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section header + quick jump to each group */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-medium text-[#C27803] tracking-wide mb-2">
              Products & Services
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight text-balance">
              Practical credit, financial advisory, and accounting under one roof
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Every solution is built to strengthen cash flow, promote responsible borrowing, and
              give individuals and growing enterprises reliable financial clarity.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            {GROUPS.map(({ anchor, title, category }) => (
              <a
                key={anchor}
                href={`#${anchor}`}
                className="group p-4 rounded-xl border border-slate-200 bg-[#F4F8FB] hover:border-[#082E43]/40 transition-colors lg:min-w-[13rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082E43]"
              >
                <span className="block font-mono text-2xl font-semibold text-[#082E43] tabular-nums leading-none">
                  {FINANCIAL_SERVICES.filter((s) => s.category === category).length}
                </span>
                <span className="block mt-1.5 text-xs font-medium text-slate-600 group-hover:text-[#082E43] transition-colors">
                  {title}
                </span>
              </a>
            ))}
          </Reveal>
        </div>

        {/* Service groups */}
        <div className="mt-14 space-y-14">
          {GROUPS.map((group) => (
            <ServiceGroup
              key={group.category}
              group={group}
              services={FINANCIAL_SERVICES.filter((s) => s.category === group.category)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceGroup({
  group,
  services,
}: {
  group: GroupConfig;
  services: FinancialServiceItem[];
}) {
  const { anchor, title, intro, accent, gridCols, category } = group;

  return (
    <div id={anchor} aria-labelledby={`${anchor}-title`} role="region">
      {/* Group heading */}
      <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
        <div className="max-w-3xl">
          <h3
            id={`${anchor}-title`}
            className="font-display text-2xl font-semibold text-slate-900 tracking-tight"
          >
            {title}
            <span className="ml-2 align-middle font-mono text-sm font-medium text-slate-500 tabular-nums">
              ({services.length})
            </span>
          </h3>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed">{intro}</p>
        </div>

        {SHOW_LOAN_PLANNER && category === 'credit' && (
          <a
            href="#estimator"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#082E43] hover:text-[#C27803] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Estimate a repayment</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </Reveal>

      {/* Cards */}
      <RevealGroup stagger={0.06} className={`grid grid-cols-1 gap-4 ${gridCols}`}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} accent={accent} />
        ))}
      </RevealGroup>
    </div>
  );
}

function ServiceCard({ service, accent }: { service: FinancialServiceItem; accent: string }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={cardHover}
      className="relative flex flex-col h-full p-5 rounded-xl bg-[#FFFDF7] border border-slate-200 overflow-hidden hover:border-[#082E43]/30 hover:shadow-lg hover:shadow-[#082E43]/5 transition-[border-color,box-shadow] duration-200"
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${accent}`} />

      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-base font-semibold text-slate-900 tracking-tight leading-snug">
          {service.title}
        </h4>
        <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">
          {service.number}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{service.summary}</p>

      {/* What it covers */}
      <ul className="mt-3 space-y-1">
        {service.keyUses.map((use) => (
          <li key={use} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
            <span aria-hidden="true" className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#073035] shrink-0" />
            <span>{use}</span>
          </li>
        ))}
      </ul>

      {service.regulatoryNote && (
        <p className="mt-3 text-xs text-slate-500 leading-relaxed italic">
          {service.regulatoryNote}
        </p>
      )}

      {/* Footer pinned to the bottom so every card lines up */}
      <div className="mt-auto pt-4">
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Ideal for: </span>
            {service.idealFor.join(' · ')}
          </p>
          {SHOW_LOAN_PLANNER && service.category === 'credit' && (
            <a
              href="#estimator"
              className="text-xs font-semibold text-[#082E43] hover:text-[#C27803] whitespace-nowrap transition-colors"
            >
              Estimate repayment →
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

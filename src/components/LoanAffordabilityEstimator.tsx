import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LOAN_ESTIMATOR_PRESETS } from '../data/sibontaData';
import { AnimatedNumber, Reveal } from './motion/Reveal';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);

const formatPercent = (val: number) => `${val.toFixed(1)}%`;

interface LoanAffordabilityEstimatorProps {
  onApplyWithPlan: (productName: string, modeledSummary: string) => void;
  onApplyForLoan: (productName: string) => void;
}

export function LoanAffordabilityEstimator({
  onApplyWithPlan,
  onApplyForLoan,
}: LoanAffordabilityEstimatorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(LOAN_ESTIMATOR_PRESETS[0].id);
  const activePreset = useMemo(
    () => LOAN_ESTIMATOR_PRESETS.find((p) => p.id === selectedPresetId) || LOAN_ESTIMATOR_PRESETS[0],
    [selectedPresetId],
  );

  const [amount, setAmount] = useState<number>(activePreset.defaultAmount);
  const [months, setMonths] = useState<number>(activePreset.defaultMonths);
  const [monthlySurplus, setMonthlySurplus] = useState<number>(3500);

  const handlePresetChange = (id: string) => {
    const next = LOAN_ESTIMATOR_PRESETS.find((p) => p.id === id);
    if (!next) return;
    setSelectedPresetId(id);
    setAmount(next.defaultAmount);
    setMonths(next.defaultMonths);
  };

  // Standard amortizing schedule calculation for indicative planning
  const calculation = useMemo(() => {
    const r = activePreset.indicativeMonthlyRate;
    const n = months;
    const monthlyPayment =
      r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRepayment = monthlyPayment * n;
    const totalCostOfCredit = totalRepayment - amount;
    const debtServiceRatio = monthlySurplus > 0 ? (monthlyPayment / monthlySurplus) * 100 : 100;

    let affordabilityState: 'comfortable' | 'caution' | 'stretched' = 'comfortable';
    if (debtServiceRatio > 40) {
      affordabilityState = 'stretched';
    } else if (debtServiceRatio > 28) {
      affordabilityState = 'caution';
    }

    return {
      monthlyPayment,
      totalRepayment,
      totalCostOfCredit,
      debtServiceRatio,
      affordabilityState,
    };
  }, [activePreset.indicativeMonthlyRate, amount, months, monthlySurplus]);

  const handleDiscussPlan = () => {
    const summary = `Indicative plan modeled: ${activePreset.name} for ${formatCurrency(
      amount,
    )} over ${months} months (approx. ${formatCurrency(
      calculation.monthlyPayment,
    )}/month, stated monthly net cash flow ${formatCurrency(monthlySurplus)}).`;
    onApplyWithPlan(activePreset.name.replace(/ Loan$/, ' Loans'), summary);
  };

  return (
    <section id="estimator" className="py-20 sm:py-24 bg-[#C9DFEA] text-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Narrative & Responsible Lending Principles */}
          <Reveal className="lg:col-span-5 space-y-6">
            <p className="text-sm font-medium text-[#7A4E00] tracking-wide">
              Responsible Lending & Repayment Planner
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#082E43] text-balance">
              Plan financing around real cash flow before you apply
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">
              Responsible lending protects your business and household stability. Use our
              indicative repayment planner to test how a working capital loan, recovery facility,
              entrepreneur loan, or salary advance fits within your monthly net income or surplus.
            </p>

            <div className="pt-6 border-t border-[#082E43]/15 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#7A4E00] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-[#082E43]">
                    Transparent Affordability Assessment
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Every facility, including Individual Salary Advances repaid through salary
                    deductions, is reviewed against verified affordability and applicable lending
                    requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#7A4E00] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-[#082E43]">
                    Paired With Debt Counselling When Needed
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    If existing obligations are heavy, our Debt Counselling team helps restructure
                    budgets and repayment plans before taking on new credit.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Interactive Estimator Panel */}
          <Reveal
            delay={0.15}
            className="lg:col-span-7 bg-[#FFFDF7] border border-[#082E43]/10 shadow-sm rounded-2xl p-6 sm:p-8 lg:p-10"
          >
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-3">
                Select Credit Product
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LOAN_ESTIMATOR_PRESETS.map((preset) => {
                  const selected = preset.id === activePreset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetChange(preset.id)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors duration-150 cursor-pointer ${
                        selected
                          ? 'bg-[#082E43] text-white border-[#082E43]'
                          : 'bg-[#F4F8FB] text-slate-800 border-slate-200 hover:border-[#082E43]/50'
                      }`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-slate-600">{activePreset.description}</p>
            </div>

            {/* Sliders */}
            <div className="mt-8 space-y-6">
              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="loan-amount" className="text-sm font-medium text-slate-700">
                    Indicative Financing Amount
                  </label>
                  <span className="font-mono tabular-nums text-lg font-semibold text-[#082E43]">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <input
                  id="loan-amount"
                  type="range"
                  min={activePreset.minAmount}
                  max={activePreset.maxAmount}
                  step={activePreset.stepAmount}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-[#082E43] cursor-pointer h-2 bg-[#C9DFEA] rounded-lg"
                />
                <div className="flex justify-between text-xs font-mono tabular-nums text-slate-500 mt-1.5">
                  <span>{formatCurrency(activePreset.minAmount)}</span>
                  <span>{formatCurrency(activePreset.maxAmount)}</span>
                </div>
              </div>

              {/* Term */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="loan-months" className="text-sm font-medium text-slate-700">
                    Repayment Period
                  </label>
                  <span className="font-mono tabular-nums text-lg font-semibold text-[#082E43]">
                    {months} {months === 1 ? 'month' : 'months'}
                  </span>
                </div>
                <input
                  id="loan-months"
                  type="range"
                  min={activePreset.minMonths}
                  max={activePreset.maxMonths}
                  step={1}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full accent-[#082E43] cursor-pointer h-2 bg-[#C9DFEA] rounded-lg"
                />
                <div className="flex justify-between text-xs font-mono tabular-nums text-slate-500 mt-1.5">
                  <span>{activePreset.minMonths} mo</span>
                  <span>{activePreset.maxMonths} mo</span>
                </div>
              </div>

              {/* Monthly Net Cash Flow / Take-home Income */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="monthly-surplus" className="text-sm font-medium text-slate-700">
                    Monthly Net Income or Business Surplus
                  </label>
                  <span className="font-mono tabular-nums text-base font-medium text-slate-700">
                    {formatCurrency(monthlySurplus)} / mo
                  </span>
                </div>
                <input
                  id="monthly-surplus"
                  type="range"
                  min={300}
                  max={20000}
                  step={100}
                  value={monthlySurplus}
                  onChange={(e) => setMonthlySurplus(Number(e.target.value))}
                  className="w-full accent-[#082E43] cursor-pointer h-2 bg-[#C9DFEA] rounded-lg"
                />
              </div>
            </div>

            {/* Output Metrics Strip */}
            <div className="mt-8 pt-6 border-t border-[#082E43]/15 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-slate-500">Est. Monthly Installment</p>
                <p className="font-mono tabular-nums text-2xl font-semibold text-[#082E43] mt-1">
                  <AnimatedNumber value={calculation.monthlyPayment} format={formatCurrency} />
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Indicative Total Repayment</p>
                <p className="font-mono tabular-nums text-xl font-medium text-slate-700 mt-1">
                  <AnimatedNumber value={calculation.totalRepayment} format={formatCurrency} />
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Installment-to-Income Ratio</p>
                <p className="font-mono tabular-nums text-xl font-medium text-slate-700 mt-1">
                  <AnimatedNumber value={calculation.debtServiceRatio} format={formatPercent} />
                </p>
              </div>
            </div>

            {/* Explicit Affordability Signal (Icon + Text Label, never color-only) */}
            <div className="mt-6 p-4 rounded-xl bg-[#EAF2F6] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {calculation.affordabilityState === 'comfortable' ? (
                  <CheckCircle2
                    className="w-5 h-5 text-[#073035] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertTriangle
                    className="w-5 h-5 text-[#7A4E00] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      calculation.affordabilityState === 'comfortable' ? 'text-[#073035]' : 'text-[#082E43]'
                    }`}
                  >
                    {calculation.affordabilityState === 'comfortable' &&
                      'Affordability Check: Well Within Prudent Range'}
                    {calculation.affordabilityState === 'caution' &&
                      'Affordability Check: Moderate Repayment Load'}
                    {calculation.affordabilityState === 'stretched' &&
                      'Affordability Check: High Repayment Load. Consider a Longer Term or Advisory'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activePreset.complianceNote}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onApplyForLoan(activePreset.name)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C27803]"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleDiscussPlan}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#082E43] bg-[#F59E0B] hover:bg-[#D97706] hover:text-white rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082E43]"
              >
                <span>Discuss This Plan</span>
              </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

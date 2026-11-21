import { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { MotionConfig, motion } from 'motion/react';
import { EASE_OUT, fadeUp } from './components/motion/Reveal';
import { Navbar } from './components/Navbar';
import { ResilientImage } from './components/ResilientImage';
import { ServicesCatalog } from './components/ServicesCatalog';
import { LoanAffordabilityEstimator } from './components/LoanAffordabilityEstimator';
import { TargetCustomersSection } from './components/TargetCustomersSection';
import { FaqDialog } from './components/FaqDialog';
import { ConsultationForm } from './components/ConsultationForm';
import { Footer } from './components/Footer';
import { SHOW_LOAN_PLANNER } from './config/features';
import { AboutSection } from './components/AboutSection';
import { LoanApplication } from './components/loan-application/LoanApplication';
import { scrollToId, useSmoothAnchorScroll } from './lib/smoothScroll';
import heroImage from './assets/images/hero_sibonta_finance_1795263092437.jpg';

export default function App() {
  const [preselectedService, setPreselectedService] = useState<string>('SME Working Capital Loans');
  const [preselectedCustomerGroup, setPreselectedCustomerGroup] = useState<string>('SMEs');
  const [preselectedNotes, setPreselectedNotes] = useState<string>('');

  useSmoothAnchorScroll();

  const [loanApplicationOpen, setLoanApplicationOpen] = useState(false);
  const [loanApplicationProduct, setLoanApplicationProduct] = useState<string | undefined>();
  const openLoanApplication = useCallback((product?: string) => {
    setLoanApplicationProduct(product);
    setLoanApplicationOpen(true);
  }, []);
  const closeLoanApplication = useCallback(() => setLoanApplicationOpen(false), []);

  const [faqOpen, setFaqOpen] = useState(false);
  const openFaq = useCallback(() => setFaqOpen(true), []);
  const closeFaq = useCallback(() => setFaqOpen(false), []);

  const scrollToConsultation = () => {
    // Wait one frame so the form / mobile menu update first, then glide there.
    requestAnimationFrame(() => scrollToId('consultation'));
  };

  const handleSelectServiceForInquiry = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
    scrollToConsultation();
  };

  const handleApplyWithPlan = (productName: string, modeledSummary: string) => {
    setPreselectedService(productName);
    setPreselectedNotes(modeledSummary);
    scrollToConsultation();
  };

  const handleSelectSegmentForInquiry = (segmentTitle: string, primaryNeed: string) => {
    setPreselectedCustomerGroup(segmentTitle);
    setPreselectedService(primaryNeed);
    scrollToConsultation();
  };

  return (
    <MotionConfig reducedMotion="user">
    <div id="top" className="min-h-screen flex flex-col bg-[#F4F8FB] text-slate-900">
      <Navbar
        onApplyForLoan={() => openLoanApplication()}
        onOpenFaq={openFaq}
      />

      <main className="flex-1">
        {/* Hero Section: full-screen, edge-to-edge welcome */}
        <section className="relative isolate flex items-center min-h-[calc(100svh-4rem)] overflow-hidden bg-[#C9DFEA]">
          {/* Background photo spanning the full width of the screen */}
          <motion.div
            className="absolute inset-0 -z-20"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: EASE_OUT }}
          >
            <ResilientImage
              src={heroImage}
              alt="Small business owner and financial advisor reviewing business performance charts together at a sunlit oak table"
              fallbackTitle="SIBONTA Finance Ltd"
              className="w-full h-full object-cover object-[70%_center]"
            />
          </motion.div>
          {/* Ice-blue fade so the text stays clear over the photo */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[#C9DFEA]/75 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#C9DFEA]/80 lg:from-25% lg:via-[#C9DFEA]/50 lg:via-50% lg:to-transparent lg:to-80%"
          />

          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
            <motion.div
              className="max-w-2xl"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
            >

              <motion.h1 variants={fadeUp} className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold text-[#082E43] leading-[1.08] tracking-tight text-balance">
                Your Partner for a Brighter Financial Future
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-base sm:text-xl text-slate-700 leading-relaxed max-w-xl">
                Responsible loans, financial advisory, accounting, and debt counselling for SMEs,
                entrepreneurs, women, and young people in Rwanda.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openLoanApplication()}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm sm:text-base font-semibold text-white bg-[#082E43] hover:bg-[#05202F] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082E43]"
                >
                  <span>Apply for a Loan</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href="#services"
                  className="inline-flex items-center justify-center px-6 py-4 text-sm sm:text-base font-semibold text-[#082E43] bg-[#FFFDF7]/60 border border-[#082E43]/40 hover:border-[#082E43] hover:bg-[#FFFDF7] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082E43]"
                >
                  Explore Products & Services
                </a>

                {SHOW_LOAN_PLANNER && (
                  <a
                    href="#estimator"
                    className="text-sm sm:text-base font-semibold text-[#082E43] underline underline-offset-4 decoration-[#082E43]/30 hover:decoration-[#082E43] transition-colors whitespace-nowrap"
                  >
                    Estimate Loan Repayment
                  </a>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Core Products & Services Catalog */}
        <ServicesCatalog />

        {/* Responsible Lending & Repayment Estimator (hidden for now, see src/config/features.ts) */}
        {SHOW_LOAN_PLANNER && (
          <LoanAffordabilityEstimator
            onApplyWithPlan={handleApplyWithPlan}
            onApplyForLoan={openLoanApplication}
          />
        )}

        {/* About Us */}
        <AboutSection />

        {/* Target Customers Pathways */}
        <TargetCustomersSection onSelectSegmentForInquiry={handleSelectSegmentForInquiry} />


        {/* Consultation & Inquiry Capture */}
        <ConsultationForm
          preselectedService={preselectedService}
          preselectedCustomerGroup={preselectedCustomerGroup}
          preselectedNotes={preselectedNotes}
        />
      </main>

      <Footer onOpenFaq={openFaq} onApplyForLoan={() => openLoanApplication()} />

      <FaqDialog open={faqOpen} onClose={closeFaq} />

      <LoanApplication
        open={loanApplicationOpen}
        onClose={closeLoanApplication}
        initialProduct={loanApplicationProduct}
      />
    </div>
    </MotionConfig>
  );
}

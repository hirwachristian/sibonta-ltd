import { SEGMENT_IMAGES } from '../config/images';

export type ServiceCategory = 'credit' | 'advisory';

export interface FinancialServiceItem {
  id: string;
  number: string;
  category: ServiceCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  keyUses: string[];
  regulatoryNote?: string;
  idealFor: string[];
}

export interface LoanEstimatorPreset {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  stepAmount: number;
  minMonths: number;
  maxMonths: number;
  defaultMonths: number;
  indicativeMonthlyRate: number; // Illustrative planning rate per month (e.g. 0.02 = 2.0%)
  description: string;
  complianceNote: string;
}

export interface TargetCustomerSegment {
  id: string;
  number: string;
  title: string;
  headline: string;
  focusSummary: string;
  narrative: string;
  imageUrl: string;
  /** Responsive versions of imageUrl (small + large). */
  imageSrcSet?: string;
  imageAlt: string;
  recommendedSolutions: string[];
  primaryNeed: string;
}

export const FINANCIAL_SERVICES: FinancialServiceItem[] = [
  {
    id: 'sme-working-capital',
    number: '01',
    category: 'credit',
    categoryLabel: 'Credit & Loan Product',
    title: 'SME Working Capital Loans',
    summary:
      'Financial support for small and medium-sized enterprises to purchase stock, pay suppliers, manage operating expenses, and maintain business growth.',
    keyUses: [
      'Stock and inventory replenishment',
      'Timely supplier settlements',
      'Day-to-day operating expenses',
      'Sustained working capital cycles',
    ],
    idealFor: ['SMEs', 'Established traders & service firms'],
  },
  {
    id: 'emergency-business-recovery',
    number: '02',
    category: 'credit',
    categoryLabel: 'Credit & Loan Product',
    title: 'Emergency Business Recovery Loans',
    summary:
      'Short-term financing to help businesses overcome unexpected financial challenges, restore operations, and recover from temporary cash-flow difficulties.',
    keyUses: [
      'Bridging temporary cash-flow gaps',
      'Restoring interrupted business operations',
      'Covering urgent operational disruptions',
      'Structured short-term recovery repayment',
    ],
    idealFor: ['SMEs', 'Resilient enterprises facing short-term shocks'],
  },
  {
    id: 'individual-entrepreneur-loans',
    number: '03',
    category: 'credit',
    categoryLabel: 'Credit & Loan Product',
    title: 'Individual Entrepreneur Loans',
    summary:
      'Financing for individuals operating small businesses to invest in equipment, increase stock, expand activities, and improve their income.',
    keyUses: [
      'Purchasing tools and business equipment',
      'Expanding daily trading stock',
      'Scaling service or retail activities',
      'Strengthening household and enterprise income',
    ],
    idealFor: ['Individual Entrepreneurs', 'Women', 'Young People'],
  },
  {
    id: 'individual-salary-advance',
    number: '04',
    category: 'credit',
    categoryLabel: 'Credit & Loan Product',
    title: 'Individual Salary Advance',
    summary:
      'Short-term financing for eligible salaried employees, with repayment through salary deductions, subject to affordability and applicable lending requirements.',
    keyUses: [
      'Structured short-term personal liquidity',
      'Convenient repayment via salary deductions',
      'Transparent affordability assessment upfront',
      'Predictable deduction schedules',
    ],
    regulatoryNote:
      'Subject to affordability verification and applicable lending requirements.',
    idealFor: ['Eligible salaried employees'],
  },
  {
    id: 'business-advisory',
    number: '05',
    category: 'advisory',
    categoryLabel: 'Financial Advisory & Business Support',
    title: 'Business Advisory Services',
    summary:
      'Practical advice on business planning, financial management, business growth, and improving profitability.',
    keyUses: [
      'Actionable business and expansion planning',
      'Cash-flow and financial management discipline',
      'Margin and profitability optimization',
      'Investment readiness guidance',
    ],
    idealFor: ['SMEs', 'Individual Entrepreneurs', 'Women', 'Young People'],
  },
  {
    id: 'debt-counselling',
    number: '06',
    category: 'advisory',
    categoryLabel: 'Financial Advisory & Business Support',
    title: 'Debt Counselling Services',
    summary:
      'Support to individuals and businesses experiencing financial difficulties through debt assessment, budgeting, repayment planning, and responsible debt management.',
    keyUses: [
      'Comprehensive personal or business debt assessment',
      'Realistic household and enterprise budgeting',
      'Structured, sustainable repayment planning',
      'Long-term responsible debt management habits',
    ],
    idealFor: ['Individuals', 'SMEs', 'Salaried borrowers'],
  },
  {
    id: 'accounting-bookkeeping',
    number: '07',
    category: 'advisory',
    categoryLabel: 'Financial Advisory & Business Support',
    title: 'Accounting and Bookkeeping',
    summary:
      'Assistance with recording financial transactions, maintaining accounting records, and preparing reliable financial information.',
    keyUses: [
      'Accurate daily transaction recording',
      'Organized ledgers and accounting records',
      'Monthly bank and account reconciliations',
      'Reliable financial data for decision-making',
    ],
    idealFor: ['SMEs', 'Individual Entrepreneurs'],
  },
  {
    id: 'financial-statements',
    number: '08',
    category: 'advisory',
    categoryLabel: 'Financial Advisory & Business Support',
    title: 'Financial Statements Preparation',
    summary:
      'Preparation of financial statements and reports to help businesses understand their financial performance and position.',
    keyUses: [
      'Income statements and balance sheets',
      'Cash-flow position reporting',
      'Clear visibility into enterprise performance',
      'Documentation ready for lenders and stakeholders',
    ],
    idealFor: ['SMEs', 'Growing enterprises'],
  },
  {
    id: 'payroll-management',
    number: '09',
    category: 'advisory',
    categoryLabel: 'Financial Advisory & Business Support',
    title: 'Payroll Management',
    summary:
      'Support with payroll calculations, salary schedules, statutory deductions, and payroll reporting.',
    keyUses: [
      'Accurate periodic payroll calculations',
      'Organized employee salary schedules',
      'Statutory deduction tracking and compliance',
      'Clear payroll summaries and reporting',
    ],
    idealFor: ['SMEs', 'Employers'],
  },
  {
    id: 'accounting-auditing',
    number: '10',
    category: 'advisory',
    categoryLabel: 'Financial Advisory & Business Support',
    title: 'Accounting and Auditing Services',
    summary:
      'Accounting support and, where appropriately authorized, independent audit services in accordance with applicable professional and regulatory requirements.',
    keyUses: [
      'Structured internal accounting reviews',
      'Independent audit engagements where authorized',
      'Adherence to professional and regulatory standards',
      'Governance and stakeholder confidence',
    ],
    regulatoryNote:
      'Independent audit services provided where appropriately authorized in accordance with applicable professional and regulatory requirements.',
    idealFor: ['SMEs', 'Institutions & regulated businesses'],
  },
];

export const LOAN_ESTIMATOR_PRESETS: LoanEstimatorPreset[] = [
  {
    id: 'sme-working-capital',
    name: 'SME Working Capital Loan',
    minAmount: 1000,
    maxAmount: 50000,
    defaultAmount: 10000,
    stepAmount: 500,
    minMonths: 3,
    maxMonths: 24,
    defaultMonths: 12,
    indicativeMonthlyRate: 0.018,
    description: 'For purchasing stock, paying suppliers, and managing SME operating expenses.',
    complianceNote:
      'Indicative working capital schedule. Final approval and pricing depend on business cash-flow review and applicable lending terms.',
  },
  {
    id: 'emergency-business-recovery',
    name: 'Emergency Business Recovery Loan',
    minAmount: 500,
    maxAmount: 25000,
    defaultAmount: 5000,
    stepAmount: 250,
    minMonths: 2,
    maxMonths: 12,
    defaultMonths: 6,
    indicativeMonthlyRate: 0.016,
    description: 'Short-term recovery liquidity to stabilize operations after unexpected cash-flow pressure.',
    complianceNote:
      'Designed for rapid short-term recovery. Subject to operational viability review and responsible repayment capacity.',
  },
  {
    id: 'individual-entrepreneur-loans',
    name: 'Individual Entrepreneur Loan',
    minAmount: 300,
    maxAmount: 15000,
    defaultAmount: 3000,
    stepAmount: 100,
    minMonths: 3,
    maxMonths: 18,
    defaultMonths: 9,
    indicativeMonthlyRate: 0.019,
    description: 'For equipment investment, stock expansion, and growing small-business income.',
    complianceNote:
      'Tailored for individual business owners. Paired with bookkeeping and business advisory support where helpful.',
  },
  {
    id: 'individual-salary-advance',
    name: 'Individual Salary Advance',
    minAmount: 100,
    maxAmount: 5000,
    defaultAmount: 800,
    stepAmount: 50,
    minMonths: 1,
    maxMonths: 6,
    defaultMonths: 3,
    indicativeMonthlyRate: 0.015,
    description: 'Short-term employee financing repaid cleanly through scheduled salary deductions.',
    complianceNote:
      'Repayment through salary deductions, strictly subject to affordability verification and applicable lending requirements.',
  },
];

export const TARGET_CUSTOMER_SEGMENTS: TargetCustomerSegment[] = [
  {
    id: 'smes',
    number: '01',
    title: 'SMEs',
    headline: 'Working capital, business recovery, and disciplined financial management.',
    focusSummary: 'Working capital · Business recovery · Financial management',
    narrative:
      'Small and medium-sized enterprises drive local employment and supply chains. We combine working capital and recovery credit with reliable bookkeeping, payroll management, financial statements, and audit support so owners can scale on solid numbers.',
    imageUrl: SEGMENT_IMAGES.sme.src,
    imageSrcSet: SEGMENT_IMAGES.sme.srcSet,
    imageAlt: 'SME business owner reviewing stock inventory on a tablet in a well-organized workshop and retail store',
    recommendedSolutions: [
      'SME Working Capital Loans',
      'Emergency Business Recovery Loans',
      'Financial Statements Preparation',
      'Payroll Management & Auditing',
    ],
    primaryNeed: 'SME Working Capital Loans',
  },
  {
    id: 'individual-entrepreneurs',
    number: '02',
    title: 'Individual Entrepreneurs',
    headline: 'Business loans, accurate bookkeeping, and practical advisory for sole operators.',
    focusSummary: 'Business loans · Bookkeeping · Business advisory',
    narrative:
      'Independent traders, artisans, and service founders need capital that fits real cash cycles alongside clear financial records. We help individual entrepreneurs acquire equipment, grow stock, and build profitable operations.',
    imageUrl: SEGMENT_IMAGES.entrepreneurs.src,
    imageSrcSet: SEGMENT_IMAGES.entrepreneurs.srcSet,
    imageAlt: 'Individual business owner consulting with a financial advisor over growth projections at an oak table',
    recommendedSolutions: [
      'Individual Entrepreneur Loans',
      'Accounting and Bookkeeping',
      'Business Advisory Services',
      'Debt Counselling Services',
    ],
    primaryNeed: 'Individual Entrepreneur Loans',
  },
  {
    id: 'women',
    number: '03',
    title: 'Women',
    headline: 'Financial access, enterprise development, and lasting economic empowerment.',
    focusSummary: 'Financial access · Enterprise development · Economic empowerment',
    narrative:
      'Closing the financial access gap unlocks resilient enterprises and stronger communities. SIBONTA Finance Ltd provides accessible credit, tailored business planning, and supportive advisory to help women founders establish and expand sustainable businesses.',
    imageUrl: SEGMENT_IMAGES.women.src,
    imageSrcSet: SEGMENT_IMAGES.women.srcSet,
    imageAlt: 'Woman entrepreneur managing financial reports and enterprise operations from a sunlit studio desk',
    recommendedSolutions: [
      'Individual Entrepreneur Loans',
      'SME Working Capital Loans',
      'Business Advisory Services',
      'Financial Statements Preparation',
    ],
    primaryNeed: 'Business Advisory Services',
  },
  {
    id: 'young-people',
    number: '04',
    title: 'Young People',
    headline: 'Entrepreneurship financing, business development, and practical financial literacy.',
    focusSummary: 'Entrepreneurship financing · Business development · Financial literacy',
    narrative:
      'Young founders and emerging professionals deserve structured guidance from day one. We pair accessible startup and growth financing with financial literacy, budgeting, and responsible debt management so young people build durable ventures.',
    imageUrl: SEGMENT_IMAGES.youth.src,
    imageSrcSet: SEGMENT_IMAGES.youth.srcSet,
    imageAlt: 'Young entrepreneurs collaborating over business budgets and product prototypes in a modern studio',
    recommendedSolutions: [
      'Individual Entrepreneur Loans',
      'Business Advisory Services',
      'Debt Counselling Services',
      'Accounting and Bookkeeping',
    ],
    primaryNeed: 'Individual Entrepreneur Loans',
  },
];

export type FaqCategory = 'eligibility' | 'counselling' | 'accounting';

export interface FaqItem {
  id: string;
  number: string;
  category: FaqCategory;
  categoryLabel: string;
  question: string;
  answer: string;
  relatedService: string;
  actionLabel: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-sme-entrepreneur-eligibility',
    number: '01',
    category: 'eligibility',
    categoryLabel: 'Loan Eligibility',
    question:
      'What are the core eligibility requirements for SME Working Capital and Individual Entrepreneur Loans?',
    answer:
      'Applicants must operate an active enterprise or small business with verifiable trading activity, identifiable cash flows, and a clear productive use of funds, such as purchasing stock, paying suppliers, covering operating expenses, or investing in equipment. Every facility undergoes a responsible affordability review so repayments align realistically with business revenue.',
    relatedService: 'SME Working Capital Loans',
    actionLabel: 'Inquire about Business Loans',
  },
  {
    id: 'faq-salary-advance-eligibility',
    number: '02',
    category: 'eligibility',
    categoryLabel: 'Loan Eligibility',
    question:
      'How does the Individual Salary Advance work and how is affordability assessed?',
    answer:
      'Our Individual Salary Advance provides short-term financing for eligible salaried employees, with repayment structured cleanly through scheduled salary deductions. Approval is strictly subject to income verification, net take-home affordability thresholds, and applicable lending requirements so your household obligations remain protected.',
    relatedService: 'Individual Salary Advance',
    actionLabel: 'Inquire about Salary Advance',
  },
  {
    id: 'faq-emergency-recovery-criteria',
    number: '03',
    category: 'eligibility',
    categoryLabel: 'Loan Eligibility',
    question:
      'When can a business qualify for an Emergency Business Recovery Loan?',
    answer:
      'Emergency Business Recovery Loans are designed for viable enterprises experiencing temporary cash-flow pressure or unexpected operational disruptions. We review your underlying business model, short-term recovery plan, and realistic cash generation so the facility restores normal trading rather than adding unsustainable debt.',
    relatedService: 'Emergency Business Recovery Loans',
    actionLabel: 'Discuss Recovery Financing',
  },
  {
    id: 'faq-women-youth-access',
    number: '04',
    category: 'eligibility',
    categoryLabel: 'Loan Eligibility',
    question:
      'Do women and young entrepreneurs need prior formal financial statements to apply?',
    answer:
      'While established SMEs benefit from formal financial statements, we recognize that many women-led ventures and young entrepreneurs start with informal records. Where needed, our Business Advisory and Bookkeeping teams help organize your cash-flow records and financial plan alongside your credit assessment.',
    relatedService: 'Individual Entrepreneur Loans',
    actionLabel: 'Explore Entrepreneur Financing',
  },
  {
    id: 'faq-debt-counselling-process',
    number: '05',
    category: 'counselling',
    categoryLabel: 'Debt Counselling Process',
    question:
      'What happens step by step during SIBONTA’s Debt Counselling process?',
    answer:
      'Our process begins with a confidential debt assessment mapping all existing obligations, income sources, and essential living or operating costs. Next, an advisor works with you to build a realistic budget and prioritized repayment schedule, equipping you with practical debt management practices to regain stability.',
    relatedService: 'Debt Counselling Services',
    actionLabel: 'Schedule Debt Counselling',
  },
  {
    id: 'faq-debt-counselling-non-borrowers',
    number: '06',
    category: 'counselling',
    categoryLabel: 'Debt Counselling Process',
    question:
      'Can individuals or businesses use Debt Counselling even without an active SIBONTA loan?',
    answer:
      'Yes. Debt Counselling is available both as a standalone support service for individuals and businesses facing financial pressure, and alongside our lending review when applicants need to stabilize existing commitments before taking on new credit.',
    relatedService: 'Debt Counselling Services',
    actionLabel: 'Request Standalone Counselling',
  },
  {
    id: 'faq-accounting-bookkeeping-scope',
    number: '07',
    category: 'accounting',
    categoryLabel: 'Accounting & Audit Support',
    question:
      'What is included in your Accounting, Bookkeeping, and Financial Statements Preparation services?',
    answer:
      'We handle day-to-day recording of financial transactions, maintaining organized accounting ledgers, reconciling accounts, and preparing accurate Financial Statements. This gives business owners clear visibility into performance and position, and builds reliable documentation for lenders, partners, and tax compliance.',
    relatedService: 'Accounting and Bookkeeping',
    actionLabel: 'Request Bookkeeping Support',
  },
  {
    id: 'faq-payroll-management',
    number: '08',
    category: 'accounting',
    categoryLabel: 'Accounting & Audit Support',
    question:
      'How does SIBONTA support SMEs with Payroll Management?',
    answer:
      'Our Payroll Management service covers accurate periodic payroll calculations, structured employee salary schedules, statutory deduction tracking, and clean payroll reporting. This helps growing employers stay compliant and pay teams reliably on time.',
    relatedService: 'Payroll Management',
    actionLabel: 'Inquire about Payroll Management',
  },
  {
    id: 'faq-auditing-authorization',
    number: '09',
    category: 'accounting',
    categoryLabel: 'Accounting & Audit Support',
    question:
      'How are your Accounting and Auditing Services delivered and regulated?',
    answer:
      'We provide structured accounting support across SMEs and growing organizations. Where independent audit services are required, they are conducted only where appropriately authorized and strictly in accordance with applicable professional and regulatory requirements.',
    relatedService: 'Accounting and Auditing Services',
    actionLabel: 'Discuss Accounting & Audit',
  },
];


/** Official contact details (from the SIBONTA Finance Ltd loan application form). */
export const COMPANY_CONTACT = {
  phone: '+250 781 469 429',
  email: 'sibontaf@gmail.com',
  addressLines: ['Diamond House, 2nd Floor, Gatenga', 'Kicukiro District, Kigali, Rwanda'],
  /** WhatsApp number in international format, digits only (assumed same as the office phone). */
  whatsapp: '250781469429',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Diamond+House+Gatenga+Kicukiro+Kigali+Rwanda',
} as const;

export interface CompanyStat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

/**
 * Figures shown under the About Us card (they count up when scrolled into view).
 * Keep these TRUE and up to date: customers and regulators may treat them as claims.
 */
export const COMPANY_STATS: CompanyStat[] = [
  { value: 1200, suffix: '+', label: 'Clients served' },
  { value: 24, suffix: '/7', label: 'Support' },
  { value: 5, suffix: '+', label: 'Years of experience' },
];

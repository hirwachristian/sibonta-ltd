/**
 * Online version of the SIBONTA Finance Ltd Loan Application Form (sections 1–10).
 * Section 11 ("For official use only") is completed by staff and is not part of the online form.
 *
 * Steps and fields are described here once; the form renders from this schema and the
 * submitted email is built from the same labels, so the two never drift apart.
 */

import {
  ID_HINT,
  PHONE_HINT,
  normaliseId,
  validateDateOfBirth,
  validateIdOrPassport,
  validatePhone,
} from '../../lib/validators';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normaliseName = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
/** True when two phone numbers are the same line, however they were typed. */
const sameNumber = (a: string, b?: string) => {
  const last9 = (s: string) => s.replace(/\D/g, '').slice(-9);
  return !!b && last9(a).length === 9 && last9(a) === last9(b);
};

export type Row = Record<string, string>;
export type Value = string | string[] | boolean | Row[];
export type ApplicationData = Record<string, Value>;

export interface Column {
  name: string;
  label: string;
  money?: boolean;
  date?: boolean;
}

export interface Field {
  name: string;
  label: string;
  type:
    | 'text'
    | 'money'
    | 'number'
    | 'date'
    | 'email'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checks'
    | 'table'
    | 'consent';
  options?: string[];
  columns?: Column[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Spans both columns on wide screens. */
  full?: boolean;
  showIf?: (d: ApplicationData) => boolean;
  /** Extra real-world check; return an error message, or undefined when valid. */
  validate?: (value: string, d: ApplicationData) => string | undefined;
  /** Convert typing to capital letters (passport numbers). */
  uppercase?: boolean;
}

export interface Step {
  id: string;
  number: number;
  title: string;
  description: string;
  fields: Field[];
  showIf?: (d: ApplicationData) => boolean;
}

export const LOAN_PRODUCTS = [
  'SME Working Capital Loan',
  'Emergency Business Recovery Loan',
  'Individual Entrepreneur Loan',
  'Individual Salary Advance',
  'Other',
];

const BUSINESS_PRODUCTS = [
  'SME Working Capital Loan',
  'Emergency Business Recovery Loan',
  'Individual Entrepreneur Loan',
];

export const isBusinessApplication = (d: ApplicationData) =>
  BUSINESS_PRODUCTS.includes(d.product as string) || d.employmentType === 'Self-employed';

export const DECLARATIONS = [
  'I declare that the information and documents provided in this application are true, accurate and complete to the best of my knowledge. I understand that material omissions or false information may result in rejection or other action permitted by law.',
  'I authorise Sibonta Finance Ltd, subject to applicable law and regulatory requirements, to verify the information supplied, contact my employer, business references, financial institutions and proposed guarantors where relevant, and obtain or share credit information with authorised credit reference agencies and competent authorities for credit assessment, administration, recovery, audit and regulatory purposes.',
  'I understand that Sibonta Finance Ltd will assess my ability to repay, may request additional information, and may approve, decline or offer different terms. Approval, disbursement, interest, fees, penalties, insurance (if any), repayment schedule and security requirements will be set out in the Key Facts Statement, loan offer and/or loan agreement provided before I accept the facility.',
  'I confirm that I have had the opportunity to ask questions and that I will review the applicable Key Facts Statement and loan agreement before signing them. I understand that this application alone is not a loan agreement and does not itself create an obligation for Sibonta Finance Ltd to lend.',
  'I consent to the processing of my personal information for the purposes described above, in accordance with applicable data protection and privacy requirements. I understand that I may contact Sibonta Finance Ltd to ask questions about the handling of my information.',
];

export const STEPS: Step[] = [
  {
    id: 'loan',
    number: 1,
    title: 'Loan Product & Application Details',
    description: 'Tell us which product you are applying for and how you plan to use it.',
    fields: [
      { name: 'product', label: 'Loan product', type: 'radio', options: LOAN_PRODUCTS, required: true, full: true },
      { name: 'productOther', label: 'Other product (please specify)', type: 'text', required: true, full: true, showIf: (d) => d.product === 'Other' },
      { name: 'amount', label: 'Amount requested (RWF)', type: 'money', required: true },
      { name: 'termMonths', label: 'Requested loan term (months)', type: 'number', required: true },
      { name: 'disbursementDate', label: 'Preferred disbursement date', type: 'date' },
      { name: 'purpose', label: 'Purpose of loan / use of funds', type: 'textarea', required: true, full: true },
      { name: 'repaymentFrequency', label: 'Repayment frequency', type: 'radio', options: ['Monthly', 'Weekly', 'Other'], required: true },
      { name: 'repaymentFrequencyOther', label: 'Other repayment frequency', type: 'text', showIf: (d) => d.repaymentFrequency === 'Other' },
      { name: 'repaymentMethod', label: 'Preferred repayment method', type: 'radio', options: ['Salary deduction', 'Bank transfer', 'Mobile money', 'Other'], required: true, full: true },
      { name: 'repaymentMethodOther', label: 'Other repayment method', type: 'text', showIf: (d) => d.repaymentMethod === 'Other' },
    ],
  },
  {
    id: 'personal',
    number: 2,
    title: 'Applicant Personal Details',
    description: 'Please enter your details exactly as they appear on your ID.',
    fields: [
      { name: 'fullName', label: 'Full name (as on ID)', type: 'text', required: true },
      {
        name: 'nationalId',
        label: 'National ID / Passport number',
        type: 'text',
        required: true,
        uppercase: true,
        placeholder: 'e.g. 1 1990 8 0012345 0 67',
        hint: ID_HINT,
        validate: (v, d) => validateIdOrPassport(v, { dob: d.dob as string, gender: d.gender as string }),
      },
      { name: 'dob', label: 'Date of birth', type: 'date', required: true, validate: (v) => validateDateOfBirth(v) },
      { name: 'gender', label: 'Gender', type: 'radio', options: ['Female', 'Male', 'Prefer not to say'], required: true },
      { name: 'nationality', label: 'Nationality', type: 'text', required: true, placeholder: 'e.g. Rwandan' },
      { name: 'maritalStatus', label: 'Marital status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed', 'Other'], required: true },
      { name: 'spouseName', label: 'Spouse’s full name', type: 'text', showIf: (d) => d.maritalStatus === 'Married' },
      { name: 'dependants', label: 'Number of dependants', type: 'number' },
      {
        name: 'mobile',
        label: 'Mobile telephone',
        type: 'tel',
        required: true,
        placeholder: '078 123 4567',
        hint: PHONE_HINT,
        validate: (v) => validatePhone(v),
      },
      {
        name: 'altPhone',
        label: 'Alternative telephone',
        type: 'tel',
        placeholder: '073 123 4567',
        validate: (v, d) =>
          validatePhone(v, { allowLandline: true }) ??
          (sameNumber(v, d.mobile as string) ? 'Please give a different number from your mobile.' : undefined),
      },
      { name: 'email', label: 'Email address', type: 'email' },
      { name: 'residentialAddress', label: 'Residential address (Village/Umudugudu, Cell, Sector)', type: 'text', required: true, full: true },
      { name: 'district', label: 'District / Province / City', type: 'text', required: true },
      { name: 'yearsAtAddress', label: 'Years at current address', type: 'number' },
      { name: 'accommodation', label: 'Accommodation', type: 'radio', options: ['Owned', 'Rented', 'Family', 'Employer-provided', 'Other'], full: true },
    ],
  },
  {
    id: 'employment',
    number: 3,
    title: 'Employment & Income Details',
    description: 'Your income helps us recommend a repayment you can comfortably afford.',
    fields: [
      { name: 'employerName', label: 'Employer / business name', type: 'text', required: true },
      { name: 'occupation', label: 'Occupation / job title', type: 'text', required: true },
      { name: 'employmentType', label: 'Employment type', type: 'radio', options: ['Permanent', 'Contract', 'Self-employed', 'Casual'], required: true, full: true },
      { name: 'employmentStart', label: 'Employment / business start date', type: 'date' },
      { name: 'employerContact', label: 'Employer contact person and telephone', type: 'text' },
      { name: 'employerAddress', label: 'Employer / business physical address', type: 'text', full: true },
      { name: 'grossIncome', label: 'Gross monthly salary / business income (RWF)', type: 'money', required: true },
      { name: 'netIncome', label: 'Net monthly salary / income (RWF)', type: 'money', required: true },
      { name: 'otherIncome', label: 'Other monthly income and source (RWF)', type: 'text' },
      { name: 'householdExpenses', label: 'Monthly household expenses (RWF)', type: 'money' },
      { name: 'salaryThroughBank', label: 'Salary paid through bank?', type: 'radio', options: ['Yes', 'No'] },
      { name: 'salaryBank', label: 'If yes, which bank?', type: 'text', showIf: (d) => d.salaryThroughBank === 'Yes' },
      { name: 'retirementDate', label: 'Retirement date (if applicable)', type: 'date' },
    ],
  },
  {
    id: 'business',
    number: 4,
    title: 'Business Details',
    description: 'Required for business loans and self-employed applicants.',
    showIf: isBusinessApplication,
    fields: [
      { name: 'businessName', label: 'Registered business name', type: 'text', required: true },
      { name: 'tin', label: 'Registration / TIN number', type: 'text' },
      { name: 'businessSector', label: 'Business type / sector', type: 'text', required: true },
      { name: 'businessStart', label: 'Date business started', type: 'date' },
      { name: 'businessLocation', label: 'Business location', type: 'text', required: true },
      { name: 'ownership', label: 'Ownership', type: 'radio', options: ['Sole proprietor', 'Partnership', 'Company', 'Cooperative'] },
      { name: 'owners', label: 'Owner(s) / directors and contact details', type: 'textarea', full: true },
      { name: 'monthlySales', label: 'Average monthly sales / turnover (RWF)', type: 'money' },
      { name: 'monthlyCosts', label: 'Average monthly operating costs (RWF)', type: 'money' },
      { name: 'monthlyProfit', label: 'Average monthly net profit (RWF)', type: 'money' },
      { name: 'employees', label: 'Number of employees', type: 'number' },
      { name: 'suppliers', label: 'Main suppliers / customers', type: 'textarea', full: true },
    ],
  },
  {
    id: 'commitments',
    number: 5,
    title: 'Existing Loans & Repayment Plan',
    description: 'List any loans you are currently repaying, then tell us how you will repay this one.',
    fields: [
      {
        name: 'existingLoans',
        label: 'Existing loans and financial commitments',
        type: 'table',
        full: true,
        hint: 'Leave empty if you have no existing loans.',
        columns: [
          { name: 'lender', label: 'Lender / institution' },
          { name: 'balance', label: 'Outstanding balance (RWF)', money: true },
          { name: 'instalment', label: 'Monthly instalment (RWF)', money: true },
          { name: 'maturity', label: 'Maturity date', date: true },
          { name: 'security', label: 'Security / guarantor' },
        ],
      },
      { name: 'arrears', label: 'Any loan arrears, defaults or court judgments?', type: 'radio', options: ['No', 'Yes'], required: true },
      { name: 'arrearsDetails', label: 'Please explain', type: 'textarea', required: true, showIf: (d) => d.arrears === 'Yes' },
      { name: 'guaranteesGiven', label: 'Any guarantees given for another person’s loan?', type: 'radio', options: ['No', 'Yes'], required: true },
      { name: 'guaranteesDetails', label: 'Please give details', type: 'textarea', required: true, showIf: (d) => d.guaranteesGiven === 'Yes' },
      { name: 'repaymentSource', label: 'Source of repayment', type: 'text', required: true, placeholder: 'e.g. Monthly salary, business sales' },
      { name: 'expectedRepayment', label: 'Expected monthly repayment amount (RWF)', type: 'money' },
      { name: 'repaymentCycle', label: 'Repayment date / cycle', type: 'text', placeholder: 'e.g. 28th of each month' },
      { name: 'secondarySource', label: 'Secondary source of repayment', type: 'text' },
      { name: 'provider', label: 'Bank / mobile money provider', type: 'text' },
      { name: 'accountName', label: 'Account / wallet name', type: 'text' },
    ],
  },
  {
    id: 'security',
    number: 6,
    title: 'Guarantor & Collateral',
    description: 'Only complete if a guarantor or security is required or offered.',
    fields: [
      { name: 'hasGuarantor', label: 'Are you proposing a guarantor?', type: 'radio', options: ['No', 'Yes'], required: true, full: true },
      { name: 'gFullName', label: 'Guarantor full name', type: 'text', required: true, showIf: (d) => d.hasGuarantor === 'Yes' },
      {
        name: 'gNationalId',
        label: 'Guarantor National ID / Passport number',
        type: 'text',
        required: true,
        uppercase: true,
        hint: ID_HINT,
        showIf: (d) => d.hasGuarantor === 'Yes',
        validate: (v, d) =>
          validateIdOrPassport(v) ??
          (normaliseId(v) === normaliseId((d.nationalId as string) ?? '')
            ? 'The guarantor must be a different person from the applicant.'
            : undefined),
      },
      { name: 'gRelationship', label: 'Relationship to applicant', type: 'text', showIf: (d) => d.hasGuarantor === 'Yes' },
      {
        name: 'gContact',
        label: 'Guarantor mobile telephone / email',
        type: 'text',
        required: true,
        placeholder: '078 123 4567 or name@example.com',
        showIf: (d) => d.hasGuarantor === 'Yes',
        validate: (v, d) => {
          if (v.includes('@')) return EMAIL_RE.test(v.trim()) ? undefined : 'Please enter a valid email address.';
          return (
            validatePhone(v, { allowLandline: true }) ??
            (sameNumber(v, d.mobile as string) ? 'Please give the guarantor’s own number, not yours.' : undefined)
          );
        },
      },
      { name: 'gOccupation', label: 'Employer / business and occupation', type: 'text', showIf: (d) => d.hasGuarantor === 'Yes' },
      { name: 'gIncome', label: 'Guarantor monthly net income (RWF)', type: 'money', showIf: (d) => d.hasGuarantor === 'Yes' },
      { name: 'gAddress', label: 'Guarantor residential address', type: 'text', showIf: (d) => d.hasGuarantor === 'Yes' },
      { name: 'gGuarantee', label: 'Nature and limit of guarantee (if agreed)', type: 'text', showIf: (d) => d.hasGuarantor === 'Yes' },
      {
        name: 'hasCollateral',
        label: 'Are you offering collateral / security?',
        type: 'radio',
        options: ['No', 'Yes'],
        required: true,
        full: true,
      },
      {
        name: 'collateral',
        label: 'Collateral / security offered',
        type: 'table',
        full: true,
        showIf: (d) => d.hasCollateral === 'Yes',
        columns: [
          { name: 'description', label: 'Asset / security description' },
          { name: 'owner', label: 'Owner and ID' },
          { name: 'value', label: 'Estimated value (RWF)', money: true },
          { name: 'documents', label: 'Documents / location' },
        ],
      },
      { name: 'pledged', label: 'Is the asset already pledged / mortgaged?', type: 'radio', options: ['No', 'Yes'], showIf: (d) => d.hasCollateral === 'Yes' },
      { name: 'pledgedDetails', label: 'Please give details', type: 'text', showIf: (d) => d.hasCollateral === 'Yes' && d.pledged === 'Yes' },
      { name: 'otherSecurity', label: 'Other security proposed', type: 'text', full: true },
    ],
  },
  {
    id: 'declaration',
    number: 7,
    title: 'Documents & Declaration',
    description: 'Confirm the documents you can provide, then review and sign the declaration.',
    fields: [
      {
        name: 'documents',
        label: 'Documents I can provide',
        type: 'checks',
        full: true,
        hint: 'Our team will contact you to collect copies. Submitting an application does not guarantee approval.',
        options: [
          'National ID / passport copy',
          'Recent passport-size photo (if requested)',
          'Proof of residence',
          'Recent payslips / employment letter',
          'Bank or mobile money statements',
          'Business registration / TIN (business loan)',
          'Cash-flow / sales records',
          'Existing loan statements',
          'Collateral ownership / valuation documents',
          'Guarantor ID and income evidence',
        ],
      },
      { name: 'documentsOther', label: 'Other supporting documents', type: 'text', full: true },
      { name: 'consent', label: 'I have read and agree to all the declarations above', type: 'consent', required: true, full: true },
      {
        name: 'signatureName',
        label: 'Applicant full name (electronic signature)',
        type: 'text',
        required: true,
        hint: 'Type your full name exactly as entered in Section 2.',
        validate: (v, d) =>
          normaliseName(v) === normaliseName((d.fullName as string) ?? '')
            ? undefined
            : 'This must match the full name you entered in Section 2.',
      },
      {
        name: 'signatureId',
        label: 'National ID / Passport number',
        type: 'text',
        required: true,
        uppercase: true,
        validate: (v, d) =>
          validateIdOrPassport(v) ??
          (normaliseId(v) === normaliseId((d.nationalId as string) ?? '')
            ? undefined
            : 'This must match the ID / passport number you entered in Section 2.'),
      },
    ],
  },
];

export const INITIAL_DATA: ApplicationData = {
  existingLoans: [],
  collateral: [],
  documents: [],
  consent: false,
};

export const visibleSteps = (d: ApplicationData) => STEPS.filter((s) => !s.showIf || s.showIf(d));
export const visibleFields = (step: Step, d: ApplicationData) =>
  step.fields.filter((f) => !f.showIf || f.showIf(d));

const isEmpty = (v: Value | undefined) =>
  v === undefined || v === '' || v === false || (Array.isArray(v) && v.length === 0);

export function validateStep(step: Step, d: ApplicationData): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of visibleFields(step, d)) {
    const v = d[f.name];
    if (f.required && isEmpty(v)) {
      errors[f.name] =
        f.type === 'consent' ? 'Please agree to the declarations to submit.' : 'This field is required.';
      continue;
    }
    if (isEmpty(v)) continue;
    if (f.type === 'email' && !EMAIL_RE.test((v as string).trim())) {
      errors[f.name] = 'Please enter a valid email address.';
    }
    if (f.type === 'tel' && !f.validate) {
      const phoneError = validatePhone(v as string, { allowLandline: true });
      if (phoneError) errors[f.name] = phoneError;
    }
    if (f.validate && typeof v === 'string') {
      const customError = f.validate(v, d);
      if (customError) errors[f.name] = customError;
    }
    if ((f.type === 'number' || f.type === 'money') && f.name === 'termMonths' && Number(v) < 1) {
      errors[f.name] = 'Please enter at least 1 month.';
    }
  }
  return errors;
}

export const formatRwf = (digits: string) =>
  digits ? `RWF ${Number(digits).toLocaleString('en-US')}` : '';

/** Turns the answers into readable "Section — Label: value" pairs for the email. */
export function toSubmission(d: ApplicationData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const step of visibleSteps(d)) {
    for (const f of visibleFields(step, d)) {
      const v = d[f.name];
      if (isEmpty(v)) continue;
      const key = `${step.number}. ${step.title}: ${f.label}`;
      if (f.type === 'table') {
        out[key] = (v as Row[])
          .map((row, i) =>
            `#${i + 1}: ` +
            (f.columns ?? [])
              .map((c) => `${c.label}: ${(c.money ? formatRwf(row[c.name] ?? '') : row[c.name]) || 'Not provided'}`)
              .join('; '),
          )
          .join('\n');
      } else if (f.type === 'checks') {
        out[key] = (v as string[]).join(', ');
      } else if (f.type === 'consent') {
        out[key] = 'Agreed to declarations 1 to 5';
      } else if (f.type === 'money') {
        out[key] = formatRwf(v as string);
      } else {
        out[key] = String(v);
      }
    }
  }
  return out;
}

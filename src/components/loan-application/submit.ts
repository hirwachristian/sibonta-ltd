import { COMPANY_CONTACT } from '../../data/sibontaData';

/**
 * Where completed applications are sent.
 *
 * Default: FormSubmit (https://formsubmit.co), which emails each application to the
 * company inbox with no server needed. The very first submission triggers a one-time
 * activation email to that inbox — click the link in it and every later application
 * is delivered.
 *
 * To use a different service or your own server, set VITE_LOAN_APPLICATION_ENDPOINT
 * in a .env file to a URL that accepts a JSON POST.
 */

export const COMPANY_EMAIL = COMPANY_CONTACT.email;
export const COMPANY_PHONE = COMPANY_CONTACT.phone;

const ENDPOINT =
  (import.meta.env.VITE_LOAN_APPLICATION_ENDPOINT as string | undefined) ||
  `https://formsubmit.co/ajax/${COMPANY_EMAIL}`;

export async function submitLoanApplication(
  reference: string,
  answers: Record<string, string>,
  applicantName: string,
  applicantEmail?: string,
): Promise<void> {
  const payload: Record<string, string> = {
    _subject: `New loan application ${reference}: ${applicantName}`,
    _template: 'table',
    _captcha: 'false',
    'Application reference': reference,
    'Date received': new Date().toLocaleString('en-GB', { timeZone: 'Africa/Kigali' }),
    ...answers,
  };
  if (applicantEmail) payload._replyto = applicantEmail;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  let body: { success?: string | boolean; message?: string } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || body.success === false || body.success === 'false') {
    throw new Error(body.message || `Submission failed (${res.status})`);
  }
}

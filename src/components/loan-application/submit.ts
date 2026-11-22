import { COMPANY_CONTACT } from '../../data/sibontaData';

/**
 * Sends a completed loan application to our Vercel function (/api/loan-application),
 * which emails it to the company inbox through Brevo and sends the applicant a confirmation.
 * The Brevo API key lives only on the server (Vercel environment variables), never in this code.
 */

export const COMPANY_EMAIL = COMPANY_CONTACT.email;
export const COMPANY_PHONE = COMPANY_CONTACT.phone;

export async function submitLoanApplication(
  reference: string,
  answers: Record<string, string>,
  applicantName: string,
  applicantEmail?: string,
  website = '',
): Promise<void> {
  const res = await fetch('/api/loan-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ reference, answers, applicantName, applicantEmail, website }),
  });

  let body: { ok?: boolean; error?: string } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Submission failed (${res.status})`);
  }
}

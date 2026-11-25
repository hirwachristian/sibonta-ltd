import {
  COMPANY_INBOX,
  EMAIL_RE,
  SEND_CONFIRMATIONS,
  answersSections,
  answersText,
  button,
  cleanAnswers,
  emailLayout,
  escapeHtml,
  json,
  keyFacts,
  paragraph,
  pick,
  sendEmail,
} from './_lib/brevo.js';
import { buildApplicationPdf } from './_lib/applicationPdf.js';

/** Receives a completed loan application and emails it to the company inbox via Brevo. */
export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid request.' });
  }

  // Hidden "website" field: real people never fill it, spam bots usually do.
  if (typeof body.website === 'string' && body.website.trim()) return json(200, { ok: true });

  const reference = typeof body.reference === 'string' ? body.reference.slice(0, 40) : '';
  const applicantName = typeof body.applicantName === 'string' ? body.applicantName.slice(0, 120).trim() : '';
  const applicantEmail = typeof body.applicantEmail === 'string' ? body.applicantEmail.trim().slice(0, 200) : '';
  const answers = cleanAnswers(body.answers);
  if (!reference || !applicantName || !answers) {
    return json(400, { ok: false, error: 'The application is incomplete.' });
  }
  const hasEmail = EMAIL_RE.test(applicantEmail);
  const received = new Date().toLocaleString('en-GB', {
    timeZone: 'Africa/Kigali',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isQuick = body.formType === 'quick';
  const formName = isQuick ? 'Quick Loan Application' : 'Full Loan Application';
  const kind = isQuick ? 'quick loan application' : 'loan application';

  const purpose = pick(answers, 'Loan Request: If other') || pick(answers, 'Loan Request: Purpose');
  const product = isQuick ? `Quick loan${purpose ? ` (${purpose})` : ''}` : pick(answers, 'Loan product');
  const amount = pick(answers, 'Amount requested');
  const term = isQuick ? pick(answers, 'Preferred repayment period') : pick(answers, 'Requested loan term');
  const mobile = pick(answers, isQuick ? 'Mobile number' : 'Mobile telephone');
  const netIncome = pick(answers, isQuick ? 'Main monthly income' : 'Net monthly salary');
  const employment = pick(answers, isQuick ? 'Personal Information: Employment' : 'Employment type');
  const business = isQuick ? pick(answers, 'Employer / business name') : pick(answers, 'Registered business name');
  const capacity = isQuick ? pick(answers, 'Expected monthly repayment capacity') : '';
  const contactMethod = isQuick ? pick(answers, 'Preferred contact method') : '';

  const facts: [string, string][] = [
    ['Application form', formName],
    ['Loan product', product],
    ['Amount requested', amount],
    ['Repayment period', isQuick ? term : term ? `${term} months` : ''],
    ['Mobile', mobile],
    ['Preferred contact', contactMethod],
    ['Email', hasEmail ? applicantEmail : ''],
    [isQuick ? 'Main monthly income' : 'Net monthly income', netIncome],
    ['Repayment capacity', capacity],
    ['Employment', employment],
    [isQuick ? 'Employer / business' : 'Business', business],
  ];

  // PDF copy of the application for the team to download, print and file.
  // If it ever fails, the email still goes out with all answers in the body.
  let attachments: { name: string; content: string }[] | undefined;
  try {
    const pdfBytes = await buildApplicationPdf({
      reference,
      formName,
      applicantName,
      received,
      keyFacts: facts,
      answers,
      eSignature: pick(answers, 'electronic signature') || pick(answers, 'Signature (type'),
      signedOn: pick(answers, 'Declaration: Date') || received.split(',')[0],
    });
    const safeName = applicantName.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'applicant';
    attachments = [{ name: `${reference}-${safeName}.pdf`, content: Buffer.from(pdfBytes).toString('base64') }];
  } catch (err) {
    console.error('loan-application: PDF failed', err);
  }

  // 1. Application to the SIBONTA team
  try {
    await sendEmail({
      to: [{ email: COMPANY_INBOX, name: 'SIBONTA Finance Ltd' }],
      replyTo: hasEmail ? { email: applicantEmail, name: applicantName } : undefined,
      subject: `New ${kind} ${reference}: ${applicantName}${amount ? `, ${amount}` : ''}`,
      tags: ['loan-application'],
      attachments,
      html: emailLayout({
        preheader: `${applicantName} applied for ${product || 'a loan'}${amount ? ` (${amount})` : ''}.`,
        eyebrow: `New ${kind}`,
        title: `${reference} · ${applicantName}`,
        intro: `Received ${escapeHtml(received)} (Kigali time) through the website.${
          attachments ? ' The full application is attached as a PDF to download, print or file.' : ''
        }${
          hasEmail ? ' Reply to this email to contact the applicant directly.' : ''
        }`,
        body:
          keyFacts(facts) +
          (mobile ? button(`Call ${applicantName.split(' ')[0]}`, `tel:${mobile.replace(/[^\d+]/g, '')}`) : '') +
          answersSections(answers),
        footnote:
          'Confidential: this email contains personal and financial information. Store and share it only as permitted by applicable data protection rules.',
      }),
      text: `New ${kind} ${reference} (${formName})\nApplicant: ${applicantName}\nReceived: ${received} (Kigali time)\n\n${answersText(answers)}`,
    });
  } catch (err) {
    console.error('loan-application: company email failed', err);
    return json(502, { ok: false, error: 'We could not send your application. Please try again.' });
  }

  // 2. Confirmation to the applicant (best effort; never blocks the application)
  if (SEND_CONFIRMATIONS && hasEmail) {
    const firstName = applicantName.split(' ')[0];
    try {
      await sendEmail({
        to: [{ email: applicantEmail, name: applicantName }],
        replyTo: { email: COMPANY_INBOX, name: 'SIBONTA Finance Ltd' },
        subject: `We received your loan application (${reference})`,
        tags: ['loan-application-confirmation'],
        html: emailLayout({
          preheader: `Your application reference is ${reference}. A loan officer will contact you soon.`,
          eyebrow: 'Application received',
          title: `Thank you, ${firstName}`,
          intro: 'Your loan application has been received by SIBONTA Finance Ltd.',
          body:
            keyFacts([
              ['Reference', reference],
              ['Loan product', product],
              ['Amount requested', amount],
              ['Received', `${received} (Kigali time)`],
            ]) +
            `<div style="margin-top:24px;font-size:15px;font-weight:bold;color:#082E43">What happens next</div>
             <ol style="margin:10px 0 0;padding-left:20px;font-size:15px;line-height:1.7;color:#1E293B">
               <li>A loan officer reviews your application.</li>
               <li>We contact you to discuss it and collect your supporting documents.</li>
               <li>You receive a clear decision and, if approved, your loan offer and Key Facts Statement.</li>
             </ol>` +
            `<div style="margin-top:20px">${paragraph(
              `Please quote your reference <strong style="color:#082E43">${escapeHtml(reference)}</strong> whenever you contact us.`,
            )}</div>` +
            button('Call us: +250 781 469 429', 'tel:+250781469429'),
          footnote:
            'You are receiving this email because you applied on the SIBONTA Finance Ltd website. Submitting an application does not guarantee approval. All credit is subject to affordability assessment and applicable lending requirements.',
        }),
        text: `Dear ${applicantName},\n\nThank you. Your loan application has been received by SIBONTA Finance Ltd.\nReference: ${reference}\n\nA loan officer will contact you to discuss next steps and collect your supporting documents.\n\nQuestions? Call +250 781 469 429 or email sibontaf@gmail.com.\n\nSIBONTA Finance Ltd`,
      });
    } catch (err) {
      console.error('loan-application: confirmation email failed', err);
    }
  }

  return json(200, { ok: true });
}

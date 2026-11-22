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
} from './_lib/brevo';

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

  const product = pick(answers, 'Loan product');
  const amount = pick(answers, 'Amount requested');
  const term = pick(answers, 'Requested loan term');
  const mobile = pick(answers, 'Mobile telephone');
  const netIncome = pick(answers, 'Net monthly salary');
  const employment = pick(answers, 'Employment type');
  const business = pick(answers, 'Registered business name');

  // 1. Application to the SIBONTA team
  try {
    await sendEmail({
      to: [{ email: COMPANY_INBOX, name: 'SIBONTA Finance Ltd' }],
      replyTo: hasEmail ? { email: applicantEmail, name: applicantName } : undefined,
      subject: `New loan application ${reference}: ${applicantName}${amount ? `, ${amount}` : ''}`,
      tags: ['loan-application'],
      html: emailLayout({
        preheader: `${applicantName} applied for ${product || 'a loan'}${amount ? ` (${amount})` : ''}.`,
        eyebrow: 'New loan application',
        title: `${reference} · ${applicantName}`,
        intro: `Received ${escapeHtml(received)} (Kigali time) through the website.${
          hasEmail ? ' Reply to this email to contact the applicant directly.' : ''
        }`,
        body:
          keyFacts([
            ['Loan product', product],
            ['Amount requested', amount],
            ['Loan term', term ? `${term} months` : ''],
            ['Mobile', mobile],
            ['Email', hasEmail ? applicantEmail : ''],
            ['Net monthly income', netIncome],
            ['Employment', employment],
            ['Business', business],
          ]) +
          (mobile ? button(`Call ${applicantName.split(' ')[0]}`, `tel:${mobile.replace(/[^\d+]/g, '')}`) : '') +
          answersSections(answers),
        footnote:
          'Confidential: this email contains personal and financial information. Store and share it only as permitted by applicable data protection rules.',
      }),
      text: `New loan application ${reference}\nApplicant: ${applicantName}\nReceived: ${received} (Kigali time)\n\n${answersText(answers)}`,
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

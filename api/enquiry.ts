import {
  COMPANY_INBOX,
  EMAIL_RE,
  SEND_CONFIRMATIONS,
  answersSections,
  answersText,
  button,
  emailLayout,
  escapeHtml,
  json,
  keyFacts,
  paragraph,
  sendEmail,
} from './_lib/brevo.js';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Receives a consultation enquiry and emails it to the company inbox via Brevo. */
export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid request.' });
  }

  if (str(body.website, 200)) return json(200, { ok: true }); // spam bot trap

  const reference = str(body.reference, 40);
  const fullName = str(body.fullName, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 30);
  const customerGroup = str(body.customerGroup, 80);
  const service = str(body.service, 120);
  const notes = str(body.notes, 3000);

  if (!reference || fullName.length < 2 || !EMAIL_RE.test(email) || phone.replace(/\D/g, '').length < 9 || !service) {
    return json(400, { ok: false, error: 'Please complete all required fields.' });
  }

  const received = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Kigali', dateStyle: 'medium', timeStyle: 'short' });
  const answers = {
    'Enquiry details: Full name / business': fullName,
    'Enquiry details: Email': email,
    'Enquiry details: Phone': phone,
    'Enquiry details: Customer profile': customerGroup || 'Not provided',
    'Enquiry details: Product or service of interest': service,
    'Enquiry details: Goals or financing summary': notes || 'Not provided',
  };

  try {
    await sendEmail({
      to: [{ email: COMPANY_INBOX, name: 'SIBONTA Finance Ltd' }],
      replyTo: { email, name: fullName },
      subject: `New enquiry ${reference}: ${fullName}, ${service}`,
      tags: ['enquiry'],
      html: emailLayout({
        preheader: `${fullName} asked about ${service}.`,
        eyebrow: 'New consultation enquiry',
        title: `${reference} · ${fullName}`,
        intro: `Received ${escapeHtml(received)} (Kigali time). Reply to this email to contact the customer directly.`,
        body:
          keyFacts([
            ['Interested in', service],
            ['Customer profile', customerGroup],
            ['Phone', phone],
            ['Email', email],
          ]) +
          button(`Call ${fullName.split(' ')[0]}`, `tel:${phone.replace(/[^\d+]/g, '')}`) +
          answersSections(answers),
        footnote: 'Confidential: this email contains personal information.',
      }),
      text: `New consultation enquiry ${reference}\nReceived: ${received} (Kigali time)\n\n${answersText(answers)}`,
    });
  } catch (err) {
    console.error('enquiry: company email failed', err);
    return json(502, { ok: false, error: 'We could not send your enquiry. Please try again.' });
  }

  if (SEND_CONFIRMATIONS) {
    const firstName = fullName.split(' ')[0];
    try {
      await sendEmail({
        to: [{ email, name: fullName }],
        replyTo: { email: COMPANY_INBOX, name: 'SIBONTA Finance Ltd' },
        subject: `We received your enquiry (${reference})`,
        tags: ['enquiry-confirmation'],
        html: emailLayout({
          preheader: `An advisor will contact you shortly. Reference ${reference}.`,
          eyebrow: 'Enquiry received',
          title: `Thank you, ${firstName}`,
          intro: `Thank you for your interest in <strong>${escapeHtml(service)}</strong>.`,
          body:
            paragraph('An advisor from SIBONTA Finance Ltd will contact you shortly to discuss your needs.') +
            keyFacts([
              ['Reference', reference],
              ['Service', service],
              ['Received', `${received} (Kigali time)`],
            ]) +
            button('Call us: +250 781 469 429', 'tel:+250781469429'),
          footnote: 'You are receiving this email because you sent an enquiry on the SIBONTA Finance Ltd website.',
        }),
        text: `Dear ${fullName},\n\nThank you for your interest in ${service}. An advisor from SIBONTA Finance Ltd will contact you shortly.\nReference: ${reference}\n\nQuestions? Call +250 781 469 429.\n\nSIBONTA Finance Ltd`,
      });
    } catch (err) {
      console.error('enquiry: confirmation email failed', err);
    }
  }

  return json(200, { ok: true });
}

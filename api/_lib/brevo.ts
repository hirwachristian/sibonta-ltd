/**
 * Server-side helpers for sending email through Brevo (runs on Vercel, never in the browser).
 *
 * Required environment variables (Vercel → Project → Settings → Environment Variables):
 *   BREVO_API_KEY       Brevo API key (SMTP & API → API keys)
 *   BREVO_SENDER_EMAIL  A sender address verified in Brevo (Senders, Domains & Dedicated IPs)
 * Optional:
 *   BREVO_SENDER_NAME   Name shown as the sender (default "SIBONTA Finance Ltd")
 *   COMPANY_INBOX       Where enquiries and applications are delivered (default sibontaf@gmail.com)
 *   SEND_CONFIRMATIONS  "false" to stop the automatic "we received it" email to customers
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

export const COMPANY_INBOX = process.env.COMPANY_INBOX || 'sibontaf@gmail.com';
export const SEND_CONFIRMATIONS = process.env.SEND_CONFIRMATIONS !== 'false';

/** Public address of the website, used for the logo in emails. */
const SITE_URL = (process.env.SITE_URL || 'https://www.sibontafinance.com').replace(/\/$/, '');
/** PNG works in every mail app (Gmail, Outlook, Apple Mail). Override with EMAIL_LOGO_URL if needed. */
const LOGO_URL = process.env.EMAIL_LOGO_URL || `${SITE_URL}/images/email-logo.png`;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Brand colours
const INK = '#082E43';
const ICE = '#C9DFEA';
const ICE_SOFT = '#F4F8FB';
const IVORY = '#FFFDF7';
const GOLD = '#C27803';
const SLATE = '#475569';
const LINE = '#E2E8F0';
const FONT = "'Segoe UI', Helvetica, Arial, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface Recipient {
  email: string;
  name?: string;
}

export async function sendEmail(opts: {
  to: Recipient[];
  subject: string;
  html: string;
  text: string;
  replyTo?: Recipient;
  tags?: string[];
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    throw new Error('Email is not configured (BREVO_API_KEY / BREVO_SENDER_EMAIL missing).');
  }

  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || 'SIBONTA Finance Ltd' },
      to: opts.to,
      replyTo: opts.replyTo,
      subject: opts.subject,
      htmlContent: opts.html,
      textContent: opts.text,
      tags: opts.tags,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo rejected the email (${res.status}): ${detail.slice(0, 300)}`);
  }
}

/* ------------------------------------------------------------------ */
/* Email building blocks (table-based HTML so it renders in Gmail,     */
/* Outlook and phone mail apps)                                        */
/* ------------------------------------------------------------------ */

interface LayoutOptions {
  /** Short line shown in the inbox preview, next to the subject. */
  preheader: string;
  /** Small gold label above the title, e.g. "Loan application". */
  eyebrow: string;
  title: string;
  /** Optional short paragraph under the title. */
  intro?: string;
  body: string;
  /** Small print at the very bottom. */
  footnote?: string;
}

export function emailLayout({ preheader, eyebrow, title, intro, body, footnote }: LayoutOptions): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${escapeHtml(title)}</title>
<style>
  @media (max-width: 480px) {
    .outer { padding: 16px 6px !important; }
    .pad { padding-left: 18px !important; padding-right: 18px !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:${ICE_SOFT};font-family:${FONT};color:#0F172A;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ICE_SOFT}">
<tr><td align="center" class="outer" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px">

    <!-- Brand header -->
    <tr><td class="pad" style="background:${INK};border-radius:14px 14px 0 0;padding:22px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="64" style="width:64px;vertical-align:middle;line-height:0">
          <img src="${LOGO_URL}" width="64" height="64" alt="SIBONTA Finance Ltd logo" style="display:block;width:64px;height:64px;border:0;outline:none;text-decoration:none">
        </td>
        <td style="padding-left:14px;vertical-align:middle">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:bold;color:${IVORY};letter-spacing:.2px;line-height:1.2">SIBONTA Finance Ltd</div>
          <div style="margin-top:3px;font-size:12px;color:${ICE}">Finance Today &bull; Better Tomorrow</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="height:4px;background:${GOLD};font-size:0;line-height:0">&nbsp;</td></tr>

    <!-- Body -->
    <tr><td class="pad" style="background:${IVORY};padding:30px 28px 8px;border-left:1px solid ${LINE};border-right:1px solid ${LINE}">
      <div style="font-size:12px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${GOLD}">${escapeHtml(eyebrow)}</div>
      <h1 style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:${INK}">${escapeHtml(title)}</h1>
      ${intro ? `<p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:${SLATE}">${intro}</p>` : ''}
    </td></tr>
    <tr><td class="pad" style="background:${IVORY};padding:18px 28px 28px;border-left:1px solid ${LINE};border-right:1px solid ${LINE}">
      ${body}
    </td></tr>

    <!-- Footer -->
    <tr><td class="pad" style="background:${INK};border-radius:0 0 14px 14px;padding:20px 28px;font-size:12px;line-height:1.7;color:${ICE}">
      <strong style="color:${IVORY}">SIBONTA Finance Ltd</strong><br>
      Diamond House, 2nd Floor, Gatenga, Kicukiro District, Kigali, Rwanda<br>
      +250 781 469 429 &nbsp;&middot;&nbsp; sibontaf@gmail.com
    </td></tr>
    ${footnote ? `<tr><td style="padding:14px 8px 0;font-size:11px;line-height:1.6;color:#64748B;text-align:center">${footnote}</td></tr>` : ''}

  </table>
</td></tr></table>
</body></html>`;
}

/** Highlighted summary box: the facts a loan officer needs at a glance. */
export function keyFacts(rows: [string, string][]): string {
  const cells = rows
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `<tr>
        <td style="padding:7px 0;font-size:13px;color:${SLATE};width:38%;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:7px 0;font-size:14px;font-weight:bold;color:${INK};vertical-align:top;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ICE_SOFT};border:1px solid ${ICE};border-left:4px solid ${INK};border-radius:10px">
    <tr><td style="padding:14px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cells}</table></td></tr>
  </table>`;
}

/** Splits "Section: Field" labels into ordered sections. */
function groupAnswers(answers: Record<string, string>): { section: string; rows: [string, string][] }[] {
  const groups: { section: string; rows: [string, string][] }[] = [];
  for (const [rawLabel, value] of Object.entries(answers)) {
    const split = rawLabel.indexOf(': ');
    const section = split > 0 ? rawLabel.slice(0, split) : 'Details';
    const label = split > 0 ? rawLabel.slice(split + 2) : rawLabel;
    let g = groups[groups.length - 1];
    if (!g || g.section !== section) {
      g = { section, rows: [] };
      groups.push(g);
    }
    g.rows.push([label, value]);
  }
  return groups;
}

/** All answers, grouped under section headings, in a clean two-column layout. */
export function answersSections(answers: Record<string, string>): string {
  return groupAnswers(answers)
    .map(({ section, rows }) => {
      const body = rows
        .map(
          ([label, value], i) => `<tr style="background:${i % 2 ? IVORY : '#FBFAF4'}">
            <td style="padding:9px 12px;font-size:13px;color:${SLATE};width:44%;vertical-align:top;border-top:1px solid ${LINE}">${escapeHtml(label)}</td>
            <td style="padding:9px 12px;font-size:14px;color:#0F172A;vertical-align:top;border-top:1px solid ${LINE};white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(value)}</td>
          </tr>`,
        )
        .join('');
      return `<div style="margin-top:26px">
        <div style="font-size:13px;font-weight:bold;color:${INK};padding-bottom:8px;border-bottom:2px solid ${GOLD}">${escapeHtml(section)}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${body}</table>
      </div>`;
    })
    .join('');
}

/** Plain-text version of the answers (improves deliverability and shows in basic mail apps). */
export function answersText(answers: Record<string, string>): string {
  return groupAnswers(answers)
    .map(({ section, rows }) => `${section.toUpperCase()}\n${rows.map(([l, v]) => `- ${l}: ${v}`).join('\n')}`)
    .join('\n\n');
}

/** A call-to-action button that works in all mail apps. */
export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr>
    <td style="background:${INK};border-radius:8px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:bold;color:${IVORY};text-decoration:none">${escapeHtml(label)}</a></td>
  </tr></table>`;
}

export const paragraph = (html: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#1E293B">${html}</p>`;

/** Finds the first answer whose label contains `needle` (case-insensitive). */
export function pick(answers: Record<string, string>, needle: string): string {
  const n = needle.toLowerCase();
  const key = Object.keys(answers).find((k) => k.toLowerCase().includes(n));
  return key ? answers[key] : '';
}

/** Validates a JSON object of string→string with sensible size limits. */
export function cleanAnswers(input: unknown, maxFields = 150, maxLength = 4000): Record<string, string> | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0 || entries.length > maxFields) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of entries) {
    if (typeof v !== 'string' || k.length > 300) return null;
    out[k] = v.slice(0, maxLength);
  }
  return out;
}

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

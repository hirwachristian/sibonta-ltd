/**
 * Builds a branded A4 PDF of a loan application, attached to the email the SIBONTA team receives.
 * Uses pdf-lib (pure JavaScript), so it runs inside a Vercel function with no browser.
 */
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { groupAnswers } from './brevo.js';
import { LOGO_PNG_BASE64 } from './logo.js';

const hex = (h: string) =>
  rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

const INK = hex('#082E43');
const ICE = hex('#C9DFEA');
const ICE_SOFT = hex('#F4F8FB');
const IVORY = hex('#FFFDF7');
const ZEBRA = hex('#FBFAF4');
const GOLD = hex('#C27803');
const SLATE = hex('#475569');
const MUTED = hex('#64748B');
const LINE = hex('#E2E8F0');
const TEXT = hex('#0F172A');
const WHITE = rgb(1, 1, 1);

// A4 in points
const W = 595.28;
const H = 841.89;
const M = 42; // side margin
const CONTENT_W = W - M * 2;
const FOOTER_TOP = 58; // content must stay above this
const LABEL_W = CONTENT_W * 0.4;

export interface ApplicationPdfInput {
  reference: string;
  formName: string;
  applicantName: string;
  received: string;
  keyFacts: [string, string][];
  answers: Record<string, string>;
  /** Name the applicant typed as their electronic signature, and the date they signed. */
  eSignature?: string;
  signedOn?: string;
}

/**
 * The built-in PDF fonts only cover Western European characters (WinAnsi).
 * Keep those, strip accents from anything else, and replace what remains.
 */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');
function safe(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, ' ')
    .split('')
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (ch === '\n' || (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || WIN_ANSI_EXTRA.has(ch)) return ch;
      const base = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
      return base && [...base].every((b) => b.charCodeAt(0) >= 0x20 && b.charCodeAt(0) <= 0x7e) ? base : '?';
    })
    .join('');
}

/** Splits text into lines that fit `maxWidth`, keeping the user's own line breaks. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of safe(text).split('\n')) {
    let line = '';
    for (const word of para.split(/ +/)) {
      const attempt = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(attempt, size) <= maxWidth) {
        line = attempt;
        continue;
      }
      if (line) lines.push(line);
      // A single word longer than the column (an email, a long number) is broken by character.
      line = '';
      for (const ch of word) {
        if (font.widthOfTextAtSize(line + ch, size) > maxWidth && line) {
          lines.push(line);
          line = ch;
        } else line += ch;
      }
    }
    lines.push(line);
  }
  return lines.length ? lines : [''];
}

export async function buildApplicationPdf(input: ApplicationPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${input.formName} ${input.reference} - ${safe(input.applicantName)}`);
  pdf.setAuthor('SIBONTA Finance Ltd');
  pdf.setSubject(input.formName);
  pdf.setCreator('www.sibontafinance.com');
  pdf.setProducer('SIBONTA Finance Ltd website');

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const logo = await pdf.embedPng(LOGO_PNG_BASE64);

  let page!: PDFPage;
  let y = 0;

  const text = (s: string, x: number, yy: number, font: PDFFont, size: number, color = TEXT) =>
    page.drawText(safe(s), { x, y: yy, font, size, color });
  const rightText = (s: string, xRight: number, yy: number, font: PDFFont, size: number, color = TEXT) =>
    text(s, xRight - font.widthOfTextAtSize(safe(s), size), yy, font, size, color);

  /** Full header on page 1, a slim one on later pages. */
  function newPage(first: boolean) {
    page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
    const bandH = first ? 96 : 40;
    page.drawRectangle({ x: 0, y: H - bandH, width: W, height: bandH, color: INK });
    page.drawRectangle({ x: 0, y: H - bandH - 3, width: W, height: 3, color: GOLD });
    if (first) {
      page.drawRectangle({ x: M, y: H - 78, width: 60, height: 60, color: WHITE });
      page.drawImage(logo, { x: M + 2, y: H - 76, width: 56, height: 56 });
      text('SIBONTA Finance Ltd', M + 74, H - 46, serif, 19, IVORY);
      text('Finance Today  •  Better Tomorrow', M + 74, H - 62, regular, 9, ICE);
      rightText('APPLICATION REFERENCE', W - M, H - 40, bold, 7.5, ICE);
      rightText(input.reference, W - M, H - 57, bold, 14, hex('#EAB308'));
      rightText('Submitted online', W - M, H - 71, regular, 8.5, ICE);
      y = H - bandH - 34;
    } else {
      text('SIBONTA Finance Ltd', M, H - 25, serif, 12, IVORY);
      rightText(`${input.formName}  •  ${input.reference}  •  ${input.applicantName}`, W - M, H - 24, regular, 8.5, ICE);
      y = H - bandH - 28;
    }
  }

  /** Starts a new page if `needed` points would run into the footer. */
  function ensure(needed: number, continued?: string) {
    if (y - needed >= FOOTER_TOP) return;
    newPage(false);
    if (continued) sectionHeading(`${continued} (continued)`);
  }

  function sectionHeading(title: string) {
    text(title, M, y, bold, 11, INK);
    page.drawRectangle({ x: M, y: y - 7, width: CONTENT_W, height: 1.5, color: GOLD });
    y -= 13;
  }

  // ---- Page 1: title and summary --------------------------------------------------------------
  newPage(true);
  text(input.formName, M, y, serif, 21, INK);
  y -= 18;
  text(`${input.applicantName}  •  Received ${input.received} (Kigali time)`, M, y, regular, 9.5, SLATE);
  y -= 22;

  // Key facts: two columns of label / value inside a tinted box
  const facts = input.keyFacts.filter(([, v]) => v);
  if (facts.length) {
    const colW = (CONTENT_W - 28 - 20) / 2;
    const cells = facts.map(([label, value]) => ({ label, lines: wrap(value, bold, 10, colW) }));
    const rows: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 2) rows.push(cells.slice(i, i + 2));
    const rowH = (r: typeof cells) => 12 + Math.max(...r.map((c) => c.lines.length)) * 12.5 + 6;
    const boxH = rows.reduce((sum, r) => sum + rowH(r), 0) + 30;
    page.drawRectangle({ x: M, y: y - boxH, width: CONTENT_W, height: boxH, color: ICE_SOFT, borderColor: ICE, borderWidth: 0.8 });
    page.drawRectangle({ x: M, y: y - boxH, width: 4, height: boxH, color: INK });
    text('AT A GLANCE', M + 18, y - 16, bold, 7.5, GOLD);
    let fy = y - 34;
    for (const r of rows) {
      r.forEach((c, i) => {
        const x = M + 18 + i * (colW + 20);
        text(c.label, x, fy, regular, 8, SLATE);
        c.lines.forEach((ln, j) => text(ln, x, fy - 12.5 - j * 12.5, bold, 10, INK));
      });
      fy -= rowH(r);
    }
    y -= boxH + 26;
  }

  /**
   * Table answers arrive as "#1: Lender: X; Balance: Y" per line. Show each entry as a small
   * heading followed by one "Label: value" per line, so they read like the paper form.
   */
  type Line = { text: string; bold?: boolean; indent: number };
  function valueToLines(value: string, width: number): Line[] {
    if (!/^#\d+: /.test(value)) return wrap(value, regular, 9.5, width).map((t) => ({ text: t, indent: 0 }));
    const lines: Line[] = [];
    for (const entry of value.split('\n')) {
      const m = entry.match(/^#(\d+): (.*)$/);
      if (!m) {
        lines.push(...wrap(entry, regular, 9.5, width).map((t) => ({ text: t, indent: 0 })));
        continue;
      }
      lines.push({ text: `Entry ${m[1]}`, bold: true, indent: 0 });
      for (const part of m[2].split('; ')) {
        lines.push(...wrap(part, regular, 9.5, width - 10).map((t) => ({ text: t, indent: 10 })));
      }
    }
    return lines;
  }

  // ---- All answers, grouped by section --------------------------------------------------------
  const valueW = CONTENT_W - LABEL_W - 16;
  for (const { section, rows } of groupAnswers(input.answers)) {
    ensure(13 + 24, undefined);
    sectionHeading(section);
    rows.forEach(([label, value], i) => {
      const labelLines = wrap(label, regular, 8.5, LABEL_W - 16);
      let rest = valueToLines(value || '-', valueW - 8);
      let labelRest = labelLines;
      // Draw the row; if it is taller than the space left, continue it on the next page.
      while (rest.length) {
        const room = Math.floor((y - FOOTER_TOP - 10) / 12.5);
        const fitsAll = Math.max(labelRest.length * 11, rest.length * 12.5) + 10 <= y - FOOTER_TOP;
        if (!fitsAll && (room < 4 || rest.length <= 6)) {
          ensure(Infinity, section);
          continue;
        }
        const chunk = fitsAll ? rest : rest.slice(0, room);
        const h = Math.max(labelRest.length * 11, chunk.length * 12.5) + 10;
        page.drawRectangle({ x: M, y: y - h, width: CONTENT_W, height: h, color: i % 2 ? WHITE : ZEBRA });
        page.drawLine({ start: { x: M, y: y - h }, end: { x: M + CONTENT_W, y: y - h }, thickness: 0.5, color: LINE });
        labelRest.forEach((ln, j) => text(ln, M + 8, y - 13 - j * 11, regular, 8.5, SLATE));
        chunk.forEach((ln, j) =>
          text(ln.text, M + LABEL_W + ln.indent, y - 13 - j * 12.5, ln.bold ? bold : regular, ln.bold ? 9 : 9.5, ln.bold ? INK : TEXT),
        );
        y -= h;
        rest = rest.slice(chunk.length);
        if (rest.length) {
          labelRest = wrap(`${label} (continued)`, regular, 8.5, LABEL_W - 16);
          ensure(Infinity, section);
        }
      }
    });
    y -= 22;
  }

  // ---- Applicant's signature block ------------------------------------------------------------
  const lineField = (label: string, x: number, yy: number, width: number) => {
    text(label, x, yy, regular, 8.5, SLATE);
    const lx = x + regular.widthOfTextAtSize(safe(label), 8.5) + 6;
    page.drawLine({ start: { x: lx, y: yy - 2 }, end: { x: x + width, y: yy - 2 }, thickness: 0.6, color: MUTED });
  };
  const signH = 128;
  ensure(signH + 10);
  page.drawRectangle({ x: M, y: y - signH, width: CONTENT_W, height: signH, color: ICE_SOFT, borderColor: ICE, borderWidth: 0.8 });
  page.drawRectangle({ x: M, y: y - signH, width: 4, height: signH, color: GOLD });
  text("APPLICANT'S SIGNATURE", M + 18, y - 18, bold, 8, INK);
  text('I confirm that the information in this application is true and complete.', M + 18, y - 33, regular, 8.5, SLATE);
  if (input.eSignature) {
    text('Signed electronically as', M + 18, y - 52, regular, 8.5, SLATE);
    const sx = M + 18 + regular.widthOfTextAtSize('Signed electronically as', 8.5) + 8;
    const sig = wrap(input.eSignature, serif, 12, 230)[0];
    text(sig, sx, y - 53, serif, 12, INK);
    if (input.signedOn) {
      const dx = sx + serif.widthOfTextAtSize(sig, 12) + 14;
      text(`on ${input.signedOn}`, dx, y - 52, regular, 8.5, SLATE);
    }
  }
  // Thumbprint box on the right, signature and date lines on the left
  const thumbW = 74;
  const thumbX = M + CONTENT_W - 14 - thumbW;
  page.drawRectangle({ x: thumbX, y: y - signH + 14, width: thumbW, height: 74, color: WHITE, borderColor: MUTED, borderWidth: 0.6, borderDashArray: [2, 2] });
  const tl = 'Thumbprint';
  text(tl, thumbX + (thumbW - regular.widthOfTextAtSize(tl, 7.5)) / 2, y - signH + 20, regular, 7.5, MUTED);
  const signLineW = thumbX - 20 - (M + 18);
  lineField('Applicant signature', M + 18, y - 84, signLineW);
  lineField('Date', M + 18, y - 110, signLineW * 0.55);
  y -= signH + 18;

  // ---- Office use block -----------------------------------------------------------------------
  const officeH = 118;
  ensure(officeH + 10);
  page.drawRectangle({ x: M, y: y - officeH, width: CONTENT_W, height: officeH, borderColor: SLATE, borderWidth: 0.8, borderDashArray: [3, 2] });
  text('FOR OFFICE USE ONLY', M + 14, y - 18, bold, 8, INK);
  const half = (CONTENT_W - 28 - 24) / 2;
  const c1 = M + 14;
  const c2 = M + 14 + half + 24;
  lineField('Received by', c1, y - 42, half);
  lineField('Date', c2, y - 42, half);
  text('Decision', c1, y - 66, regular, 8.5, SLATE);
  ['Approved', 'Declined', 'More information needed'].reduce((x, opt) => {
    page.drawRectangle({ x, y: y - 68, width: 8, height: 8, borderColor: MUTED, borderWidth: 0.7 });
    text(opt, x + 12, y - 66, regular, 8.5, TEXT);
    return x + 24 + regular.widthOfTextAtSize(opt, 8.5);
  }, c1 + 50);
  lineField('Amount approved (RWF)', c1, y - 92, half);
  lineField('Loan officer signature', c2, y - 92, half);
  y -= officeH;

  // ---- Footer on every page -------------------------------------------------------------------
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 44 }, end: { x: W - M, y: 44 }, thickness: 0.6, color: LINE });
    p.drawText('SIBONTA Finance Ltd  •  Diamond House, 2nd Floor, Gatenga, Kicukiro, Kigali  •  +250 781 469 429  •  sibontaf@gmail.com', {
      x: M, y: 31, font: regular, size: 7.5, color: MUTED,
    });
    p.drawText('Confidential: contains personal and financial information.', { x: M, y: 20, font: regular, size: 7, color: MUTED });
    const label = `Page ${i + 1} of ${pages.length}`;
    p.drawText(label, { x: W - M - bold.widthOfTextAtSize(label, 8), y: 25, font: bold, size: 8, color: INK });
  });

  return pdf.save();
}

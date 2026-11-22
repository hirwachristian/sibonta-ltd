/**
 * Real-world checks for Rwandan phone numbers, National IDs and passports.
 * Each function returns an error message to show the customer, or undefined when the value is valid.
 */

/** Rwanda mobile prefixes after the country code: 78 / 79 (MTN), 72 / 73 (Airtel). */
const RW_MOBILE_PREFIXES = ['72', '73', '78', '79'];

/** Removes spaces, dashes, dots and brackets people type in phone numbers. */
const compactPhone = (value: string) => value.replace(/[\s\-().]/g, '');

/**
 * Returns the 9-digit national part of a Rwandan number, or null if it isn't written as one.
 * Accepts 07XXXXXXXX, 7XXXXXXXX, 2507XXXXXXXX, +2507XXXXXXXX and 002507XXXXXXXX.
 */
function rwandaNationalNumber(value: string): string | null {
  const v = compactPhone(value);
  let m = v.match(/^(?:\+|00)?250(\d{9})$/);
  if (m) return m[1];
  m = v.match(/^0(\d{9})$/);
  if (m) return m[1];
  m = v.match(/^([1-9]\d{8})$/);
  if (m) return m[1];
  return null;
}

interface PhoneOptions {
  /** Also accept Rwandan landlines (numbers starting with 2), e.g. for an alternative phone. */
  allowLandline?: boolean;
}

export function validatePhone(value: string, { allowLandline = false }: PhoneOptions = {}): string | undefined {
  const v = compactPhone(value);
  if (!v) return undefined;

  if (!/^\+?\d+$/.test(v)) {
    return 'Please use numbers only, e.g. 078 123 4567 or +250 78 123 4567.';
  }

  // Foreign number: + followed by another country code
  if ((v.startsWith('+') || v.startsWith('00')) && !/^(?:\+|00)250/.test(v)) {
    const digits = v.replace(/^(\+|00)/, '');
    return digits.length >= 8 && digits.length <= 15
      ? undefined
      : 'Please enter a complete international number, including the country code.';
  }

  const national = rwandaNationalNumber(v);
  if (!national) {
    return 'Rwandan numbers have 10 digits, e.g. 078 123 4567 (or +250 78 123 4567).';
  }
  if (RW_MOBILE_PREFIXES.includes(national.slice(0, 2))) return undefined;
  if (allowLandline && national.startsWith('2')) return undefined;

  return allowLandline
    ? 'Please enter a valid Rwandan mobile (078, 079, 072, 073) or landline number.'
    : 'Please enter a valid Rwandan mobile number starting with 078, 079, 072 or 073.';
}

/** Normalised form used to compare two IDs (no spaces, upper case). */
export const normaliseId = (value: string) => value.replace(/[\s-]/g, '').toUpperCase();

interface IdOptions {
  /** Date of birth (YYYY-MM-DD) to cross-check against the year inside a National ID. */
  dob?: string;
  /** "Female" / "Male" to cross-check against the sex digit inside a National ID. */
  gender?: string;
}

/**
 * Rwandan National ID (16 digits) or passport number (6 to 9 letters and numbers).
 * National ID layout: 1 | YYYY | S | NNNNNNN | F | CC
 *   status (1 Rwandan, 2 refugee, 3 foreign resident) · birth year · sex (8 male, 7 female)
 *   · birth order number · times issued · security code.
 */
export function validateIdOrPassport(value: string, { dob, gender }: IdOptions = {}): string | undefined {
  const id = normaliseId(value);
  if (!id) return undefined;

  if (/^\d+$/.test(id)) {
    if (id.length !== 16) {
      return `A Rwandan National ID has 16 digits (you entered ${id.length}).`;
    }
    if (!['1', '2', '3'].includes(id[0])) {
      return 'This National ID number is not valid. Please check the first digit.';
    }
    const year = Number(id.slice(1, 5));
    const thisYear = new Date().getFullYear();
    if (year < 1900 || year > thisYear - 16) {
      return 'This National ID number is not valid. Please check the year of birth digits.';
    }
    if (!['7', '8'].includes(id[5])) {
      return 'This National ID number is not valid. Please check it against your ID card.';
    }
    if (dob && /^\d{4}/.test(dob) && Number(dob.slice(0, 4)) !== year) {
      return `The year in this ID (${year}) does not match the date of birth entered.`;
    }
    if (gender === 'Male' && id[5] !== '8') {
      return 'This ID belongs to a female holder, but Male was selected. Please check both.';
    }
    if (gender === 'Female' && id[5] !== '7') {
      return 'This ID belongs to a male holder, but Female was selected. Please check both.';
    }
    return undefined;
  }

  if (/^[A-Z0-9]{6,9}$/.test(id) && /[A-Z]/.test(id)) return undefined;

  return 'Enter a 16-digit National ID, or a passport number (6 to 9 letters and numbers).';
}

/** Date of birth: a real past date and at least `minAge` years old. */
export function validateDateOfBirth(value: string, minAge = 18): string | undefined {
  if (!value) return undefined;
  const dob = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return 'Please enter a valid date.';
  const now = new Date();
  if (dob > now) return 'Date of birth cannot be in the future.';
  const age =
    now.getFullYear() - dob.getFullYear() -
    (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
  if (age < minAge) return `Applicants must be at least ${minAge} years old.`;
  if (age > 100) return 'Please check the year of birth.';
  return undefined;
}

export const PHONE_HINT = 'Rwandan mobile, e.g. 078 123 4567 or +250 78 123 4567';
export const ID_HINT = '16-digit National ID, or passport number';

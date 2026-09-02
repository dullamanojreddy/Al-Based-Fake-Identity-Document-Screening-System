import {
  DocumentField,
  DocumentType,
  FieldConsistencyCheck,
  FieldConsistencyResult,
  FindingSeverity,
} from '../types';

const DOC_NUMBER_PATTERNS: Record<string, { pattern: RegExp; description: string }> = {
  passport: {
    pattern: /^[A-Z][A-Z0-9]{6,8}$/,
    description: 'Passport numbers follow ICAO 9303 convention (letter prefix + 6-8 alphanumeric characters).',
  },
  driving_license: {
    pattern: /^[A-Z]{2}[-\s]?\d{2}[-\s]?(?:19|20)\d{2}\d{7,8}$|^[A-Z]{2}[-\s]?\d{3,4}[-\s]?\d{7,8}$/,
    description: 'Driving licence numbers follow the state-code + RTO + serial convention.',
  },
  national_id: {
    pattern: /^[2-9X][0-9X]{3}[\s-]*[0-9X]{4}[\s-]*\d{4}$/i,
    description: 'Aadhaar numbers are 12 digits (first digit 2-9), printed as 4-4-4 groups. UIDAI masked e-Aadhaar (e.g. "XXXX XXXX 1234") is also accepted.',
  },
};

const VERHOEFF_D = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];
const VERHOEFF_P = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
];
const VERHOEFF_INV = [0,4,3,2,1,5,6,7,8,9];

export function generateVerhoeffCheckDigit(baseDigits: string): string {
  const clean = baseDigits.replace(/\D/g, '');
  let c = 0;
  const reversed = clean.split('').reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][parseInt(reversed[i], 10)]];
  }
  return VERHOEFF_INV[c].toString();
}

export function validateVerhoeff(digits: string): boolean {
  const clean = digits.replace(/\D/g, '');
  if (clean.length !== 12) return false;
  let c = 0;
  const reversed = clean.split('').reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][parseInt(reversed[i], 10)]];
  }
  return VERHOEFF_INV[c] === 0;
}

export function parseFlexibleDate(raw: string): Date | null {
  if (!raw) return null;
  const value = raw.trim().toUpperCase();
  let m = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  m = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  m = value.match(/^(\d{1,2})[\s-]([A-Z]{3,9})[\s-](\d{4})$/);
  if (m) {
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const idx = months.indexOf(m[2].slice(0, 3));
    if (idx >= 0) return new Date(parseInt(m[3], 10), idx, parseInt(m[1], 10));
  }
  return null;
}

function addCheck(checks: FieldConsistencyCheck[], ruleId: string, ruleName: string, passed: boolean, severityOnFail: FindingSeverity, passDetails: string, failDetails: string, fieldsInvolved: string[]) {
  checks.push({ ruleId, ruleName, passed, severity: passed ? 'PASS' : severityOnFail, details: passed ? passDetails : failDetails, fieldsInvolved });
}

export function validateFieldConsistency(fields: DocumentField[], documentType: DocumentType): FieldConsistencyResult {
  const checks: FieldConsistencyCheck[] = [];
  const getField = (key: string) => fields.find(f => f.key === key && f.value && f.value.trim().length > 0);
  const dobField = getField('dob');
  const expiryField = getField('expiryDate');
  const issueField = getField('issueDate');
  const docNumField = getField('passportNumber') || getField('aadhaarNumber') || getField('documentNumber');

  const requiredKeys = documentType === 'passport' ? ['passportNumber', 'dob', 'expiryDate'] : documentType === 'national_id' ? ['aadhaarNumber'] : [];
  const missingRequired = requiredKeys.filter(k => !getField(k));
  addCheck(checks, 'FC-01', 'Required Fields Present', missingRequired.length === 0, 'MEDIUM',
    `All mandatory fields extracted (${requiredKeys.join(', ')}).`, missingRequired.length > 0 ? `Mandatory fields missing: ${missingRequired.join(', ')}.` : '', missingRequired);

  const dateFields = [dobField, issueField, expiryField].filter(Boolean) as DocumentField[];
  const invalidDates = dateFields.filter(f => parseFlexibleDate(f.value) === null);
  addCheck(checks, 'FC-02', 'Calendar Validity of Dates', invalidDates.length === 0, 'HIGH',
    dateFields.length === 0 ? 'No date fields extracted; check skipped.' : 'All extracted dates are valid calendar dates.',
    invalidDates.length > 0 ? `Malformed dates: ${invalidDates.map(f => `${f.label}="${f.value}"`).join(', ')}.` : '', invalidDates.map(f => f.key));

  const dobDate = dobField ? parseFlexibleDate(dobField.value) : null;
  const issueDate = issueField ? parseFlexibleDate(issueField.value) : null;
  const expiryDate = expiryField ? parseFlexibleDate(expiryField.value) : null;

  if (dobDate && expiryDate) {
    addCheck(checks, 'FC-03', 'Chronological Consistency (DOB < Expiry)', dobDate.getTime() < expiryDate.getTime(), 'CRITICAL',
      'Date of birth precedes date of expiry.', `IMPOSSIBLE CHRONOLOGY: DOB (${dobField!.value}) not before expiry (${expiryField!.value}).`, ['dob', 'expiryDate']);
  }
  if (dobDate && issueDate) {
    addCheck(checks, 'FC-04', 'Chronological Consistency (DOB < Issue)', dobDate.getTime() < issueDate.getTime(), 'CRITICAL',
      'Date of birth precedes date of issue.', `IMPOSSIBLE CHRONOLOGY: Issued (${issueField!.value}) before DOB (${dobField!.value}).`, ['dob', 'issueDate']);
  }
  if (issueDate && expiryDate) {
    const chronological = issueDate.getTime() < expiryDate.getTime();
    addCheck(checks, 'FC-05', 'Chronological Consistency (Issue < Expiry)', chronological, 'CRITICAL',
      'Date of issue precedes date of expiry.', `IMPOSSIBLE CHRONOLOGY: Expires (${expiryField!.value}) before issue (${issueField!.value}).`, ['issueDate', 'expiryDate']);
    if (chronological) {
      const years = (expiryDate.getTime() - issueDate.getTime()) / 86400000 / 365.25;
      const plausible = documentType === 'passport' ? years >= 1 && years <= 11 : years >= 0.5 && years <= 25;
      addCheck(checks, 'FC-06', 'Validity Period Plausibility', plausible, 'MEDIUM',
        `Validity period of ${years.toFixed(1)} years is within expected range.`, `Validity period of ${years.toFixed(1)} years is outside expected range.`, ['issueDate', 'expiryDate']);
    }
  }
  if (dobDate) {
    addCheck(checks, 'FC-07', 'Date of Birth Not in Future', dobDate.getTime() < Date.now(), 'CRITICAL',
      'Date of birth is in the past.', `IMPOSSIBLE VALUE: DOB (${dobField!.value}) is in the future.`, ['dob']);
  }
  if (docNumField) {
    const patternDef = documentType === 'national_id' ? DOC_NUMBER_PATTERNS.national_id : documentType === 'driving_license' ? DOC_NUMBER_PATTERNS.driving_license : documentType === 'passport' ? DOC_NUMBER_PATTERNS.passport : null;
    if (patternDef) {
      const normalized = docNumField.value.replace(/\s+/g, ' ').trim();
      addCheck(checks, 'FC-08', 'Document Number Format', patternDef.pattern.test(normalized), 'HIGH',
        `Document number matches expected ${documentType.replace('_', ' ')} format.`, `Document number "${docNumField.value}" does not match expected format. ${patternDef.description}`, [docNumField.key]);
    }
  }
  const aadhaarField = getField('aadhaarNumber');
  if (aadhaarField && documentType === 'national_id') {
    const digits = aadhaarField.value.replace(/\D/g, '');
    if (digits.length === 12 && !/X/i.test(aadhaarField.value)) {
      addCheck(checks, 'FC-09', 'Aadhaar Verhoeff Checksum', validateVerhoeff(digits), 'CRITICAL',
        '12-digit credential number passes the UIDAI Verhoeff checksum.', '12-digit credential number FAILS the UIDAI Verhoeff checksum.', ['aadhaarNumber']);
    }
  }
  const sexField = getField('sex');
  const genderField = getField('gender');
  if (sexField && genderField) {
    const s = sexField.value.trim().toUpperCase();
    const g = genderField.value.trim().toUpperCase();
    const compatible = (s === 'M' && g === 'MALE') || (s === 'F' && g === 'FEMALE') || s === g;
    addCheck(checks, 'FC-10', 'Sex/Gender Field Agreement', compatible, 'HIGH', 'Sex and gender fields agree.',
      `CONTRADICTION: Sex says "${sexField.value}" but gender says "${genderField.value}".`, ['sex', 'gender']);
  }

  const evaluated = checks.filter(c => c.severity !== 'PASS' || c.passed);
  const failed = checks.filter(c => !c.passed);
  const overallScore = evaluated.length === 0 ? 100 : Math.max(0, Math.round((1 - failed.length / evaluated.length) * 100));
  let details: string;
  if (checks.length === 0) details = 'No deterministic cross-field rules were applicable.';
  else if (failed.length === 0) details = `All ${checks.length} deterministic consistency rules satisfied.`;
  else details = `${failed.length} of ${checks.length} rules FAILED: ${failed.map(c => c.ruleId).join(', ')}.`;
  return { overallScore, passed: failed.length === 0, checks, details };
}

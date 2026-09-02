/**
 * Seeded Deterministic Random Generator (Mulberry32 PRNG).
 * Ensures identical test fixtures across all execution runs.
 */
export class SeededRandom {
  private state: number;

  constructor(seedStr: string = 'SENTINEL-ID-TEST-2026') {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    this.state = h >>> 0;
  }

  public next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public intRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public pick<T>(items: T[]): T {
    return items[this.intRange(0, items.length - 1)];
  }

  public digits(count: number): string {
    let s = '';
    for (let i = 0; i < count; i++) {
      s += this.intRange(0, 9).toString();
    }
    return s;
  }
}

// Verhoeff D5 Checksum Calculator
const dTable: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const pTable: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const invTable: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

export function computeVerhoeffCheckDigit(num11Digits: string): string {
  let c = 0;
  const digits = num11Digits.replace(/\D/g, '').split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = dTable[c][pTable[(i + 1) % 8][digits[i]]];
  }
  return invTable[c].toString();
}

export function generateSyntheticAadhaar(rng: SeededRandom): string {
  // First digit must be 2-9
  const first = rng.intRange(2, 9).toString();
  const rest10 = rng.digits(10);
  const base11 = first + rest10;
  const cd = computeVerhoeffCheckDigit(base11);
  const full12 = base11 + cd;
  return `${full12.slice(0, 4)} ${full12.slice(4, 8)} ${full12.slice(8, 12)}`;
}

// ICAO 7-3-1 Weight Checksum Calculator
export function computeICAOCheckDigit(str: string): string {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i].toUpperCase();
    let val = 0;
    if (ch >= '0' && ch <= '9') val = parseInt(ch, 10);
    else if (ch >= 'A' && ch <= 'Z') val = ch.charCodeAt(0) - 55;
    else val = 0;
    sum += val * weights[i % 3];
  }
  return (sum % 10).toString();
}

export interface SyntheticIdentity {
  name: string;
  givenNames: string;
  surname: string;
  dob: string;
  yymmddDob: string;
  gender: 'M' | 'F';
  nationality: string;
  passportNumber: string;
  aadhaarNumber: string;
  dlNumber: string;
  visaNumber: string;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  yymmddExpiry: string;
  address: string;
}

const FIRST_NAMES = [
  'ARJUN', 'VIKRAM', 'ROHAN', 'ADITYA', 'KAVITA', 'PRIYA', 'ANANYA', 'SNEHA',
  'DEEPAK', 'MANISH', 'KIRAN', 'SUNITA', 'POOJA', 'AMIT', 'RAJESH', 'MEERA',
  'SANJAY', 'DIVYA', 'NEHA', 'ALOK'
];

const LAST_NAMES = [
  'SHARMA', 'VERMA', 'KUMAR', 'SINGH', 'PATEL', 'GUPTA', 'CHOUDHARY', 'DESHMUKH',
  'REDDY', 'NAIR', 'BHAT', 'MENON', 'JOSHI', 'MUKHERJEE', 'DAS', 'CHOPRA',
  'RAO', 'SEN', 'YADAV', 'MALHOTRA'
];

const INDIAN_STATES = ['DL', 'MH', 'KA', 'UP', 'TN', 'GJ', 'WB', 'RJ', 'AP', 'TS', 'HR', 'PB', 'BR'];

export function generateSyntheticIdentity(index: number, seedBase: string = 'SENTINEL-ID-TEST-2026'): SyntheticIdentity {
  const rng = new SeededRandom(`${seedBase}-ID-${index}`);
  
  const given = FIRST_NAMES[index % FIRST_NAMES.length];
  const sur = LAST_NAMES[(index + 3) % LAST_NAMES.length];
  const name = `${given} ${sur}`;
  const gender: 'M' | 'F' = index % 2 === 0 ? 'M' : 'F';

  // Chronology: DOB 1970-2003 (Age 23-56)
  const birthYear = 1970 + (index % 34);
  const birthMonth = 1 + (index % 12);
  const birthDay = 1 + (index % 28);
  const mmStr = birthMonth.toString().padStart(2, '0');
  const ddStr = birthDay.toString().padStart(2, '0');
  const dob = `${birthYear}-${mmStr}-${ddStr}`;
  const yymmddDob = `${birthYear.toString().slice(2)}${mmStr}${ddStr}`;

  // Issue 2021-2024
  const issueYear = 2021 + (index % 4);
  const issueDate = `${issueYear}-${mmStr}-${ddStr}`;

  // Expiry 2031-2034 (Passport 10-year)
  const expiryYear = issueYear + 10;
  const expiryDate = `${expiryYear}-${mmStr}-${ddStr}`;
  const yymmddExpiry = `${expiryYear.toString().slice(2)}${mmStr}${ddStr}`;

  // Synthetic Passport Number: 1 Letter + 7 Digits (e.g. Z4829104)
  const pLetter = String.fromCharCode(65 + (index % 26));
  const pDigits = rng.digits(7);
  const passportNumber = `${pLetter}${pDigits}`;

  // Synthetic Aadhaar
  const aadhaarNumber = generateSyntheticAadhaar(rng);

  // Synthetic DL Number: State(2) + RTO(2) + Year(4) + 7 Digits (e.g. DL-0420230018921)
  const state = INDIAN_STATES[index % INDIAN_STATES.length];
  const rto = (1 + (index % 15)).toString().padStart(2, '0');
  const dlYear = issueYear.toString();
  const dlDigits = rng.digits(7);
  const dlNumber = `${state}-${rto}${dlYear}${dlDigits}`;

  // Synthetic Visa Number: V + 7 Digits
  const visaNumber = `V${rng.digits(7)}`;

  // Synthetic Permit Number: SSB-ICP-Year-4digits
  const permitNumber = `SSB-ICP-${issueYear}-${rng.digits(4)}`;

  const address = `HOUSE ${10 + index * 4}, SECTOR ${1 + (index % 20)}, NEW DELHI 110001`;

  return {
    name,
    givenNames: given,
    surname: sur,
    dob,
    yymmddDob,
    gender,
    nationality: 'IND',
    passportNumber,
    aadhaarNumber,
    dlNumber,
    visaNumber,
    permitNumber,
    issueDate,
    expiryDate,
    yymmddExpiry,
    address,
  };
}

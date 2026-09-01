import { MRZData, MRZChecksumItem, DocumentField, MRZStatus } from '../types';

/**
 * ICAO Doc 9303 character weighting values
 * '0'-'9' -> 0-9
 * 'A'-'Z' -> 10-35
 * '<' -> 0
 */
export function getCharWeightValue(char: string): number {
  if (!char) return 0;
  const upper = char.toUpperCase();
  if (upper >= '0' && upper <= '9') {
    return parseInt(upper, 10);
  }
  if (upper >= 'A' && upper <= 'Z') {
    return upper.charCodeAt(0) - 55; // 'A' (65) - 55 = 10
  }
  return 0; // '<' or any other filler
}

/**
 * Calculates ICAO 9303 Check Digit using 7-3-1 weight pattern modulo 10
 */
export function calculateICAOCheckDigit(input: string): string {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const val = getCharWeightValue(input[i]);
    const weight = weights[i % 3];
    sum += val * weight;
  }
  return (sum % 10).toString();
}

/**
 * Formats YYMMDD into YYYY-MM-DD
 */
export function formatYYMMDD(yymmdd: string, isExpiry: boolean = false): string {
  if (!yymmdd || yymmdd.length < 6) return '';
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  
  const currentYear = new Date().getFullYear() % 100;
  let fullYear: number;
  
  if (isExpiry) {
    fullYear = 2000 + yy;
  } else {
    fullYear = yy <= currentYear ? 2000 + yy : 1900 + yy;
  }
  
  return `${fullYear}-${mm}-${dd}`;
}

/**
 * Parse and Validate ICAO TD3 (Passport - 2 lines x 44 chars)
 */
export function parseTD3MRZ(line1: string, line2: string, vizFields?: DocumentField[]): MRZData {
  const cleanL1 = (line1 || '').padEnd(44, '<').slice(0, 44).toUpperCase();
  const cleanL2 = (line2 || '').padEnd(44, '<').slice(0, 44).toUpperCase();

  const docType = cleanL1.slice(0, 2).replace(/</g, '');
  const countryCode = cleanL1.slice(2, 5).replace(/</g, '');
  
  // Line 2 parsing
  const docNumber = cleanL2.slice(0, 9).replace(/</g, '');
  const docNumberCheckDigit = cleanL2.slice(9, 10);
  const nationality = cleanL2.slice(10, 13).replace(/</g, '');
  const birthDate = cleanL2.slice(13, 19);
  const birthDateCheckDigit = cleanL2.slice(19, 20);
  const sexChar = cleanL2.slice(20, 21);
  const sex = (['M', 'F', 'X'].includes(sexChar) ? sexChar : '<') as 'M' | 'F' | 'X' | '<';
  const expirationDate = cleanL2.slice(21, 27);
  const expirationDateCheckDigit = cleanL2.slice(27, 28);
  const personalNumber = cleanL2.slice(28, 42).replace(/</g, '');
  const personalNumberCheckDigit = cleanL2.slice(42, 43);
  const compositeCheckDigit = cleanL2.slice(43, 44);

  // Compute check digits
  const computedDocNumCD = calculateICAOCheckDigit(cleanL2.slice(0, 9));
  const computedBirthDateCD = calculateICAOCheckDigit(birthDate);
  const computedExpiryCD = calculateICAOCheckDigit(expirationDate);
  
  let computedPersonalNumCD = '';
  if (cleanL2.slice(28, 42) !== '<<<<<<<<<<<<<<') {
    computedPersonalNumCD = calculateICAOCheckDigit(cleanL2.slice(28, 42));
  }

  // Composite check digit over (Doc# + CD + DOB + CD + Expiry + CD + Optional + CD)
  const compositeSource = cleanL2.slice(0, 10) + cleanL2.slice(13, 20) + cleanL2.slice(21, 43);
  const computedCompositeCD = calculateICAOCheckDigit(compositeSource);

  const checksumList: MRZChecksumItem[] = [
    {
      field: 'Document Number',
      extractedValue: docNumber,
      checkDigit: docNumberCheckDigit,
      computedCheckDigit: computedDocNumCD,
      isValid: docNumberCheckDigit === computedDocNumCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Date of Birth',
      extractedValue: birthDate,
      checkDigit: birthDateCheckDigit,
      computedCheckDigit: computedBirthDateCD,
      isValid: birthDateCheckDigit === computedBirthDateCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Date of Expiry',
      extractedValue: expirationDate,
      checkDigit: expirationDateCheckDigit,
      computedCheckDigit: computedExpiryCD,
      isValid: expirationDateCheckDigit === computedExpiryCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Composite Checksum',
      extractedValue: 'Full MRZ Line 2 Core',
      checkDigit: compositeCheckDigit,
      computedCheckDigit: computedCompositeCD,
      isValid: compositeCheckDigit === computedCompositeCD,
      algorithm: 'ICAO 9303 Multi-field Composite Hash',
    }
  ];

  if (computedPersonalNumCD && personalNumberCheckDigit !== '<') {
    checksumList.push({
      field: 'Personal Number',
      extractedValue: personalNumber,
      checkDigit: personalNumberCheckDigit,
      computedCheckDigit: computedPersonalNumCD,
      isValid: personalNumberCheckDigit === computedPersonalNumCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    });
  }

  const isAllChecksumsValid = checksumList.every(c => c.isValid);

  // Cross-reference VIZ against MRZ
  const vizMismatchDetails: string[] = [];
  let vizMismatchDetected = false;

  if (vizFields && vizFields.length > 0) {
    const vizDocNum = vizFields.find(f => f.key === 'passportNumber' || f.key === 'documentNumber')?.value;
    if (vizDocNum && docNumber) {
      const cleanVizDoc = vizDocNum.replace(/[\s-]/g, '').toUpperCase();
      const cleanMrzDoc = docNumber.replace(/[\s-]/g, '').toUpperCase();
      if (!cleanVizDoc.includes(cleanMrzDoc) && !cleanMrzDoc.includes(cleanVizDoc)) {
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Document Number Mismatch: Visual says "${vizDocNum}" vs MRZ says "${docNumber}"`);
      }
    }

    const vizDob = vizFields.find(f => f.key === 'dob' || f.key === 'dateOfBirth')?.value;
    if (vizDob && birthDate) {
      const formattedDob = formatYYMMDD(birthDate);
      if (vizDob && !vizDob.includes(birthDate.slice(0, 2)) && !formattedDob.includes(vizDob.slice(0, 4))) {
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Date of Birth Discrepancy: Visual says "${vizDob}" vs MRZ decoded "${formattedDob}"`);
      }
    }

    const vizNationality = vizFields.find(f => f.key === 'nationality' || f.key === 'country')?.value;
    if (vizNationality && nationality) {
      if (!vizNationality.toUpperCase().includes(nationality) && !nationality.includes(vizNationality.slice(0, 3).toUpperCase())) {
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Nationality Code Inconsistency: Visual says "${vizNationality}" vs MRZ "${nationality}"`);
      }
    }
  }

  const status: MRZStatus = isAllChecksumsValid ? 'CHECKSUM_VALID' : 'CHECKSUM_INVALID';

  return {
    format: 'TD3',
    status,
    rawLines: [cleanL1, cleanL2],
    documentType: docType || 'P',
    countryCode,
    documentNumber: docNumber,
    documentNumberCheckDigit: docNumberCheckDigit,
    nationality,
    birthDate,
    birthDateFormatted: formatYYMMDD(birthDate, false),
    birthDateCheckDigit,
    sex,
    expirationDate,
    expirationDateFormatted: formatYYMMDD(expirationDate, true),
    expirationDateCheckDigit,
    personalNumber: personalNumber || undefined,
    personalNumberCheckDigit: personalNumberCheckDigit !== '<' ? personalNumberCheckDigit : undefined,
    compositeCheckDigit,
    computedCompositeCheckDigit: computedCompositeCD,
    isAllChecksumsValid,
    checksumList,
    vizMismatchDetected,
    vizMismatchDetails,
  };
}

/**
 * Parse and Validate ICAO TD1 (ID cards, Border Permits - 3 lines x 30 chars)
 */
export function parseTD1MRZ(line1: string, line2: string, line3: string, vizFields?: DocumentField[]): MRZData {
  const cleanL1 = (line1 || '').padEnd(30, '<').slice(0, 30).toUpperCase();
  const cleanL2 = (line2 || '').padEnd(30, '<').slice(0, 30).toUpperCase();
  const cleanL3 = (line3 || '').padEnd(30, '<').slice(0, 30).toUpperCase();

  const docType = cleanL1.slice(0, 2).replace(/</g, '') || 'I';
  const countryCode = cleanL1.slice(2, 5).replace(/</g, '');
  const docNumber = cleanL1.slice(5, 14).replace(/</g, '');
  const docNumberCheckDigit = cleanL1.slice(14, 15);
  const optionalData1 = cleanL1.slice(15, 30).replace(/</g, '');

  const birthDate = cleanL2.slice(0, 6);
  const birthDateCheckDigit = cleanL2.slice(6, 7);
  const sexChar = cleanL2.slice(7, 8);
  const sex = (['M', 'F', 'X'].includes(sexChar) ? sexChar : '<') as 'M' | 'F' | 'X' | '<';
  const expirationDate = cleanL2.slice(8, 14);
  const expirationDateCheckDigit = cleanL2.slice(14, 15);
  const nationality = cleanL2.slice(15, 18).replace(/</g, '');
  const optionalData2 = cleanL2.slice(18, 29).replace(/</g, '');
  const compositeCheckDigit = cleanL2.slice(29, 30);

  // Check digits
  const computedDocNumCD = calculateICAOCheckDigit(cleanL1.slice(5, 14));
  const computedBirthDateCD = calculateICAOCheckDigit(birthDate);
  const computedExpiryCD = calculateICAOCheckDigit(expirationDate);

  // Composite check digit over (L1[5..30] + L2[0..7] + L2[8..15] + L2[18..29])
  const compositeSource = cleanL1.slice(5, 30) + cleanL2.slice(0, 7) + cleanL2.slice(8, 15) + cleanL2.slice(18, 29);
  const computedCompositeCD = calculateICAOCheckDigit(compositeSource);

  const checksumList: MRZChecksumItem[] = [
    {
      field: 'Document Number',
      extractedValue: docNumber,
      checkDigit: docNumberCheckDigit,
      computedCheckDigit: computedDocNumCD,
      isValid: docNumberCheckDigit === computedDocNumCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Date of Birth',
      extractedValue: birthDate,
      checkDigit: birthDateCheckDigit,
      computedCheckDigit: computedBirthDateCD,
      isValid: birthDateCheckDigit === computedBirthDateCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Date of Expiry',
      extractedValue: expirationDate,
      checkDigit: expirationDateCheckDigit,
      computedCheckDigit: computedExpiryCD,
      isValid: expirationDateCheckDigit === computedExpiryCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Composite Checksum',
      extractedValue: 'TD1 Lines 1 & 2 Composite',
      checkDigit: compositeCheckDigit,
      computedCheckDigit: computedCompositeCD,
      isValid: compositeCheckDigit === computedCompositeCD,
      algorithm: 'ICAO 9303 Multi-field Composite Hash',
    }
  ];

  const isAllChecksumsValid = checksumList.every(c => c.isValid);
  const vizMismatchDetails: string[] = [];
  let vizMismatchDetected = false;

  if (vizFields && vizFields.length > 0) {
    const vizDocNum = vizFields.find(f => f.key === 'documentNumber' || f.key === 'permitNumber' || f.key === 'aadhaarNumber')?.value;
    if (vizDocNum && docNumber) {
      const cleanVizDoc = vizDocNum.replace(/[\s-]/g, '').toUpperCase();
      const cleanMrzDoc = docNumber.replace(/[\s-]/g, '').toUpperCase();
      if (!cleanVizDoc.includes(cleanMrzDoc) && !cleanMrzDoc.includes(cleanVizDoc)) {
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Document Number Mismatch: Visual says "${vizDocNum}" vs MRZ says "${docNumber}"`);
      }
    }

    const vizDob = vizFields.find(f => f.key === 'dob' || f.key === 'dateOfBirth')?.value;
    if (vizDob && birthDate) {
      const formattedDob = formatYYMMDD(birthDate);
      if (!vizDob.includes(birthDate.slice(0, 2)) && !formattedDob.includes(vizDob.slice(0, 4))) {
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Date of Birth Discrepancy: Visual says "${vizDob}" vs MRZ decoded "${formattedDob}"`);
      }
    }
  }

  const status: MRZStatus = isAllChecksumsValid ? 'CHECKSUM_VALID' : 'CHECKSUM_INVALID';

  return {
    format: 'TD1',
    status,
    rawLines: [cleanL1, cleanL2, cleanL3],
    documentType: docType,
    countryCode,
    documentNumber: docNumber,
    documentNumberCheckDigit: docNumberCheckDigit,
    nationality,
    birthDate,
    birthDateFormatted: formatYYMMDD(birthDate, false),
    birthDateCheckDigit,
    sex,
    expirationDate,
    expirationDateFormatted: formatYYMMDD(expirationDate, true),
    expirationDateCheckDigit,
    personalNumber: optionalData1 || optionalData2 || undefined,
    compositeCheckDigit,
    computedCompositeCheckDigit: computedCompositeCD,
    isAllChecksumsValid,
    checksumList,
    vizMismatchDetected,
    vizMismatchDetails,
  };
}

/**
 * Parse and Validate ICAO TD2 / MRV-B (Visas, Travel Cards - 2 lines x 36 chars)
 */
export function parseTD2MRZ(line1: string, line2: string, vizFields?: DocumentField[]): MRZData {
  const cleanL1 = (line1 || '').padEnd(36, '<').slice(0, 36).toUpperCase();
  const cleanL2 = (line2 || '').padEnd(36, '<').slice(0, 36).toUpperCase();

  const docType = cleanL1.slice(0, 2).replace(/</g, '') || 'V';
  const countryCode = cleanL1.slice(2, 5).replace(/</g, '');

  const docNumber = cleanL2.slice(0, 9).replace(/</g, '');
  const docNumberCheckDigit = cleanL2.slice(9, 10);
  const nationality = cleanL2.slice(10, 13).replace(/</g, '');
  const birthDate = cleanL2.slice(13, 19);
  const birthDateCheckDigit = cleanL2.slice(19, 20);
  const sexChar = cleanL2.slice(20, 21);
  const sex = (['M', 'F', 'X'].includes(sexChar) ? sexChar : '<') as 'M' | 'F' | 'X' | '<';
  const expirationDate = cleanL2.slice(21, 27);
  const expirationDateCheckDigit = cleanL2.slice(27, 28);
  const optionalData = cleanL2.slice(28, 35).replace(/</g, '');
  const compositeCheckDigit = cleanL2.slice(35, 36);

  const computedDocNumCD = calculateICAOCheckDigit(cleanL2.slice(0, 9));
  const computedBirthDateCD = calculateICAOCheckDigit(birthDate);
  const computedExpiryCD = calculateICAOCheckDigit(expirationDate);
  const compositeSource = cleanL2.slice(0, 10) + cleanL2.slice(13, 20) + cleanL2.slice(21, 35);
  const computedCompositeCD = calculateICAOCheckDigit(compositeSource);

  const checksumList: MRZChecksumItem[] = [
    {
      field: 'Document Number',
      extractedValue: docNumber,
      checkDigit: docNumberCheckDigit,
      computedCheckDigit: computedDocNumCD,
      isValid: docNumberCheckDigit === computedDocNumCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Date of Birth',
      extractedValue: birthDate,
      checkDigit: birthDateCheckDigit,
      computedCheckDigit: computedBirthDateCD,
      isValid: birthDateCheckDigit === computedBirthDateCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Date of Expiry',
      extractedValue: expirationDate,
      checkDigit: expirationDateCheckDigit,
      computedCheckDigit: computedExpiryCD,
      isValid: expirationDateCheckDigit === computedExpiryCD,
      algorithm: 'ICAO 9303 7-3-1 Weight (Modulo 10)',
    },
    {
      field: 'Composite Checksum',
      extractedValue: 'TD2 Line 2 Core',
      checkDigit: compositeCheckDigit,
      computedCheckDigit: computedCompositeCD,
      isValid: compositeCheckDigit === computedCompositeCD,
      algorithm: 'ICAO 9303 Multi-field Composite Hash',
    }
  ];

  const isAllChecksumsValid = checksumList.every(c => c.isValid);
  const vizMismatchDetails: string[] = [];
  let vizMismatchDetected = false;

  if (vizFields && vizFields.length > 0) {
    const vizDocNum = vizFields.find(f => f.key === 'visaNumber' || f.key === 'documentNumber')?.value;
    if (vizDocNum && docNumber) {
      const cleanVizDoc = vizDocNum.replace(/[\s-]/g, '').toUpperCase();
      const cleanMrzDoc = docNumber.replace(/[\s-]/g, '').toUpperCase();
      if (!cleanVizDoc.includes(cleanMrzDoc) && !cleanMrzDoc.includes(cleanVizDoc)) {
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Visa Number Mismatch: Visual says "${vizDocNum}" vs MRZ says "${docNumber}"`);
      }
    }
  }

  const status: MRZStatus = isAllChecksumsValid ? 'CHECKSUM_VALID' : 'CHECKSUM_INVALID';

  return {
    format: 'TD2',
    status,
    rawLines: [cleanL1, cleanL2],
    documentType: docType,
    countryCode,
    documentNumber: docNumber,
    documentNumberCheckDigit: docNumberCheckDigit,
    nationality,
    birthDate,
    birthDateFormatted: formatYYMMDD(birthDate, false),
    birthDateCheckDigit,
    sex,
    expirationDate,
    expirationDateFormatted: formatYYMMDD(expirationDate, true),
    expirationDateCheckDigit,
    personalNumber: optionalData || undefined,
    compositeCheckDigit,
    computedCompositeCheckDigit: computedCompositeCD,
    isAllChecksumsValid,
    checksumList,
    vizMismatchDetected,
    vizMismatchDetails,
  };
}

/**
 * Universal MRZ parser with structure validation for TD1 (3x30), TD2 (2x36), and TD3 (2x44).
 */
export function parseMRZ(rawText: string, vizFields?: DocumentField[]): MRZData | null {
  if (!rawText) return null;
  
  // Extract lines containing '<' with length >= 25
  const lines = rawText
    .split('\n')
    .map(l => l.trim().replace(/\s+/g, ''))
    .filter(l => l.includes('<') && l.length >= 25 && /^[A-Z0-9<]+$/.test(l));

  // Case 1: 3 lines -> TD1 (3 x 30)
  if (lines.length >= 3) {
    if (lines[0].length >= 26 && lines[1].length >= 26 && lines[2].length >= 26) {
      return parseTD1MRZ(lines[0], lines[1], lines[2], vizFields);
    }
  }

  // Case 2: 2 lines
  if (lines.length >= 2) {
    // If length >= 40 -> TD3 (2 x 44)
    if (lines[0].length >= 38 && lines[1].length >= 38) {
      return parseTD3MRZ(lines[0], lines[1], vizFields);
    }
    // If length between 30 and 39 -> TD2 (2 x 36)
    if (lines[0].length >= 30 && lines[1].length >= 30) {
      return parseTD2MRZ(lines[0], lines[1], vizFields);
    }
  }

  return null;
}

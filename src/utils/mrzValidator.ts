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
  
  // Line 1 name parsing (format: P<CTYSURNAME<<GIVEN<NAMES<<<<)
  const nameSection = cleanL1.slice(5).replace(/<+$/, '');
  const nameParts = nameSection.split('<<');
  const surname = (nameParts[0] || '').replace(/</g, ' ').trim();
  const givenNames = (nameParts[1] || '').replace(/</g, ' ').trim();
  
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
  // IMPORTANT: Only flag mismatches when:
  //   (a) both sides have real values (not UNKNOWN/empty)
  //   (b) the MRZ was reliably parsed (checked via checksums in riskEngine)
  //   (c) comparison is done on normalized, same-format values
  const vizMismatchDetails: string[] = [];
  let vizMismatchDetected = false;

  if (vizFields && vizFields.length > 0) {
    // --- Document Number ---
    const vizDocField = vizFields.find(f => f.key === 'passportNumber' || f.key === 'documentNumber');
    const vizDocNum = vizDocField?.value;
    const vizDocUnknown = !vizDocNum || vizDocNum.startsWith('UNKNOWN') || vizDocField?.validation === 'UNVERIFIED';
    if (!vizDocUnknown && docNumber) {
      const cleanVizDoc = vizDocNum!.replace(/[\s\-]/g, '').toUpperCase();
      const cleanMrzDoc = docNumber.replace(/[\s\-]/g, '').toUpperCase();
      // Only flag if neither side is a substring of the other
      if (!cleanVizDoc.includes(cleanMrzDoc) && !cleanMrzDoc.includes(cleanVizDoc)) {
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Document Number Mismatch: Visual says "${vizDocNum}" vs MRZ says "${docNumber}"`);
      }
    }

    // --- Date of Birth ---
    // Both sides normalized to YYYY-MM-DD before comparing
    const vizDobField = vizFields.find(f => f.key === 'dob' || f.key === 'dateOfBirth');
    const vizDob = vizDobField?.value;
    const vizDobUnknown = !vizDob || vizDob === 'UNKNOWN' || vizDobField?.validation === 'UNVERIFIED';
    if (!vizDobUnknown && birthDate && birthDate.length === 6) {
      const mrzDobFormatted = formatYYMMDD(birthDate, false); // e.g. "2006-09-04"
      // Normalize VIZ DOB: handles DD/MM/YYYY and YYYY-MM-DD formats
      let vizDobNormalized = vizDob!;
      const ddmmyyyy = vizDob!.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      if (ddmmyyyy) {
        vizDobNormalized = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
      }
      // Compare YYYY-MM-DD strings
      if (mrzDobFormatted && vizDobNormalized && mrzDobFormatted !== vizDobNormalized) {
        // One more check: avoid false positives from year-century ambiguity
        // e.g. "2006-09-04" vs "1906-09-04" would be a real mismatch; "2006" vs "06" is same.
        vizMismatchDetected = true;
        vizMismatchDetails.push(`Date of Birth Discrepancy: Visual says "${vizDob}" vs MRZ decoded "${mrzDobFormatted}"`);
      }
    }

    // --- Nationality ---
    const vizNatField = vizFields.find(f => f.key === 'nationality' || f.key === 'country');
    const vizNationality = vizNatField?.value;
    const vizNatUnknown = !vizNationality || vizNationality === 'UNKNOWN' || vizNatField?.validation === 'UNVERIFIED';
    if (!vizNatUnknown && nationality) {
      const vn = vizNationality!.toUpperCase().replace(/\s/g, '').slice(0, 3);
      const mn = nationality.toUpperCase().slice(0, 3);
      if (vn !== mn) {
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
    surname: surname || undefined,
    givenNames: givenNames || undefined,
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
 *
 * Handles OCR noise: normalizes whitespace, validates line identity before parsing.
 * CRITICAL: For TD3, Line 2 must NOT start with 'P<' (that would be Line 1 again).
 * When Line 1 and Line 2 are identical, parsing will produce garbage field values
 * that generate false VIZ mismatches and checksum failures.
 */
export function parseMRZ(rawText: string, vizFields?: DocumentField[]): MRZData | null {
  if (!rawText) return null;

  // Normalize all lines: uppercase, strip spaces within lines
  const allLines = rawText
    .split('\n')
    .map(l => l.trim().replace(/\s+/g, '').toUpperCase());

  // Filter for MRZ-valid lines (only A-Z, 0-9, '<')
  const mrzCandidates = allLines
    .filter(l => l.length >= 25 && /^[A-Z0-9<]+$/.test(l));

  // TD3: specifically find Line 1 (P<CCC...) and Line 2 (docNum-led)
  // Line 1 criterion: starts with P< or PI (OCR artefact) followed by 3-letter country code
  const td3L1Candidates = mrzCandidates.filter(l => /^P[<I][A-Z]{3}/.test(l) && l.length >= 38);
  // Line 2 criterion: does NOT start with P< (that's Line 1), starts with letter+digits
  const td3L2Candidates = mrzCandidates.filter(
    l => !/^P[<I][A-Z]/.test(l) && /^[A-Z0-9]/.test(l) && l.length >= 38
  );

  if (td3L1Candidates.length >= 1 && td3L2Candidates.length >= 1) {
    const l1 = td3L1Candidates[0];
    const l2 = td3L2Candidates[0];
    // Final sanity: they must be different lines
    if (l1 !== l2) {
      return parseTD3MRZ(l1, l2, vizFields);
    }
  }

  // If we couldn't cleanly separate L1/L2 for TD3, try ordered approach:
  // Take first P< line as L1, next non-P< line as L2
  if (mrzCandidates.length >= 2) {
    const l1idx = mrzCandidates.findIndex(l => /^P[<I][A-Z]{3}/.test(l));
    const l2idx = mrzCandidates.findIndex((l, i) => i !== l1idx && !/^P[<I][A-Z]/.test(l) && l.length >= 38);
    if (l1idx >= 0 && l2idx >= 0) {
      return parseTD3MRZ(mrzCandidates[l1idx], mrzCandidates[l2idx], vizFields);
    }
    // Standard 2 lines TD3 check
    if (mrzCandidates[0].length >= 38 && mrzCandidates[1].length >= 38 && mrzCandidates[0] !== mrzCandidates[1]) {
      return parseTD3MRZ(mrzCandidates[0], mrzCandidates[1], vizFields);
    }
  }

  // Fallback: TD1 (3 lines x 30 chars)
  if (mrzCandidates.length >= 3) {
    const l30 = mrzCandidates.filter(l => l.length >= 26 && l.length <= 32);
    if (l30.length >= 3) {
      return parseTD1MRZ(l30[0], l30[1], l30[2], vizFields);
    }
  }

  // Fallback: TD2 (2 lines x 36 chars)
  if (mrzCandidates.length >= 2) {
    const l36 = mrzCandidates.filter(l => l.length >= 30 && l.length <= 40);
    if (l36.length >= 2) {
      return parseTD2MRZ(l36[0], l36[1], vizFields);
    }
  }

  return null;
}

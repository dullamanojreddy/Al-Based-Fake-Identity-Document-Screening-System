import { DocumentTestCase } from '../types';
import { generateSyntheticIdentity, computeICAOCheckDigit } from '../generators/syntheticIdentityGenerator';

export function generatePassportScenarios(): DocumentTestCase[] {
  const cases: DocumentTestCase[] = [];

  const lightings = ['NORMAL', 'LOW', 'BRIGHT', 'GLARE'] as const;
  const distances = ['NORMAL', 'CLOSE', 'FAR'] as const;
  const angles = ['STRAIGHT', 'SLIGHT', 'MODERATE'] as const;
  const blurs = ['NONE', 'LOW', 'MEDIUM'] as const;
  const resolutions = ['HIGH', 'MEDIUM', 'LOW'] as const;

  // 1. 20 VALID PASSPORTS (P-TRUE-001 to P-TRUE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `P-TRUE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i);

    const docNum9 = ident.passportNumber.padEnd(9, '<');
    const cdDoc = computeICAOCheckDigit(docNum9);
    const mrzDob = ident.dob.replace(/-/g, '').slice(2);
    const cdDob = computeICAOCheckDigit(mrzDob);
    const mrzExp = ident.expiryDate.replace(/-/g, '').slice(2);
    const cdExp = computeICAOCheckDigit(mrzExp);
    const opt14 = '<<<<<<<<<<<<<<';
    const cdOpt = '<';

    const compSource = docNum9 + cdDoc + mrzDob + cdDob + mrzExp + cdExp + opt14 + cdOpt;
    const cdComp = computeICAOCheckDigit(compSource);

    const line1 = `P<IND${ident.surname}<<${ident.givenNames}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44).padEnd(44, '<');
    const line2 = `${docNum9}${cdDoc}IND${mrzDob}${cdDob}${ident.gender}${mrzExp}${cdExp}${opt14}${cdOpt}${cdComp}`;

    const rawOcr = `PASSPORT / PASSEPORT\nREPUBLIC OF INDIA / RÉPUBLIQUE D'INDE\nTYPE: P CODE: IND PASSPORT NO: ${ident.passportNumber}\nSURNAME: ${ident.surname}\nGIVEN NAMES: ${ident.givenNames}\nNATIONALITY: INDIAN\nSEX: ${ident.gender} DOB: ${ident.dob}\nDATE OF ISSUE: ${ident.issueDate} DATE OF EXPIRY: ${ident.expiryDate}\n${line1}\n${line2}`;

    cases.push({
      id,
      category: 'PASSPORT',
      expectedClassification: 'passport',
      expectedTruth: 'VALID',
      sourceData: {
        ...ident,
        rawOcr,
        mrzLines: [line1, line2],
      },
      imageVariant: {
        lighting: lightings[(i - 1) % lightings.length],
        distance: distances[(i - 1) % distances.length],
        angle: angles[(i - 1) % angles.length],
        blur: blurs[(i - 1) % blurs.length],
        resolution: resolutions[(i - 1) % resolutions.length],
      },
      modifications: [],
      expectedRules: [
        { ruleId: 'P01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'P06', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'P07', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'G01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
      ],
      expectedDecision: 'CLEAR',
      expectedRiskRange: { min: 0, max: 20 },
      expectedEvidence: [],
      expectedSeverity: 'NONE',
    });
  }

  // 2. 20 FAKE / INVALID PASSPORTS (P-FAKE-001 to P-FAKE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `P-FAKE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 30);

    let visualDocNum = ident.passportNumber;
    let visualDob = ident.dob;
    let visualExpiry = ident.expiryDate;
    let visualIssue = ident.issueDate;
    let visualSurname = ident.surname;
    let visualNat = ident.nationality;
    let photoTampered = false;

    let docNum9 = ident.passportNumber.padEnd(9, '<');
    let cdDoc = computeICAOCheckDigit(docNum9);
    let mrzDob = ident.dob.replace(/-/g, '').slice(2);
    let cdDob = computeICAOCheckDigit(mrzDob);
    let mrzExp = ident.expiryDate.replace(/-/g, '').slice(2);
    let cdExp = computeICAOCheckDigit(mrzExp);
    const opt14 = '<<<<<<<<<<<<<<';
    const cdOpt = '<';

    let line1 = `P<IND${ident.surname}<<${ident.givenNames}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44).padEnd(44, '<');

    let expectedDecision: any = 'HIGH_RISK';
    let expectedSeverity: any = 'HIGH';
    let expectedRiskRange = { min: 25, max: 85 };
    const expectedRules: any[] = [];
    const expectedEvidence: string[] = [];
    const modifications: any[] = [];

    switch (i) {
      case 1: // MRZ DOB mismatch
        visualDob = '1999-01-01';
        modifications.push({ type: 'FIELD_MISMATCH', field: 'dob', originalValue: ident.dob, modifiedValue: visualDob, description: 'Visual DOB altered' });
        expectedRules.push({ ruleId: 'P08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedEvidence.push('VISUAL_MRZ_DOB_MISMATCH');
        break;

      case 2: // MRZ Doc number mismatch
        visualDocNum = 'A9988776';
        modifications.push({ type: 'FIELD_MISMATCH', field: 'passportNumber', originalValue: ident.passportNumber, modifiedValue: visualDocNum, description: 'Visual Passport number altered' });
        expectedRules.push({ ruleId: 'P07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedEvidence.push('VISUAL_MRZ_DOCNUM_MISMATCH');
        break;

      case 3: // MRZ Expiry mismatch
        visualExpiry = '2039-12-31';
        modifications.push({ type: 'FIELD_MISMATCH', field: 'expiryDate', originalValue: ident.expiryDate, modifiedValue: visualExpiry, description: 'Visual Expiry date altered' });
        expectedRules.push({ ruleId: 'P09', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedEvidence.push('VISUAL_MRZ_EXPIRY_MISMATCH');
        break;

      case 4: // Invalid MRZ check digit
        cdDoc = ((parseInt(cdDoc, 10) + 5) % 10).toString();
        modifications.push({ type: 'CHECKSUM_CORRUPTION', field: 'mrzCheckDigit', description: 'Corrupted document number check digit' });
        expectedRules.push({ ruleId: 'P06', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedEvidence.push('MRZ_CHECK_DIGIT_FAILURE');
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 5: // Multiple invalid check digits
        cdDoc = ((parseInt(cdDoc, 10) + 4) % 10).toString();
        cdDob = ((parseInt(cdDob, 10) + 3) % 10).toString();
        modifications.push({ type: 'MULTIPLE_CHECKSUM_CORRUPTION', description: 'Multiple check digit failures' });
        expectedRules.push({ ruleId: 'P06', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 6: // Invalid MRZ structure
        cdDoc = ((parseInt(cdDoc, 10) + 1) % 10).toString();
        modifications.push({ type: 'MRZ_SYNTAX_CORRUPTION', description: 'Corrupted MRZ checksum' });
        expectedRules.push({ ruleId: 'P06', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 7: // Future DOB
        visualDob = '2099-01-01';
        modifications.push({ type: 'DATE_CHRONOLOGY_ERROR', field: 'dob', modifiedValue: visualDob, description: 'Future Date of Birth' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 8: // Issue date after expiry date
        visualIssue = '2035-01-01';
        visualExpiry = '2025-01-01';
        modifications.push({ type: 'DATE_ORDER_ERROR', description: 'Issue Date exceeds Expiry Date' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 45, max: 85 };
        break;

      case 9: // Nationality mismatch
        visualNat = 'USA';
        modifications.push({ type: 'NATIONALITY_MISMATCH', originalValue: 'IND', modifiedValue: 'USA', description: 'Nationality disparity' });
        expectedRules.push({ ruleId: 'P10', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 10: // Visual name significantly conflicts with MRZ
        visualSurname = 'DIFFERENT';
        modifications.push({ type: 'NAME_MISMATCH', description: 'MRZ names differ from visual zone' });
        expectedRules.push({ ruleId: 'P11', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 11: // Suspicious photo replacement
        photoTampered = true;
        modifications.push({ type: 'PHOTO_SPLICING', description: 'Portrait compression disparity & splicing edge' });
        expectedRules.push({ ruleId: 'P19', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 12: // Copy move region
        photoTampered = true;
        visualDocNum = '12345';
        modifications.push({ type: 'COPY_MOVE', description: 'Duplicated pixel region detected' });
        expectedRules.push({ ruleId: 'P13', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 13: // Suspicious digit manipulation
        visualDocNum = '00000';
        modifications.push({ type: 'DIGIT_ALTERATION', description: 'Font morphology mismatch in document number' });
        expectedRules.push({ ruleId: 'P13', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 14: // Tampered expiry date
        visualExpiry = 'INVALID_EXPIRY';
        modifications.push({ type: 'DATE_TAMPERING', description: 'Visual expiry manipulated' });
        expectedRules.push({ ruleId: 'P14', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 15: // Tampered passport number format
        visualDocNum = '12345';
        modifications.push({ type: 'SYNTAX_TAMPERING', description: 'Passport number truncated' });
        expectedRules.push({ ruleId: 'P13', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 16: // Strong compression inconsistency
        photoTampered = true;
        visualDocNum = 'INVALID_DOC_99';
        modifications.push({ type: 'COMPRESSION_ANOMALY', description: 'Double quantization noise detected' });
        expectedRules.push({ ruleId: 'P13', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 17: // Multiple parity failures
        visualDob = '1995-05-05';
        visualDocNum = '12345';
        visualExpiry = '2030-01-01';
        modifications.push({ type: 'MULTIPLE_PARITY_FAILS', description: 'DOB, Number, and Expiry mismatch MRZ' });
        expectedRules.push({ ruleId: 'P07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedRules.push({ ruleId: 'P08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 18: // Invalid MRZ + suspicious image region
        cdDoc = ((parseInt(cdDoc, 10) + 1) % 10).toString();
        photoTampered = true;
        modifications.push({ type: 'COMPOUND_FRAUD', description: 'Checksum corruption + Photo tampering' });
        expectedRules.push({ ruleId: 'P06', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedRules.push({ ruleId: 'P19', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 80, max: 100 };
        break;

      case 19: // Multiple independent forensic anomalies
        photoTampered = true;
        visualDocNum = '12345';
        modifications.push({ type: 'MULTI_FORENSIC_TAMPERING', description: 'Photo splicing, copy-move, and font alteration' });
        expectedRules.push({ ruleId: 'P19', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 20: // Expired Passport (Valid substrate, lapsed expiry -> EXPIRED, NOT FAKE!)
        visualIssue = '2010-01-01';
        visualExpiry = '2020-01-01';
        mrzExp = '200101';
        cdExp = computeICAOCheckDigit(mrzExp);
        modifications.push({ type: 'EXPIRED_CREDENTIAL', field: 'expiryDate', modifiedValue: '2020-01-01', description: 'Document validity expired' });
        expectedRules.push({ ruleId: 'P15', expectedStatus: 'WARN', expectedSeverity: 'MEDIUM' });
        expectedDecision = 'EXPIRED';
        expectedSeverity = 'MEDIUM';
        expectedRiskRange = { min: 5, max: 45 };
        break;
    }

    const compSource = docNum9 + cdDoc + mrzDob + cdDob + mrzExp + cdExp + opt14 + cdOpt;
    const cdComp = computeICAOCheckDigit(compSource);
    const line2 = `${docNum9}${cdDoc}IND${mrzDob}${cdDob}${ident.gender}${mrzExp}${cdExp}${opt14}${cdOpt}${cdComp}`;

    const rawOcr = `PASSPORT / PASSEPORT\nREPUBLIC OF INDIA / RÉPUBLIQUE D'INDE\nTYPE: P CODE: IND PASSPORT NO: ${visualDocNum}\nSURNAME: ${visualSurname}\nGIVEN NAMES: ${ident.givenNames}\nNATIONALITY: ${visualNat}\nSEX: ${ident.gender} DOB: ${visualDob}\nDATE OF ISSUE: ${visualIssue} DATE OF EXPIRY: ${visualExpiry}\n${line1}\n${line2}`;

    cases.push({
      id,
      category: 'PASSPORT',
      expectedClassification: 'passport',
      expectedTruth: 'INVALID',
      sourceData: {
        ...ident,
        passportNumber: visualDocNum,
        surname: visualSurname,
        dob: visualDob,
        issueDate: visualIssue,
        expiryDate: visualExpiry,
        nationality: visualNat,
        rawOcr,
        mrzLines: [line1, line2],
        photoTampered,
      },
      imageVariant: {
        lighting: lightings[(i - 1) % lightings.length],
        distance: distances[(i - 1) % distances.length],
        angle: angles[(i - 1) % angles.length],
        blur: blurs[(i - 1) % blurs.length],
        resolution: resolutions[(i - 1) % resolutions.length],
      },
      modifications,
      expectedRules,
      expectedDecision,
      expectedRiskRange,
      expectedEvidence,
      expectedSeverity,
    });
  }

  return cases;
}

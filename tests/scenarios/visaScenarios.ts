import { DocumentTestCase } from '../types';
import { generateSyntheticIdentity } from '../generators/syntheticIdentityGenerator';

export function generateVisaScenarios(): DocumentTestCase[] {
  const cases: DocumentTestCase[] = [];

  const lightings = ['NORMAL', 'LOW', 'BRIGHT', 'GLARE'] as const;
  const distances = ['NORMAL', 'CLOSE', 'FAR'] as const;
  const angles = ['STRAIGHT', 'SLIGHT', 'MODERATE'] as const;
  const blurs = ['NONE', 'LOW', 'MEDIUM'] as const;
  const resolutions = ['HIGH', 'MEDIUM', 'LOW'] as const;

  // 1. 20 VALID VISAS (V-TRUE-001 to V-TRUE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `V-TRUE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 100);

    const validFrom = ident.issueDate;
    const validUntil = ident.expiryDate;
    const entries = i % 3 === 0 ? 'MULTIPLE' : 'SINGLE';
    const visaType = 'TOURIST / BUSINESS';

    const rawOcr = `CONSULAR EMBASSY VISA VIGNETTE\nENTRY CLEARANCE PERMIT\nVISA NO: ${ident.visaNumber}\nPASSPORT NO: ${ident.passportNumber}\nNAME: ${ident.name}\nNATIONALITY: ${ident.nationality}\nVALID FROM: ${validFrom}\nVALID UNTIL: ${validUntil}\nENTRIES: ${entries}\nTYPE: ${visaType}`;

    cases.push({
      id,
      category: 'VISA',
      expectedClassification: 'visa',
      expectedTruth: 'VALID',
      sourceData: {
        ...ident,
        validFrom,
        validUntil,
        entries,
        visaType,
        rawOcr,
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
        { ruleId: 'V01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'G01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
      ],
      expectedDecision: 'CLEAR',
      expectedRiskRange: { min: 0, max: 20 },
      expectedEvidence: [],
      expectedSeverity: 'NONE',
    });
  }

  // 2. 20 FAKE / INVALID VISAS (V-FAKE-001 to V-FAKE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `V-FAKE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 130);

    let visualPassport = ident.passportNumber;
    let visualName = ident.name;
    let visualVisaNum = ident.visaNumber;
    let validFrom = ident.issueDate;
    let validUntil = ident.expiryDate;
    let photoTampered = false;
    let headerText = 'CONSULAR EMBASSY VISA VIGNETTE\nENTRY CLEARANCE PERMIT';

    let expectedDecision: any = 'HIGH_RISK';
    let expectedSeverity: any = 'HIGH';
    let expectedRiskRange = { min: 25, max: 80 };
    const expectedRules: any[] = [];
    const expectedEvidence: string[] = [];
    const modifications: any[] = [];

    switch (i) {
      case 1: // Passport number mismatch / invalid format
        visualPassport = '99999999';
        modifications.push({ type: 'PASSPORT_LINK_ERROR', description: 'Passport number on visa does not match holder' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 2: // Holder name mismatch
        visualName = '123456';
        modifications.push({ type: 'NAME_MISMATCH', description: 'Holder name altered' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 3: // Invalid visa number structure
        visualVisaNum = '123';
        modifications.push({ type: 'SYNTAX_ERROR', description: 'Visa number fails consular regex' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 4: // Expired visa (Expired != Fake)
        validFrom = '2016-01-01';
        validUntil = '2021-01-01';
        modifications.push({ type: 'EXPIRED_CREDENTIAL', description: 'Visa validity period expired' });
        expectedRules.push({ ruleId: 'V07', expectedStatus: 'WARN', expectedSeverity: 'MEDIUM' });
        expectedDecision = 'EXPIRED';
        expectedSeverity = 'MEDIUM';
        expectedRiskRange = { min: 5, max: 45 };
        break;

      case 5: // Invalid date chronology (ValidFrom > ValidUntil)
        validFrom = '2035-01-01';
        validUntil = '2025-01-01';
        modifications.push({ type: 'DATE_ORDER_ERROR', description: 'Start date after expiry' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 6: // Future start date beyond limit
        validFrom = '2099-01-01';
        modifications.push({ type: 'FUTURE_START_DATE', description: 'Start date in far future' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 7: // Expired visa variant
        validFrom = '2015-01-01';
        validUntil = '2019-06-30';
        modifications.push({ type: 'EXPIRED_CREDENTIAL', description: 'Lapsed visa' });
        expectedRules.push({ ruleId: 'V07', expectedStatus: 'WARN', expectedSeverity: 'MEDIUM' });
        expectedDecision = 'EXPIRED';
        expectedSeverity = 'MEDIUM';
        expectedRiskRange = { min: 5, max: 45 };
        break;

      case 8: // Duration inconsistency / Invalid visa number
        visualVisaNum = '1234';
        modifications.push({ type: 'DURATION_MISMATCH', description: 'Permitted stay exceeds validity window' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 9: // Entry restriction inconsistency
        visualVisaNum = '0000';
        modifications.push({ type: 'ENTRY_RESTRICTION_ERROR', description: 'Entries conflict with vignette type' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 10: // Passport link mismatch
        visualPassport = '00000000';
        modifications.push({ type: 'NATIONALITY_DISPARITY', description: 'Nationality conflict' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 11: // QR/Barcode mismatch
        visualVisaNum = 'V-INVALID-011';
        modifications.push({ type: 'BARCODE_MISMATCH', description: '2D barcode payload disagrees with visual text' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 12: // MRZ mismatch on vignette
        visualVisaNum = 'V-INVALID-012';
        modifications.push({ type: 'VIGNETTE_MRZ_MISMATCH', description: 'MRV-A band checksum failure' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 13: // Tampered date
        validUntil = '2049-12-31';
        visualVisaNum = 'V-INVALID-013';
        modifications.push({ type: 'DATE_TAMPERING', description: 'Expiry year artificially increased' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 14: // Tampered passport link
        visualPassport = '99999999';
        modifications.push({ type: 'PASSPORT_LINK_TAMPERED', description: 'Passport link altered' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedRiskRange = { min: 25, max: 80 };
        break;

      case 15: // Suspicious photo region
        photoTampered = true;
        visualVisaNum = 'V-SPLICED-001';
        modifications.push({ type: 'PHOTO_SPLICING', description: 'Splicing boundary in portrait zone' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 35, max: 85 };
        break;

      case 16: // Multiple field inconsistencies
        visualPassport = '12345';
        visualName = '12345';
        modifications.push({ type: 'MULTIPLE_INCONSISTENCIES', description: 'Name and Passport link altered' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 90 };
        break;

      case 17: // Structural anomaly (Missing official issuing embassy header)
        headerText = 'GENERAL TRAVEL VOUCHER';
        visualVisaNum = 'V-SPLICED-002';
        modifications.push({ type: 'STRUCTURAL_ANOMALY', description: 'Missing sovereign consular header' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 80 };
        break;

      case 18: // Strong forensic anomaly
        photoTampered = true;
        visualVisaNum = 'V-SPLICED-003';
        modifications.push({ type: 'FORENSIC_ANOMALY', description: 'ELA high energy variance' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 35, max: 85 };
        break;

      case 19: // Multiple independent anomalies
        photoTampered = true;
        validUntil = '2020-01-01';
        visualVisaNum = 'V-SPLICED-004';
        modifications.push({ type: 'COMPOUND_TAMPERING', description: 'Expired + Tampered photo' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 65, max: 100 };
        break;

      case 20: // Corrupted / Unreadable Visa Image
        modifications.push({ type: 'IMAGE_CORRUPTION', description: 'High blur / unreadable' });
        expectedDecision = 'UNABLE_TO_VERIFY';
        expectedSeverity = 'CRITICAL';
        expectedRiskRange = { min: 0, max: 80 };
        break;
    }

    const rawOcr = i === 20
      ? ''
      : `${headerText}\nVISA NO: ${visualVisaNum}\nPASSPORT NO: ${visualPassport}\nNAME: ${visualName}\nNATIONALITY: ${ident.nationality}\nVALID FROM: ${validFrom}\nVALID UNTIL: ${validUntil}`;

    cases.push({
      id,
      category: 'VISA',
      expectedClassification: 'visa',
      expectedTruth: 'INVALID',
      sourceData: {
        ...ident,
        visaNumber: visualVisaNum,
        passportNumber: visualPassport,
        name: visualName,
        validFrom,
        validUntil,
        rawOcr,
        photoTampered,
        isBlank: i === 20,
      },
      imageVariant: {
        lighting: lightings[(i - 1) % lightings.length],
        distance: distances[(i - 1) % distances.length],
        angle: angles[(i - 1) % angles.length],
        blur: i === 20 ? 'MEDIUM' : blurs[(i - 1) % blurs.length],
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

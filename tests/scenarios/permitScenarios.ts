import { DocumentTestCase } from '../types';
import { generateSyntheticIdentity } from '../generators/syntheticIdentityGenerator';

export function generatePermitScenarios(): DocumentTestCase[] {
  const cases: DocumentTestCase[] = [];

  const lightings = ['NORMAL', 'LOW', 'BRIGHT', 'GLARE'] as const;
  const distances = ['NORMAL', 'CLOSE', 'FAR'] as const;
  const angles = ['STRAIGHT', 'SLIGHT', 'MODERATE'] as const;
  const blurs = ['NONE', 'LOW', 'MEDIUM'] as const;
  const resolutions = ['HIGH', 'MEDIUM', 'LOW'] as const;

  // 1. 20 VALID BORDER PERMITS (R-TRUE-001 to R-TRUE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `R-TRUE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 400);

    const validFrom = ident.issueDate;
    const validUntil = ident.expiryDate;
    const permittedArea = 'INDO-NEPAL BORDER SECTOR 4';
    const rawOcr = `SASHASTRA SEEMA BAL BORDER PERMIT\nMINISTRY OF HOME AFFAIRS POLICE II\nPERMIT NO: ${ident.permitNumber}\nNAME: ${ident.name}\nNATIONALITY: ${ident.nationality}\nVALID FROM: ${validFrom}\nVALID UNTIL: ${validUntil}\nPERMITTED AREA: ${permittedArea}\nPURPOSE: OFFICIAL / TRADE TRANSIT\nISSUING AUTHORITY: COMMANDANT SSB ICP`;

    cases.push({
      id,
      category: 'PERMIT',
      expectedClassification: 'border_permit',
      expectedTruth: 'VALID',
      sourceData: {
        ...ident,
        validFrom,
        validUntil,
        permittedArea,
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
        { ruleId: 'R01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'G01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
      ],
      expectedDecision: 'CLEAR',
      expectedRiskRange: { min: 0, max: 20 },
      expectedEvidence: [],
      expectedSeverity: 'NONE',
    });
  }

  // 2. 20 FAKE / INVALID BORDER PERMITS (R-FAKE-001 to R-FAKE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `R-FAKE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 430);

    let visualPermitNum = ident.permitNumber;
    let visualName = ident.name;
    let validFrom = ident.issueDate;
    let validUntil = ident.expiryDate;
    let visualNat = ident.nationality;
    let permittedArea = 'INDO-NEPAL BORDER SECTOR 4';
    let headerText = 'SASHASTRA SEEMA BAL BORDER PERMIT\nMINISTRY OF HOME AFFAIRS';
    let photoTampered = false;

    let expectedDecision: any = 'HIGH_RISK';
    let expectedSeverity: any = 'HIGH';
    let expectedRiskRange = { min: 25, max: 80 };
    const expectedRules: any[] = [];
    const expectedEvidence: string[] = [];
    const modifications: any[] = [];

    switch (i) {
      case 1: // Invalid permit number
        visualPermitNum = 'INVALID_PERMIT_000';
        modifications.push({ type: 'SYNTAX_ERROR', description: 'Permit number fails standard format' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 2: // Expired permit (Expired != Fake)
        validFrom = '2016-01-01';
        validUntil = '2021-01-01';
        modifications.push({ type: 'EXPIRED_CREDENTIAL', description: 'Permit validity lapsed' });
        expectedRules.push({ ruleId: 'R10', expectedStatus: 'WARN', expectedSeverity: 'MEDIUM' });
        expectedDecision = 'EXPIRED';
        expectedSeverity = 'MEDIUM';
        expectedRiskRange = { min: 5, max: 45 };
        break;

      case 3: // Invalid start date (Future start date beyond limit)
        validFrom = '2099-01-01';
        modifications.push({ type: 'FUTURE_START_DATE', description: 'Permit start date in distant future' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 4: // Invalid date order (ValidFrom > ValidUntil)
        validFrom = '2035-01-01';
        validUntil = '2025-01-01';
        modifications.push({ type: 'DATE_ORDER_ERROR', description: 'Start date exceeds Expiry date' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 5: // Holder name mismatch
        visualName = '123456';
        modifications.push({ type: 'NAME_MISMATCH', description: 'Holder name non-alphabetic' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 6: // Nationality mismatch
        visualNat = 'XYZ';
        modifications.push({ type: 'NATIONALITY_DISPARITY', description: 'Prohibited nationality' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 7: // Unauthorized area
        permittedArea = 'RESTRICTED_ZONE_MILITARY';
        modifications.push({ type: 'UNAUTHORIZED_AREA', description: 'Restricted military sector' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 8: // Unauthorized route
        permittedArea = 'UNAPPROVED_ILLEGAL_ROUTE';
        modifications.push({ type: 'ROUTE_MISMATCH', description: 'Unapproved transit corridor' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 9: // Purpose mismatch / Invalid number
        visualPermitNum = 'INVALID_COMMERCIAL_99';
        modifications.push({ type: 'PURPOSE_MISMATCH', description: 'Commercial vehicle on pedestrian permit' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 10: // Expired permit variant
        validFrom = '2015-01-01';
        validUntil = '2019-12-31';
        modifications.push({ type: 'EXPIRED_CREDENTIAL', description: 'Permit expired' });
        expectedRules.push({ ruleId: 'R10', expectedStatus: 'WARN', expectedSeverity: 'MEDIUM' });
        expectedDecision = 'EXPIRED';
        expectedSeverity = 'MEDIUM';
        expectedRiskRange = { min: 5, max: 45 };
        break;

      case 11: // QR mismatch
        visualPermitNum = 'CORRUPT_PERMIT_001';
        modifications.push({ type: 'QR_PAYLOAD_MISMATCH', description: 'QR data conflicts with printed text' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 12: // Barcode mismatch
        visualPermitNum = 'CORRUPT_PERMIT_002';
        modifications.push({ type: 'BARCODE_MISMATCH', description: 'Barcode checksum mismatch' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 13: // Issuer authority mismatch
        headerText = 'LOCAL UNRECOGNIZED POLICE';
        visualPermitNum = 'CORRUPT_PERMIT_003';
        modifications.push({ type: 'ISSUER_MISMATCH', description: 'Unrecognized issuing command' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 14: // Photo anomaly
        photoTampered = true;
        visualPermitNum = 'CORRUPT_PERMIT_004';
        modifications.push({ type: 'PHOTO_TAMPERING', description: 'Portrait edge anomaly' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 15: // Seal / Stamp forgery
        photoTampered = true;
        visualPermitNum = 'CORRUPT_PERMIT_005';
        modifications.push({ type: 'STAMP_FORGERY', description: 'Cloned authority stamp' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 80 };
        break;

      case 16: // Structural anomaly (Missing SSB border headers)
        headerText = 'GENERAL ENTRY PASS';
        visualPermitNum = 'CORRUPT_PERMIT_006';
        modifications.push({ type: 'STRUCTURAL_ANOMALY', description: 'Statutory SSB headers absent' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 60 };
        break;

      case 17: // Date manipulation
        validUntil = '2049-12-31';
        visualPermitNum = 'CORRUPT_PERMIT_007';
        modifications.push({ type: 'DATE_TAMPERING', description: 'Expiry year artificially inflated' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 18: // Multiple field inconsistencies
        visualPermitNum = '0000';
        visualName = '12345';
        modifications.push({ type: 'MULTI_FIELD_ERROR', description: 'Permit number and Name altered' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 90 };
        break;

      case 19: // Forensic manipulation
        photoTampered = true;
        visualPermitNum = 'CORRUPT_PERMIT_009';
        modifications.push({ type: 'FORENSIC_TAMPERING', description: 'Spliced photo and cloned seal' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 95 };
        break;

      case 20: // Corrupted / unreadable permit
        modifications.push({ type: 'UNREADABLE_IMAGE', description: 'Severe degradation' });
        expectedDecision = 'UNABLE_TO_VERIFY';
        expectedSeverity = 'CRITICAL';
        expectedRiskRange = { min: 0, max: 80 };
        break;
    }

    const rawOcr = i === 20
      ? ''
      : `${headerText}\nPERMIT NO: ${visualPermitNum}\nNAME: ${visualName}\nNATIONALITY: ${visualNat}\nVALID FROM: ${validFrom}\nVALID UNTIL: ${validUntil}\nPERMITTED AREA: ${permittedArea}`;

    cases.push({
      id,
      category: 'PERMIT',
      expectedClassification: 'border_permit',
      expectedTruth: 'INVALID',
      sourceData: {
        ...ident,
        permitNumber: visualPermitNum,
        name: visualName,
        nationality: visualNat,
        permittedArea,
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

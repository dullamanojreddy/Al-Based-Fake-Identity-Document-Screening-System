import { DocumentTestCase } from '../types';
import { generateSyntheticIdentity } from '../generators/syntheticIdentityGenerator';

export function generateDrivingLicenceScenarios(): DocumentTestCase[] {
  const cases: DocumentTestCase[] = [];

  const lightings = ['NORMAL', 'LOW', 'BRIGHT', 'GLARE'] as const;
  const distances = ['NORMAL', 'CLOSE', 'FAR'] as const;
  const angles = ['STRAIGHT', 'SLIGHT', 'MODERATE'] as const;
  const blurs = ['NONE', 'LOW', 'MEDIUM'] as const;
  const resolutions = ['HIGH', 'MEDIUM', 'LOW'] as const;

  // 1. 20 VALID DRIVING LICENCES (D-TRUE-001 to D-TRUE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `D-TRUE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 300);

    const vehicleClass = i % 2 === 0 ? 'LMV, MCWG' : 'LMV';
    const rawOcr = `UNION OF INDIA DRIVING LICENCE\nSTATE TRANSPORT DEPARTMENT\nDL NO: ${ident.dlNumber}\nNAME: ${ident.name}\nDOB: ${ident.dob}\nISSUE DATE: ${ident.issueDate}\nVALID TILL: ${ident.expiryDate}\nCOV: ${vehicleClass}\nADDRESS: ${ident.address}`;

    cases.push({
      id,
      category: 'DRIVING_LICENCE',
      expectedClassification: 'driving_license',
      expectedTruth: 'VALID',
      sourceData: {
        ...ident,
        vehicleClass,
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
        { ruleId: 'D01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'D03', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'G01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
      ],
      expectedDecision: 'CLEAR',
      expectedRiskRange: { min: 0, max: 20 },
      expectedEvidence: [],
      expectedSeverity: 'NONE',
    });
  }

  // 2. 20 FAKE / INVALID DRIVING LICENCES (D-FAKE-001 to D-FAKE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `D-FAKE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 330);

    let visualDlNum = ident.dlNumber;
    let visualName = ident.name;
    let visualDob = ident.dob;
    let visualIssue = ident.issueDate;
    let visualExpiry = ident.expiryDate;
    let vehicleClass = 'LMV, MCWG';
    let headerText = 'UNION OF INDIA DRIVING LICENCE\nSTATE TRANSPORT DEPARTMENT';
    let photoTampered = false;

    let expectedDecision: any = 'HIGH_RISK';
    let expectedSeverity: any = 'HIGH';
    let expectedRiskRange = { min: 25, max: 80 };
    const expectedRules: any[] = [];
    const expectedEvidence: string[] = [];
    const modifications: any[] = [];

    switch (i) {
      case 1: // Invalid DL number syntax
        visualDlNum = 'INVALID_DL_NUM';
        modifications.push({ type: 'SYNTAX_ERROR', description: 'DL Number does not match Sarathi regex' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 2: // Invalid jurisdiction state code (XX)
        visualDlNum = 'XX-0420230018921';
        modifications.push({ type: 'UNRECOGNIZED_JURISDICTION', description: "State code 'XX' unrecognized" });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 3: // Name mismatch / syntax error
        visualName = '123456';
        modifications.push({ type: 'NAME_MISMATCH', description: 'Name non-alphabetic' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 4: // DOB mismatch / future DOB
        visualDob = '2099-01-01';
        modifications.push({ type: 'FUTURE_DOB', description: 'DOB in the future' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 5: // Issue date after expiry date
        visualIssue = '2036-01-01';
        visualExpiry = '2026-01-01';
        modifications.push({ type: 'DATE_ORDER_ERROR', description: 'Issue exceeds Expiry' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 6: // Expired licence (Expired != Fake)
        visualIssue = '2008-01-01';
        visualExpiry = '2018-05-15';
        modifications.push({ type: 'EXPIRED_CREDENTIAL', description: 'Licence expired' });
        expectedRules.push({ ruleId: 'D07', expectedStatus: 'WARN', expectedSeverity: 'MEDIUM' });
        expectedEvidence.push('DOCUMENT_EXPIRED');
        expectedDecision = 'EXPIRED';
        expectedSeverity = 'MEDIUM';
        expectedRiskRange = { min: 5, max: 45 };
        break;

      case 7: // Expired licence variant
        visualIssue = '2010-01-01';
        visualExpiry = '2020-01-01';
        modifications.push({ type: 'EXPIRED_CREDENTIAL', description: 'Licence validity expired' });
        expectedRules.push({ ruleId: 'D07', expectedStatus: 'WARN', expectedSeverity: 'MEDIUM' });
        expectedDecision = 'EXPIRED';
        expectedSeverity = 'MEDIUM';
        expectedRiskRange = { min: 5, max: 45 };
        break;

      case 8: // Endorsement inconsistency
        vehicleClass = 'INVALID_CLASS_99';
        modifications.push({ type: 'ENDORSEMENT_ERROR', description: 'Hazardous endorsement conflict' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 9: // QR/Barcode mismatch
        visualDlNum = 'DL-04-INVALID-999';
        modifications.push({ type: 'QR_MISMATCH', description: 'Smart card chip QR payload mismatch' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 10: // Tampered expiry (after limits)
        visualExpiry = '2050-12-31';
        visualDlNum = 'DL-0000000000000';
        modifications.push({ type: 'DATE_TAMPERING', description: 'Expiry year artificially inflated' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 11: // Tampered DL number
        visualDlNum = 'DL-0000000000';
        modifications.push({ type: 'NUMBER_TAMPERING', description: 'Invalid serial format' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 12: // Tampered DOB (Impossible birth date)
        visualDob = '2099-12-31';
        modifications.push({ type: 'DOB_ANOMALY', description: 'Impossible birth date' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 13: // Photo replacement
        photoTampered = true;
        visualDlNum = 'DL-04-SPLICED-001';
        modifications.push({ type: 'PHOTO_SPLICING', description: 'Portrait edge anomaly' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 65, max: 100 };
        break;

      case 14: // Signature region anomaly
        photoTampered = true;
        visualDlNum = 'DL-04-SPLICED-002';
        modifications.push({ type: 'SIGNATURE_ANOMALY', description: 'Missing officer signature' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 65, max: 100 };
        break;

      case 15: // Structural anomaly (Missing Transport Department header)
        headerText = 'GENERAL PLASTIC CARD';
        visualDlNum = 'DL-04-SPLICED-003';
        modifications.push({ type: 'STRUCTURAL_ANOMALY', description: 'Statutory transport headers absent' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 80 };
        break;

      case 16: // Multiple field mismatches
        visualName = '12345';
        visualDlNum = '12345';
        modifications.push({ type: 'MULTI_FIELD_ERROR', description: 'Name and Number fail regex' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'HIGH_RISK';
        expectedRiskRange = { min: 25, max: 90 };
        break;

      case 17: // Forensic anomaly
        photoTampered = true;
        visualDlNum = 'DL-04-SPLICED-004';
        modifications.push({ type: 'FORENSIC_ANOMALY', description: 'ELA high energy variance' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 65, max: 100 };
        break;

      case 18: // Multiple forensic anomalies
        photoTampered = true;
        visualDlNum = 'DL-04-SPLICED-005';
        modifications.push({ type: 'MULTI_FORENSIC_TAMPERING', description: 'Photo splicing + Cloned seal' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 65, max: 100 };
        break;

      case 19: // Severe manipulation
        photoTampered = true;
        visualDlNum = 'XX-99999999999';
        modifications.push({ type: 'SEVERE_FRAUD', description: 'Unrecognized state + Spliced photo' });
        expectedRules.push({ ruleId: 'D03', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 20: // Corrupted / unreadable DL
        modifications.push({ type: 'UNREADABLE_IMAGE', description: 'Severe blur and blankness' });
        expectedDecision = 'UNABLE_TO_VERIFY';
        expectedSeverity = 'CRITICAL';
        expectedRiskRange = { min: 0, max: 80 };
        break;
    }

    const rawOcr = i === 20
      ? ''
      : `${headerText}\nDL NO: ${visualDlNum}\nNAME: ${visualName}\nDOB: ${visualDob}\nISSUE DATE: ${visualIssue}\nVALID TILL: ${visualExpiry}\nCOV: ${vehicleClass}\nADDRESS: ${ident.address}`;

    cases.push({
      id,
      category: 'DRIVING_LICENCE',
      expectedClassification: 'driving_license',
      expectedTruth: 'INVALID',
      sourceData: {
        ...ident,
        dlNumber: visualDlNum,
        name: visualName,
        dob: visualDob,
        issueDate: visualIssue,
        expiryDate: visualExpiry,
        vehicleClass,
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

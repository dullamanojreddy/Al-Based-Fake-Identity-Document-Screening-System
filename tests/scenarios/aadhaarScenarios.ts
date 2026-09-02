import { DocumentTestCase } from '../types';
import { generateSyntheticIdentity } from '../generators/syntheticIdentityGenerator';

export function generateAadhaarScenarios(): DocumentTestCase[] {
  const cases: DocumentTestCase[] = [];

  const lightings = ['NORMAL', 'LOW', 'BRIGHT', 'GLARE'] as const;
  const distances = ['NORMAL', 'CLOSE', 'FAR'] as const;
  const angles = ['STRAIGHT', 'SLIGHT', 'MODERATE'] as const;
  const blurs = ['NONE', 'LOW', 'MEDIUM'] as const;
  const resolutions = ['HIGH', 'MEDIUM', 'LOW'] as const;

  // 1. 20 VALID AADHAAR (A-TRUE-001 to A-TRUE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `A-TRUE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 200);

    const rawOcr = `GOVERNMENT OF INDIA BHARAT SARKAR\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\nNAME: ${ident.name}\nDOB: ${ident.dob}\nGENDER: ${ident.gender === 'M' ? 'MALE' : 'FEMALE'}\nAADHAAR NO: ${ident.aadhaarNumber}\nADDRESS: ${ident.address}\nHELP@UIDAI.GOV.IN WWW.UIDAI.GOV.IN`;

    cases.push({
      id,
      category: 'AADHAAR',
      expectedClassification: 'national_id',
      expectedTruth: 'VALID',
      sourceData: {
        ...ident,
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
        { ruleId: 'A01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'A03', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'A12', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
        { ruleId: 'G01', expectedStatus: 'PASS', expectedSeverity: 'LOW' },
      ],
      expectedDecision: 'CLEAR',
      expectedRiskRange: { min: 0, max: 20 },
      expectedEvidence: [],
      expectedSeverity: 'NONE',
    });
  }

  // 2. 20 FAKE / INVALID AADHAAR (A-FAKE-001 to A-FAKE-020)
  for (let i = 1; i <= 20; i++) {
    const id = `A-FAKE-${i.toString().padStart(3, '0')}`;
    const ident = generateSyntheticIdentity(i + 230);

    let visualNumber = ident.aadhaarNumber;
    let visualName = ident.name;
    let visualDob = ident.dob;
    let visualGender = ident.gender === 'M' ? 'MALE' : 'FEMALE';
    let headerText = 'GOVERNMENT OF INDIA BHARAT SARKAR\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA';
    let photoTampered = false;

    let expectedDecision: any = 'HIGH_RISK';
    let expectedSeverity: any = 'HIGH';
    let expectedRiskRange = { min: 25, max: 85 };
    const expectedRules: any[] = [];
    const expectedEvidence: string[] = [];
    const modifications: any[] = [];

    switch (i) {
      case 1: // Invalid Verhoeff checksum (1234 5678 9012)
        visualNumber = '1234 5678 9012';
        modifications.push({ type: 'CHECKSUM_FAILURE', field: 'aadhaarNumber', modifiedValue: visualNumber, description: 'Fails Verhoeff D5 algorithm' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedEvidence.push('AADHAAR_VERHOEFF_CHECKSUM_FAILURE');
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 2: // Prohibited leading digit (0 or 1)
        visualNumber = '0987 6543 2109';
        modifications.push({ type: 'PROHIBITED_LEADING_DIGIT', description: 'Starts with 0' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 3: // QR/Name mismatch
        visualNumber = '9876 5432 1001';
        modifications.push({ type: 'QR_NAME_MISMATCH', description: 'QR encoded name conflicts with visual name' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 4: // QR/DOB mismatch
        visualNumber = '9876 5432 1002';
        modifications.push({ type: 'QR_DOB_MISMATCH', description: 'QR encoded DOB conflicts with visual DOB' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 5: // QR/Gender mismatch
        visualNumber = '9876 5432 1003';
        modifications.push({ type: 'QR_GENDER_MISMATCH', description: 'QR encoded gender conflicts' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 6: // QR/Identifier mismatch
        visualNumber = '9876 5432 1004';
        modifications.push({ type: 'QR_ID_MISMATCH', description: 'QR number disagrees with visual number' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 7: // Altered visible identifier (arbitrary replacement that fails Verhoeff)
        visualNumber = '9876 5432 1098';
        modifications.push({ type: 'IDENTIFIER_ALTERED', description: 'Random 12-digit number failing Verhoeff' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 8: // Altered future DOB
        visualDob = '2099-12-31';
        modifications.push({ type: 'FUTURE_DOB', description: 'DOB in the future' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 9: // Altered Name syntax error
        visualName = '12345';
        modifications.push({ type: 'NAME_SYNTAX_ERROR', description: 'Name contains invalid characters' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 10: // Truncated header ("GOVERNMENT OF " missing INDIA)
        headerText = 'GOVERNMENT OF \nUNIQUE IDENTIFICATION AUTHORITY';
        modifications.push({ type: 'HEADER_TRUNCATION', description: "Header 'GOVERNMENT OF ' is missing sovereign territory 'INDIA'" });
        expectedRules.push({ ruleId: 'A12', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 11: // Suspicious photo region
        photoTampered = true;
        visualNumber = '9876 5432 1005';
        modifications.push({ type: 'PHOTO_TAMPERING', description: 'Portrait boundary anomaly' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 12: // Structural anomaly (Missing UIDAI statutory headers)
        headerText = 'GENERAL IDENTITY CARD';
        modifications.push({ type: 'STRUCTURAL_ANOMALY', description: 'Official UIDAI headers completely absent' });
        expectedDecision = 'REVIEW';
        expectedRiskRange = { min: 5, max: 40 };
        break;

      case 13: // Multiple field format mismatches
        visualDob = 'INVALID_DATE';
        visualGender = 'UNKNOWN';
        modifications.push({ type: 'MULTI_FIELD_ERROR', description: 'DOB and Gender fail profile regex' });
        expectedRules.push({ ruleId: 'G07', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        break;

      case 14: // Copy-move region
        photoTampered = true;
        visualNumber = '9876 5432 1006';
        modifications.push({ type: 'COPY_MOVE', description: 'Cloned security guilloche' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 15: // Text manipulation
        visualNumber = '9876 5432 1007';
        modifications.push({ type: 'FONT_MISALIGNMENT', description: 'Inconsistent font typography' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 16: // Severe image tampering
        photoTampered = true;
        visualNumber = '9999 8888 7777';
        modifications.push({ type: 'SEVERE_TAMPERING', description: 'Photo splicing + Verhoeff failure' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 17: // Invalid identifier structure (10 digits instead of 12)
        visualNumber = '4857 9036 21';
        modifications.push({ type: 'INVALID_LENGTH', description: '10-digit number' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 45, max: 100 };
        break;

      case 18: // Multiple mathematical + parity failures
        visualNumber = '1111 2222 3333';
        visualDob = '2099-01-01';
        modifications.push({ type: 'MULTI_MATH_FAILURE', description: 'Prohibited leading digit + Future DOB' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedRules.push({ ruleId: 'G08', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 19: // Compound tampering
        photoTampered = true;
        visualNumber = '1234 5678 9012';
        headerText = 'GOVERNMENT OF ';
        modifications.push({ type: 'COMPOUND_FRAUD', description: 'Truncated header + Spliced photo' });
        expectedRules.push({ ruleId: 'A03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedRules.push({ ruleId: 'A12', expectedStatus: 'FAIL', expectedSeverity: 'HIGH' });
        expectedDecision = 'CRITICAL';
        expectedRiskRange = { min: 70, max: 100 };
        break;

      case 20: // Blank / Empty Image
        modifications.push({ type: 'BLANK_IMAGE', description: 'Zero detectable text or edges' });
        expectedRules.push({ ruleId: 'G03', expectedStatus: 'FAIL', expectedSeverity: 'CRITICAL' });
        expectedDecision = 'UNABLE_TO_VERIFY';
        expectedSeverity = 'CRITICAL';
        expectedRiskRange = { min: 0, max: 100 };
        break;
    }

    const rawOcr = i === 20
      ? ''
      : `${headerText}\nNAME: ${visualName}\nDOB: ${visualDob}\nGENDER: ${visualGender}\nAADHAAR NO: ${visualNumber}\nADDRESS: ${ident.address}`;

    cases.push({
      id,
      category: 'AADHAAR',
      expectedClassification: 'national_id',
      expectedTruth: 'INVALID',
      sourceData: {
        ...ident,
        aadhaarNumber: visualNumber,
        name: visualName,
        dob: visualDob,
        gender: visualGender,
        rawOcr,
        photoTampered,
        isBlank: i === 20,
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

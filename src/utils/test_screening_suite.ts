import { classifyDocument } from './documentClassifier';
import { parseTD3MRZ, parseMRZ } from './mrzValidator';
import { extractIdentityFields } from './fieldExtractor';
import { calculateCompositeRisk } from './riskEngine';
import { DocumentField } from '../types';

interface TestResult {
  scenarioId: number;
  name: string;
  expectedOutcome: string;
  actualOutcome: string;
  passed: boolean;
  details?: string;
}

export function runFullScreeningTestSuite(): { results: TestResult[]; summary: { total: number; passed: number; failed: number } } {
  const results: TestResult[] = [];

  const addResult = (id: number, name: string, expected: string, actual: string, passed: boolean, details?: string) => {
    results.push({
      scenarioId: id,
      name,
      expectedOutcome: expected,
      actualOutcome: actual,
      passed,
      details,
    });
  };

  // Test 1: Valid synthetic passport
  const t1 = classifyDocument('sample_passport.jpg', 'REPUBLIC OF INDIA PASSPORT\nSURNAME: SHARMA\nGIVEN NAMES: ARJUN\nP<INDSHARMA<<ARJUN<VIKRAM<<<<<<<<<<<<<<<<<<<\nZ4829104<4IND8804128M3106096<<<<<<<<<<<<<<8');
  addResult(
    1,
    'Valid synthetic passport',
    'Supported Passport (Confidence >= 90%)',
    `Type: ${t1.detectedType}, Supported: ${t1.isSupported}, Conf: ${t1.confidence}%`,
    t1.isSupported && t1.detectedType === 'passport' && t1.confidence >= 90
  );

  // Test 2: Synthetic tampered passport
  const t2 = classifyDocument('tampered_passport_specimen.png', 'PASSPORT REPUBLIC OF INDIA\nSURNAME: VERMA\nP<INDVERMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<\nZ1234567<8IND9001014M3001018<<<<<<<<<<<<<<8');
  const t2Risk = calculateCompositeRisk(
    [{ key: 'passportNumber', label: 'Passport No.', value: 'Z1234567', confidence: 98 }],
    undefined,
    {
      overallTamperScore: 85,
      isTampered: true,
      photoReplacement: { detected: true, confidence: 96, splicingEdgeDetected: true, lightingInconsistency: true, elaAnomalyScore: 88, noiseResidualDisparity: 82, details: 'Photo splicing detected.' },
      textManipulation: { detected: false, confidence: 0, fontInconsistency: false, baselineMisalignment: false, alteredFields: [], digitalCopyPasteArtifacts: false, details: 'Clean' },
      stampForgery: { detected: false, confidence: 0, structuralSimilarityScore: 0, circularEdgeIntegrity: 0, inkBleedAnomaly: false, clonedSealDetected: false, details: 'Clean' },
      metadataAnalysis: { detected: false, editingSoftwareFound: false, softwareTraces: [], exifMissingOrStripped: false, creationDateAnomaly: false, compressionQuantizationAnomaly: false, details: 'Clean' },
      tamperBoxes: [],
    }
  );
  addResult(
    2,
    'Synthetic tampered passport',
    'Classified as Passport & Flags Tampering',
    `Type: ${t2.detectedType}, Risk: ${t2Risk.overallRiskScore}%, Findings: ${t2Risk.findings.length}`,
    t2.isSupported && t2Risk.findings.some(f => f.category === 'TAMPERING')
  );

  // Test 3: Passport with DOB mismatch
  const t3Fields: DocumentField[] = [
    { key: 'dob', label: 'Date of Birth', value: '14 MAY 1998', confidence: 96, source: 'visual_zone' },
  ];
  const t3Mrz = parseTD3MRZ(
    'P<INDSHARMA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<',
    'Z4829104<4IND8804128M3106096<<<<<<<<<<<<<<8', // 1988-04-12
    t3Fields
  );
  const t3Risk = calculateCompositeRisk(t3Fields, t3Mrz);
  addResult(
    3,
    'Passport with DOB mismatch',
    'DOB Mismatch Discrepancy Finding Triggered',
    `Mismatch Detected: ${t3Mrz.vizMismatchDetected}, Finding: ${t3Risk.findings.some(f => f.finding_id === 'dob_mismatch')}`,
    t3Mrz.vizMismatchDetected && t3Risk.findings.some(f => f.finding_id === 'dob_mismatch')
  );

  // Test 4: Passport with invalid MRZ checksum
  const t4Mrz = parseTD3MRZ(
    'P<INDSHARMA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<',
    'Z4829104<9IND8804128M3106096<<<<<<<<<<<<<<8' // Wrong check digit 9 instead of 4
  );
  const t4Risk = calculateCompositeRisk([], t4Mrz);
  addResult(
    4,
    'Passport with invalid MRZ checksum',
    'MRZ Checksum Failure Finding Triggered',
    `All Checksums Valid: ${t4Mrz.isAllChecksumsValid}, Status: ${t4Mrz.status}`,
    !t4Mrz.isAllChecksumsValid && t4Risk.findings.some(f => f.finding_id === 'mrz_checksum_failure')
  );

  // Test 5: Expired passport
  const t5Fields: DocumentField[] = [
    { key: 'expiryDate', label: 'Date of Expiry', value: '2022-01-15', confidence: 98 },
  ];
  const t5Risk = calculateCompositeRisk(t5Fields);
  addResult(
    5,
    'Expired passport',
    'Expired Travel Credential Finding Triggered',
    `Findings: ${t5Risk.findings.map(f => f.title).join('; ')}`,
    t5Risk.findings.some(f => f.finding_id === 'document_expired')
  );

  // Test 6: Face mismatch
  const t6Risk = calculateCompositeRisk(
    [],
    undefined,
    undefined,
    {
      isBiometricVerified: true,
      similarityScore: 42,
      matchStatus: 'MATCH_DISCREPANCY',
      antiSpoofing: { isLive: true, confidence: 99, screenReplayAttack: false, printAttackDetected: false, depthAnomaly: false },
      details: 'Low similarity',
    }
  );
  addResult(
    6,
    'Face mismatch',
    'Biometric Face Match Below Threshold Finding Triggered',
    `Risk Score: ${t6Risk.overallRiskScore}%, Bio Finding: ${t6Risk.findings.some(f => f.finding_id === 'bio_match')}`,
    t6Risk.findings.some(f => f.finding_id === 'bio_match')
  );

  // Test 7: Valid synthetic visa
  const t7 = classifyDocument('schengen_visa.png', 'SCHENGEN VISA ENTRY PERMIT\nVALID FROM 01-01-2025 UNTIL 01-07-2025\nENTRIES: MULT\nCONTROL NUMBER: V8892104');
  addResult(
    7,
    'Valid synthetic visa',
    'Visa classification (Supported = true)',
    `Detected: ${t7.detectedType}, Supported: ${t7.isSupported}`,
    t7.isSupported && t7.detectedType === 'visa'
  );

  // Test 8: Valid synthetic ID
  const t8 = classifyDocument('national_identity_card.jpg', 'REPUBLIC NATIONAL ID CARD\nCITIZEN ID NO: 8892-1049-2184\nNAME: JOHNATHAN DOE');
  addResult(
    8,
    'Valid synthetic ID',
    'National ID classification (Supported = true)',
    `Detected: ${t8.detectedType}, Supported: ${t8.isSupported}`,
    t8.isSupported && t8.detectedType === 'national_id'
  );

  // Test 9: Valid synthetic driving licence
  const t9 = classifyDocument('driver_license_front.jpg', 'STATE DRIVING LICENCE\nDL NO: DL-884129841\nVEHICLE CLASS: LMV');
  addResult(
    9,
    'Valid synthetic driving licence',
    'Driving Licence classification (Supported = true)',
    `Detected: ${t9.detectedType}, Supported: ${t9.isSupported}`,
    t9.isSupported && t9.detectedType === 'driving_license'
  );

  // Test 10: College document (NEGATIVE CASE)
  const t10 = classifyDocument('Second_Year_Memo_Download.pdf', 'COLLEGE OF ENGINEERING\nSEMESTER EXAMINATION MARKS TRANSCRIPT\nGRADE: A+ CGPA: 8.9\nREQUIREMENTS AND SUBJECT MARKS');
  addResult(
    10,
    'College document',
    'UNSUPPORTED_DOCUMENT (Gated & Rejected)',
    `Supported: ${t10.isSupported}, Type: ${t10.detectedType}, Conf: ${t10.confidence}%`,
    !t10.isSupported && t10.detectedType === 'unsupported_document'
  );

  // Test 11: Random PDF (NEGATIVE CASE)
  const t11 = classifyDocument('annual_financial_report_2025.pdf', 'ANNUAL FINANCIAL REPORT\nBALANCE SHEET & INCOME STATEMENT\nSECTION 4: OPERATING EXPENDITURES');
  addResult(
    11,
    'Random PDF',
    'UNSUPPORTED_DOCUMENT (Gated & Rejected)',
    `Supported: ${t11.isSupported}, Type: ${t11.detectedType}`,
    !t11.isSupported && t11.detectedType === 'unsupported_document'
  );

  // Test 12: Random image (NEGATIVE CASE)
  const t12 = classifyDocument('landscape_vacation_photo.jpg', '');
  addResult(
    12,
    'Random image',
    'UNSUPPORTED_DOCUMENT (Gated & Rejected)',
    `Supported: ${t12.isSupported}, Type: ${t12.detectedType}`,
    !t12.isSupported && t12.detectedType === 'unsupported_document'
  );

  // Test 13: Document containing the word "passport" but not a passport (NEGATIVE CASE)
  const t13 = classifyDocument('college_rules_and_syllabus.pdf', 'COLLEGE ADMISSION REQUIREMENTS:\nStudents must bring 2 passport size photographs along with fee receipt.');
  addResult(
    13,
    'Document containing the word "passport" but not a passport',
    'UNSUPPORTED_DOCUMENT (Gated & Rejected)',
    `Supported: ${t13.isSupported}, Type: ${t13.detectedType}`,
    !t13.isSupported && t13.detectedType === 'unsupported_document'
  );

  // Test 14: Document containing several dates without DOB labels (NEGATIVE CASE)
  const t14Text = 'Project Deadline: 14/05/2026\nMeeting Date: 22/08/2026\nSigned on: 01/01/2025';
  const t14Fields = extractIdentityFields(t14Text);
  const dobExtracted = t14Fields.fields.find(f => f.key === 'dob');
  addResult(
    14,
    'Document containing several dates without DOB label',
    'Zero Arbitrary DOB extraction (dob = undefined)',
    `DOB Extracted: ${dobExtracted ? dobExtracted.value : 'None (Protected)'}`,
    dobExtracted === undefined
  );

  // Test 15: Image containing random MRZ-like text without valid structure (NEGATIVE CASE)
  const t15Mrz = parseMRZ('Some random text <><><> hello world << 1234');
  addResult(
    15,
    'Random MRZ-like noise',
    'MRZ Rejected (mrz = null)',
    `Parsed MRZ: ${t15Mrz ? 'Valid' : 'Rejected (null)'}`,
    t15Mrz === null
  );

  const passedCount = results.filter(r => r.passed).length;

  return {
    results,
    summary: {
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
    },
  };
}

// Run when executed directly via tsx
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('test_screening_suite')) {
  console.log('====================================================');
  console.log('🧪 SENTINEL-ID 15-SCENARIO AUTOMATED SCREENING TEST SUITE');
  console.log('====================================================\n');
  const suite = runFullScreeningTestSuite();
  suite.results.forEach(r => {
    const icon = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} [Test ${r.scenarioId.toString().padStart(2, '0')}] ${r.name}`);
    console.log(`   Expected: ${r.expectedOutcome}`);
    console.log(`   Actual:   ${r.actualOutcome}\n`);
  });

  console.log('====================================================');
  console.log(`📊 SUMMARY: ${suite.summary.passed}/${suite.summary.total} TESTS PASSED (${((suite.summary.passed / suite.summary.total) * 100).toFixed(1)}%)`);
  console.log('====================================================');
}

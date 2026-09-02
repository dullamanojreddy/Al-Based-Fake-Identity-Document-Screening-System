import { classifyDocument } from './documentClassifier';
import { parseTD3MRZ, parseMRZ } from './mrzValidator';
import { calculateCompositeRisk } from './riskEngine';
import { evaluateAllRules } from './rulesEngine';
import { assessImageQuality } from './imageQualityAnalyzer';
import { validateVerhoeff } from './fieldConsistencyValidator';
import { DocumentField, ImageQualityAssessment, RawOcrDocument } from '../types';

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

  const defaultQuality: ImageQualityAssessment = {
    width: 1200,
    height: 800,
    blurScore: 92,
    glareScore: 95,
    exposureScore: 90,
    perspectiveScore: 90,
    documentCoverage: 90,
    overallScore: 92,
    isBlank: false,
    isExcessiveBlur: false,
    isExcessiveGlare: false,
    qualityGrade: 'GOOD',
  };

  const createRawDoc = (text: string): RawOcrDocument => ({
    fullText: text,
    lines: text.split('\n').map((l, i) => ({ text: l, confidence: 95, bbox: { x: 10, y: 10 + i * 5, width: 80, height: 4 }, lineNumber: i + 1 })),
    tokens: [],
    averageConfidence: 95,
  });

  // 1. Valid Passport
  const t1Ocr = createRawDoc('REPUBLIC OF INDIA PASSPORT\nSURNAME: SHARMA\nGIVEN NAMES: ARJUN\nP<INDSHARMA<<ARJUN<VIKRAM<<<<<<<<<<<<<<<<<<<\nZ4829104<4IND8804128M3106096<<<<<<<<<<<<<<8');
  const t1Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'sample_passport.jpg',
    imageQuality: defaultQuality,
    rawOcr: t1Ocr,
    fields: [
      { key: 'passportNumber', label: 'Passport No.', value: 'Z4829104', confidence: 99 },
      { key: 'surname', label: 'Surname', value: 'SHARMA', confidence: 99 },
      { key: 'dob', label: 'DOB', value: '1988-04-12', confidence: 99 },
      { key: 'expiryDate', label: 'Expiry Date', value: '2031-06-09', confidence: 99 },
    ],
    mrzData: parseTD3MRZ('P<INDSHARMA<<ARJUN<VIKRAM<<<<<<<<<<<<<<<<<<<', 'Z4829104<4IND8804128M3106096<<<<<<<<<<<<<<8'),
  });
  addResult(1, 'Valid passport (ICAO check digits & parity)', 'Decision CLEAR, Rule P06 PASS', `Decision: ${t1Rules.decisionState}, P06: ${t1Rules.ruleResults.find(r => r.ruleId === 'P06')?.status}`, t1Rules.decisionState === 'CLEAR');

  // 2. Invalid Passport MRZ Checksum
  const t2Mrz = parseTD3MRZ('P<INDSHARMA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<', 'Z4829104<9IND8804128M3106096<<<<<<<<<<<<<<8'); // check digit 9 instead of 4
  const t2Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'tampered_passport.jpg',
    imageQuality: defaultQuality,
    rawOcr: t1Ocr,
    fields: [{ key: 'passportNumber', label: 'Passport No.', value: 'Z4829104', confidence: 99 }],
    mrzData: t2Mrz,
  });
  addResult(2, 'Invalid passport MRZ checksum', 'Rule P06 FAIL, High Severity', `P06 Status: ${t2Rules.ruleResults.find(r => r.ruleId === 'P06')?.status}`, t2Rules.ruleResults.some(r => r.ruleId === 'P06' && r.status === 'FAIL'));

  // 3. Visual / MRZ DOB Mismatch
  const t3Fields = [{ key: 'dob', label: 'Date of Birth', value: '1995-01-01', confidence: 99 }];
  const t3Mrz = parseTD3MRZ('P<INDSHARMA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<', 'Z4829104<4IND8804128M3106096<<<<<<<<<<<<<<8', t3Fields); // MRZ has 1988-04-12
  const t3Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'passport_dob_mismatch.jpg',
    imageQuality: defaultQuality,
    rawOcr: t1Ocr,
    fields: t3Fields,
    mrzData: t3Mrz,
  });
  addResult(3, 'Visual / MRZ DOB Mismatch', 'Rule P08 FAIL & G09 FAIL', `P08: ${t3Rules.ruleResults.find(r => r.ruleId === 'P08')?.status}`, t3Rules.ruleResults.some(r => r.ruleId === 'P08' && r.status === 'FAIL'));

  // 4. Visual / MRZ Passport Number Mismatch
  const t4Fields = [{ key: 'passportNumber', label: 'Passport No.', value: 'A1234567', confidence: 99 }];
  const t4Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'passport_num_mismatch.jpg',
    imageQuality: defaultQuality,
    rawOcr: t1Ocr,
    fields: t4Fields,
    mrzData: t1Rules.ruleResults ? parseTD3MRZ('P<INDSHARMA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<', 'Z4829104<4IND8804128M3106096<<<<<<<<<<<<<<8') : null,
  });
  addResult(4, 'Visual / MRZ Passport Number Mismatch', 'Rule P07 FAIL', `P07: ${t4Rules.ruleResults.find(r => r.ruleId === 'P07')?.status}`, t4Rules.ruleResults.some(r => r.ruleId === 'P07' && r.status === 'FAIL'));

  // 5. Expired Passport
  const t5Fields = [
    { key: 'passportNumber', label: 'Passport No.', value: 'Z4829104', confidence: 99 },
    { key: 'expiryDate', label: 'Expiry Date', value: '2020-01-01', confidence: 99 },
  ];
  const t5Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'expired_passport.jpg',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('PASSPORT REPUBLIC OF INDIA\nEXPIRY: 2020-01-01'),
    fields: t5Fields,
  });
  addResult(5, 'Expired passport (Expired != Fake)', 'Decision State EXPIRED, Rule P15 WARN', `Decision: ${t5Rules.decisionState}, P15: ${t5Rules.ruleResults.find(r => r.ruleId === 'P15')?.status}`, t5Rules.decisionState === 'EXPIRED');

  // 6. Valid Visa
  const t6Rules = evaluateAllRules({
    documentType: 'visa',
    fileName: 'schengen_visa.png',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('SCHENGEN VISA ENTRY PERMIT\nVALID FROM 01-01-2025 UNTIL 01-07-2027\nENTRIES: MULT\nCONTROL NUMBER: V8892104'),
    fields: [
      { key: 'visaNumber', label: 'Visa Number', value: 'V8892104', confidence: 98 },
      { key: 'fullName', label: 'Name', value: 'JOHNATHAN DOE', confidence: 98 },
      { key: 'validFrom', label: 'Valid From', value: '2025-01-01', confidence: 98 },
      { key: 'expiryDate', label: 'Expiry Date', value: '2027-01-01', confidence: 98 },
    ],
  });
  addResult(6, 'Valid Visa profile evaluation', 'Rule V01 PASS, Decision CLEAR', `Decision: ${t6Rules.decisionState}`, t6Rules.decisionState === 'CLEAR');

  // 7. Expired Visa
  const t7Rules = evaluateAllRules({
    documentType: 'visa',
    fileName: 'expired_visa.png',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('VISA\nVALID UNTIL 01-01-2021'),
    fields: [{ key: 'expiryDate', label: 'Expiry Date', value: '2021-01-01', confidence: 98 }],
  });
  addResult(7, 'Expired Visa (Expired != Fake)', 'Decision State EXPIRED, Rule V07 WARN', `Decision: ${t7Rules.decisionState}`, t7Rules.decisionState === 'EXPIRED');

  // 8. Valid Aadhaar Checksum (485790362170 passes Verhoeff)
  const isAadhaarValid = validateVerhoeff('485790362170');
  const t8Rules = evaluateAllRules({
    documentType: 'national_id',
    fileName: 'aadhaar_card.jpg',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('GOVERNMENT OF INDIA BHARAT SARKAR\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\nRAHUL MISHRA\n4857 9036 2170'),
    fields: [
      { key: 'aadhaarNumber', label: 'Aadhaar No.', value: '4857 9036 2170', confidence: 99 },
      { key: 'fullName', label: 'Name', value: 'RAHUL MISHRA', confidence: 99 },
      { key: 'dob', label: 'DOB', value: '2002-11-17', confidence: 99 },
      { key: 'gender', label: 'Gender', value: 'MALE', confidence: 99 },
    ],
  });
  addResult(8, 'Valid Aadhaar Verhoeff Checksum (485790362170)', 'Rule A03 PASS, Decision CLEAR', `A03: ${t8Rules.ruleResults.find(r => r.ruleId === 'A03')?.status}`, isAadhaarValid && t8Rules.ruleResults.some(r => r.ruleId === 'A03' && r.status === 'PASS'));

  // 9. Invalid Aadhaar Checksum (123456789012 fails Verhoeff)
  const isFakeAadhaarValid = validateVerhoeff('123456789012');
  const t9Rules = evaluateAllRules({
    documentType: 'national_id',
    fileName: 'fake_aadhaar.jpg',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('GOVERNMENT OF \nMANISH DAS\n1234 5678 9012'),
    fields: [
      { key: 'aadhaarNumber', label: 'Aadhaar No.', value: '1234 5678 9012', confidence: 99 },
      { key: 'fullName', label: 'Name', value: 'MANISH DAS', confidence: 99 },
    ],
  });
  addResult(9, 'Invalid Aadhaar Verhoeff Checksum (123456789012)', 'Rule A03 FAIL, CRITICAL Severity', `A03: ${t9Rules.ruleResults.find(r => r.ruleId === 'A03')?.status}`, !isFakeAadhaarValid && t9Rules.ruleResults.some(r => r.ruleId === 'A03' && r.status === 'FAIL'));

  // 10. Aadhaar Corrupted Header ("GOVERNMENT OF ")
  addResult(10, 'Aadhaar Corrupted Header Truncation Check', 'Rule A12 FAIL', `A12: ${t9Rules.ruleResults.find(r => r.ruleId === 'A12')?.status}`, t9Rules.ruleResults.some(r => r.ruleId === 'A12' && r.status === 'FAIL'));

  // 11. Valid Driving Licence
  const t11Rules = evaluateAllRules({
    documentType: 'driving_license',
    fileName: 'valid_dl.jpg',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('UNION OF INDIA DRIVING LICENCE\nDL NO: DL-0420230018921\nNAME: VIKRAM CHOUDHARY\nVALID TILL: 2036-03-23\nCOV: LMV, MCWG'),
    fields: [
      { key: 'dlNumber', label: 'DL No.', value: 'DL-0420230018921', confidence: 98 },
      { key: 'fullName', label: 'Name', value: 'VIKRAM CHOUDHARY', confidence: 98 },
      { key: 'expiryDate', label: 'Expiry Date', value: '2036-03-23', confidence: 98 },
      { key: 'vehicleClass', label: 'Class', value: 'LMV, MCWG', confidence: 98 },
    ],
  });
  addResult(11, 'Valid Indian Driving Licence (Sarathi format)', 'Rule D01 & D03 PASS', `Decision: ${t11Rules.decisionState}`, t11Rules.decisionState === 'CLEAR');

  // 12. Expired Driving Licence
  const t12Rules = evaluateAllRules({
    documentType: 'driving_license',
    fileName: 'expired_dl.jpg',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('DRIVING LICENCE\nDL NO: MH1220050012345\nVALID TILL: 2019-01-01'),
    fields: [
      { key: 'dlNumber', label: 'DL No.', value: 'MH-1220050012345', confidence: 98 },
      { key: 'expiryDate', label: 'Expiry Date', value: '2019-01-01', confidence: 98 },
    ],
  });
  addResult(12, 'Expired Driving Licence (Expired != Fake)', 'Decision State EXPIRED, Rule D07 WARN', `Decision: ${t12Rules.decisionState}`, t12Rules.decisionState === 'EXPIRED');

  // 13. Valid Border Permit
  const t13Rules = evaluateAllRules({
    documentType: 'border_permit',
    fileName: 'border_permit.png',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('SASHASTRA SEEMA BAL BORDER PERMIT\nPERMIT NO: SSB-ICP-2026-8892\nNAME: ANIL KUMAR\nEXPIRY: 2026-12-31'),
    fields: [
      { key: 'permitNumber', label: 'Permit No.', value: 'SSB-ICP-2026-8892', confidence: 98 },
      { key: 'fullName', label: 'Name', value: 'ANIL KUMAR', confidence: 98 },
      { key: 'expiryDate', label: 'Expiry Date', value: '2026-12-31', confidence: 98 },
    ],
  });
  addResult(13, 'Valid Border Permit profile evaluation', 'Rule R01 PASS, Decision CLEAR', `Decision: ${t13Rules.decisionState}`, t13Rules.decisionState === 'CLEAR');

  // 14. Random College Document / Syllabus (Negative Gating)
  const t14Class = classifyDocument('college_syllabus_second_year.pdf', 'COLLEGE OF ENGINEERING\nSEMESTER EXAMINATION MARKS TRANSCRIPT\nGRADE: A+ CGPA: 8.9\nREQUIREMENTS AND SUBJECT MARKS');
  const t14Rules = evaluateAllRules({
    documentType: 'unsupported_document',
    fileName: 'college_syllabus_second_year.pdf',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('COLLEGE EXAMINATION MARKS'),
    fields: [],
  });
  addResult(14, 'Random College Syllabus (Gated & Rejected)', 'Decision UNSUPPORTED_DOCUMENT', `Decision: ${t14Rules.decisionState}, Gated: ${!t14Class.isSupported}`, !t14Class.isSupported && t14Rules.decisionState === 'UNSUPPORTED_DOCUMENT');

  // 15. Blank / Empty Image
  const blankQuality: ImageQualityAssessment = { ...defaultQuality, isBlank: true, overallScore: 5, qualityGrade: 'UNUSABLE' };
  const t15Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'blank_scan.jpg',
    imageQuality: blankQuality,
    rawOcr: createRawDoc(''),
    fields: [],
  });
  addResult(15, 'Blank / Empty Image Detection', 'Rule G03 FAIL, Decision UNABLE_TO_VERIFY', `Decision: ${t15Rules.decisionState}, G03: ${t15Rules.ruleResults.find(r => r.ruleId === 'G03')?.status}`, t15Rules.decisionState === 'UNABLE_TO_VERIFY');

  // 16. Heavily Blurred Image Quality Gate
  const blurQuality: ImageQualityAssessment = { ...defaultQuality, blurScore: 18, isExcessiveBlur: true, overallScore: 28, qualityGrade: 'UNUSABLE' };
  const t16Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'blurry_capture.jpg',
    imageQuality: blurQuality,
    rawOcr: createRawDoc('blur text'),
    fields: [],
  });
  addResult(16, 'Heavily Blurred Image Quality Gate', 'Decision UNABLE_TO_VERIFY', `Decision: ${t16Rules.decisionState}`, t16Rules.decisionState === 'UNABLE_TO_VERIFY');

  // 17. Date Logic: Future Date of Birth
  const t17Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'future_dob.jpg',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('PASSPORT\nDOB: 2099-01-01'),
    fields: [{ key: 'dob', label: 'DOB', value: '2099-01-01', confidence: 99 }],
  });
  addResult(17, 'Date Logic: Future Date of Birth Detection', 'Rule G08 FAIL', `G08: ${t17Rules.ruleResults.find(r => r.ruleId === 'G08')?.status}`, t17Rules.ruleResults.some(r => r.ruleId === 'G08' && r.status === 'FAIL'));

  // 18. Date Logic: Issue Date after Expiry Date
  const t18Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'invalid_date_order.jpg',
    imageQuality: defaultQuality,
    rawOcr: createRawDoc('PASSPORT\nISSUE: 2030-01-01\nEXPIRY: 2025-01-01'),
    fields: [
      { key: 'issueDate', label: 'Issue Date', value: '2030-01-01', confidence: 99 },
      { key: 'expiryDate', label: 'Expiry Date', value: '2025-01-01', confidence: 99 },
    ],
  });
  addResult(18, 'Date Logic: Issue Date > Expiry Date Detection', 'Rule G08 FAIL', `G08: ${t18Rules.ruleResults.find(r => r.ruleId === 'G08')?.status}`, t18Rules.ruleResults.some(r => r.ruleId === 'G08' && r.status === 'FAIL'));

  // 19. External Verification: Honest UNAVAILABLE Reporting
  const t19Rules = evaluateAllRules({
    documentType: 'passport',
    fileName: 'passport_ext.jpg',
    imageQuality: defaultQuality,
    rawOcr: t1Ocr,
    fields: t1Rules.ruleResults ? [] : [],
    externalVerification: {
      status: 'VERIFICATION_UNAVAILABLE',
      providerName: 'IVFRT / UIDAI Gateway',
      reason: 'No authenticated government gateway configured.',
      timestamp: new Date().toISOString(),
    },
  });
  addResult(19, 'External Authority Non-Simulation Guarantee', 'Rule E02 reports UNAVAILABLE', `E02 Status: ${t19Rules.ruleResults.find(r => r.ruleId === 'E02')?.explanation}`, t19Rules.ruleResults.some(r => r.ruleId === 'E02' && r.explanation.includes('UNAVAILABLE')));

  // 20. E-Passport Contactless Interface Check (Honest non-simulation)
  addResult(20, 'E-Passport NFC Non-Simulation Rule', 'Rule P24 reports NOT_APPLICABLE', `P24 Status: ${t1Rules.ruleResults.find(r => r.ruleId === 'P24')?.status}`, t1Rules.ruleResults.some(r => r.ruleId === 'P24' && r.status === 'NOT_APPLICABLE'));

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    results,
    summary: {
      total: results.length,
      passed: passedCount,
      failed: failedCount,
    },
  };
}

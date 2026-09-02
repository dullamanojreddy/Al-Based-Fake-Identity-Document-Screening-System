import { evaluateAllRules } from '../src/utils/rulesEngine';
import { calculateCompositeRisk } from '../src/utils/riskEngine';
import { parseTD3MRZ } from '../src/utils/mrzValidator';
import { classifyDocument } from '../src/utils/documentClassifier';
import { generateSyntheticIdentity, computeICAOCheckDigit } from './generators/syntheticIdentityGenerator';
import type {
  DocumentField,
  DocumentType,
  ImageQualityAssessment,
  RawOcrDocument,
  MRZData,
  TamperingForensics,
} from '../src/types';

/**
 * Manual verification of the real-world scenarios reported by the operator:
 *   "real Aadhaar / passport uploads are being flagged high-risk / fake"
 *
 * Mirrors the exact client-side pipeline wiring in NewScreeningWorkstation:
 *   rulesEngine (scanner runs it with mrzData:null) -> calculateCompositeRisk with
 *   the parsed MRZ (or null when no MRZ zone was OCR-captured).
 */

const GOOD_IMAGE: ImageQualityAssessment = {
  width: 1200,
  height: 800,
  blurScore: 95,
  glareScore: 92,
  exposureScore: 90,
  perspectiveScore: 90,
  documentCoverage: 92,
  overallScore: 92,
  isBlank: false,
  isExcessiveBlur: false,
  isExcessiveGlare: false,
  qualityGrade: 'GOOD',
};

function makeRawOcr(text: string, lines: string[], avgConf: number): RawOcrDocument {
  return {
    fullText: text,
    lines: lines.map((t, i) => ({
      text: t,
      confidence: avgConf,
      bbox: { x: 10, y: 10 + i * 6, width: 80, height: 4 },
      lineNumber: i + 1,
    })),
    tokens: [],
    averageConfidence: avgConf,
  };
}

type ScenarioResult = {
  name: string;
  classification: ReturnType<typeof classifyDocument>;
  decisionState: string;
  ruleRefs: { ruleId: string; status: string; severity: string }[];
  risk: number;
  status: 'CLEARED' | 'SECONDARY_INSPECTION' | 'DETAINED' | 'UNSUPPORTED_DOCUMENT';
  ok: boolean;
  notes: string[];
};

function statusOf(decisionState: string, risk: number): ScenarioResult['status'] {
  if (decisionState === 'CRITICAL' || risk >= 66) return 'DETAINED';
  if (decisionState === 'HIGH_RISK' || risk > 25) return 'SECONDARY_INSPECTION';
  return 'CLEARED';
}

function runScenario(
  name: string,
  opts: {
    docType: DocumentType;
    fileName: string;
    ocrText: string;
    ocrLines: string[];
    ocrConf: number;
    fields: DocumentField[];
    mrzResult: MRZData | null;
    expectClear?: boolean;
    expectNotDetained?: boolean;
  }
): ScenarioResult {
  const classification = classifyDocument(opts.fileName, opts.ocrText, opts.docType);
  const rawOcr = makeRawOcr(opts.ocrText, opts.ocrLines, opts.ocrConf);

  const rules = evaluateAllRules({
    documentType: opts.docType,
    fileName: opts.fileName,
    imageQuality: GOOD_IMAGE,
    rawOcr,
    fields: opts.fields,
    mrzData: null, // scanner always evaluates rules without MRZ in the UI path
  });

  const risk = calculateCompositeRisk(
    opts.fields,
    opts.mrzResult,
    null as unknown as TamperingForensics,
    null as unknown as never,
    null as unknown as never,
    rules.ruleResults
  );

  const status = statusOf(rules.decisionState, risk.overallRiskScore);
  const notes: string[] = [];
  if (opts.expectClear && status !== 'CLEARED') notes.push(`expected CLEARED but got ${status} (risk ${risk.overallRiskScore})`);
  if (opts.expectNotDetained && status === 'DETAINED') notes.push(`DETAINED at risk ${risk.overallRiskScore}`);

  return {
    name,
    classification,
    decisionState: rules.decisionState,
    ruleRefs: rules.ruleResults
      .filter(r => r.ruleId === 'A03' || r.ruleId === 'P03' || r.ruleId === 'P06' || r.ruleId === 'P13' || r.ruleId === 'G07' || r.ruleId === 'P14')
      .map(r => ({ ruleId: r.ruleId, status: r.status, severity: r.severity })),
    risk: risk.overallRiskScore,
    status,
    ok: opts.expectNotDetained ? status !== 'DETAINED' && notes.length === 0 : notes.length === 0 && (opts.expectClear === undefined || status === 'CLEARED'),
    notes,
  };
}
// ---------------------------------------------------------------------------
const ident = generateSyntheticIdentity(1); // ARJUN SHARMA
const aadhaarDigits = ident.aadhaarNumber.replace(/\s/g, '');
const maskedAadhaar = `XXXX XXXX ${aadhaarDigits.slice(8)}`;
const aadhaarOcrWrongDigit = `${aadhaarDigits.slice(0, 10)}${(parseInt(aadhaarDigits[10], 10) + 1) % 10}${aadhaarDigits.slice(11)}`;
const fullAadhaarPretty = `${aadhaarDigits.slice(0, 4)} ${aadhaarDigits.slice(4, 8)} ${aadhaarDigits.slice(8)}`;
const aadhaarRawOcr = `GOVERNMENT OF INDIA BHARAT SARKAR\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\nNAME: ${ident.name}\nDOB: ${ident.dob}\nGENDER: ${ident.gender === 'M' ? 'MALE' : 'FEMALE'}\nAADHAAR NO: ${fullAadhaarPretty}\nADDRESS: ${ident.address}`;
const aadhaarLines = aadhaarRawOcr.split('\n');

// Passport MRZ (valid 7-3-1)
const docNum9 = ident.passportNumber.padEnd(9, '<');
const cdDoc = computeICAOCheckDigit(docNum9);
const mrzDob = ident.yymmddDob;
const cdDob = computeICAOCheckDigit(mrzDob);
const mrzExp = ident.yymmddExpiry;
const cdExp = computeICAOCheckDigit(mrzExp);
const opt14 = '<<<<<<<<<<<<<<';
const cdOpt = '<';
const compSource = docNum9 + cdDoc + mrzDob + cdDob + mrzExp + cdExp + opt14 + cdOpt;
const cdComp = computeICAOCheckDigit(compSource);
const passportLine1 = `P<IND${ident.surname}<<${ident.givenNames}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44).padEnd(44, '<');
const passportLine2 = `${docNum9}${cdDoc}IND${mrzDob}${cdDob}${ident.gender}${mrzExp}${cdExp}${opt14}${cdOpt}${cdComp}`;

const passportOcr = `PASSPORT / PASSEPORT\nREPUBLIC OF INDIA / REPUBLIQUE D'INDE\nTYPE: P CODE: IND PASSPORT NO: ${ident.passportNumber}\nSURNAME: ${ident.surname}\nGIVEN NAMES: ${ident.givenNames}\nNATIONALITY: INDIAN\nSEX: ${ident.gender} DOB: ${ident.dob}\nDATE OF ISSUE: ${ident.issueDate} DATE OF EXPIRY: ${ident.expiryDate}\n${passportLine1}\n${passportLine2}`;
const passportLines = passportOcr.split('\n');

const scenarios: ScenarioResult[] = [];

// --- Scenario 1: GENUINE Aadhaar (full 12-digit, good OCR) -> must CLEAR ---
scenarios.push(runScenario('Genuine Aadhaar (full 12-digit, good OCR)', {
  docType: 'national_id',
  fileName: 'aadhaar_card.jpg',
  ocrText: aadhaarRawOcr,
  ocrLines: aadhaarLines,
  ocrConf: 92,
  fields: [
    { key: 'aadhaarNumber', label: 'Aadhaar Number', value: fullAadhaarPretty, confidence: 95, labelDetected: true, validation: 'VALID' },
    { key: 'fullName', label: 'Name', value: ident.name, confidence: 95, labelDetected: true, validation: 'VALID' },
    { key: 'dob', label: 'DOB', value: ident.dob, confidence: 95, labelDetected: true, validation: 'VALID' },
    { key: 'gender', label: 'Gender', value: ident.gender === 'M' ? 'MALE' : 'FEMALE', confidence: 95, labelDetected: true, validation: 'VALID' },
  ],
  mrzResult: null,
  expectClear: true,
  expectNotDetained: true,
}));

// --- Scenario 2: REAL masked e-Aadhaar (XXXX XXXX 1234) -> NOT detained ---
scenarios.push(runScenario('Real masked e-Aadhaar (XXXX XXXX 1234)', {
  docType: 'national_id',
  fileName: 'masked_aadhaar.jpg',
  ocrText: aadhaarRawOcr.replace(fullAadhaarPretty, maskedAadhaar),
  ocrLines: aadhaarRawOcr.replace(fullAadhaarPretty, maskedAadhaar).split('\n'),
  ocrConf: 90,
  fields: [
    { key: 'aadhaarNumber', label: 'Aadhaar Number', value: maskedAadhaar, confidence: 94, labelDetected: true, validation: 'VALID' },
    { key: 'fullName', label: 'Name', value: ident.name, confidence: 94, labelDetected: true, validation: 'VALID' },
    { key: 'dob', label: 'DOB', value: ident.dob, confidence: 94, labelDetected: true, validation: 'VALID' },
    { key: 'gender', label: 'Gender', value: ident.gender === 'M' ? 'MALE' : 'FEMALE', confidence: 94, labelDetected: true, validation: 'VALID' },
  ],
  mrzResult: null,
  expectNotDetained: true,
}));

// --- Scenario 3: Genuine Aadhaar, OCR flips one digit (Verhoeff fails, conf 82) -> review, NOT critical ---
scenarios.push(runScenario('Genuine Aadhaar with single OCR digit error (conf 82)', {
  docType: 'national_id',
  fileName: 'IMG_20250103.jpg',
  ocrText: aadhaarRawOcr.replace(aadhaarDigits, aadhaarOcrWrongDigit),
  ocrLines: aadhaarRawOcr.replace(aadhaarDigits, aadhaarOcrWrongDigit).split('\n'),
  ocrConf: 78,
  fields: [
    { key: 'aadhaarNumber', label: 'Aadhaar Number', value: `${aadhaarOcrWrongDigit.slice(0, 4)} ${aadhaarOcrWrongDigit.slice(4, 8)} ${aadhaarOcrWrongDigit.slice(8)}`, confidence: 82, labelDetected: true, validation: 'VALID' },
    { key: 'fullName', label: 'Name', value: ident.name, confidence: 92, labelDetected: true, validation: 'VALID' },
    { key: 'dob', label: 'DOB', value: ident.dob, confidence: 90, labelDetected: true, validation: 'VALID' },
    { key: 'gender', label: 'Gender', value: ident.gender === 'M' ? 'MALE' : 'FEMALE', confidence: 95, labelDetected: true, validation: 'VALID' },
  ],
  mrzResult: null,
  expectNotDetained: true,
}));
// --- Scenario 4: Genuine Passport with fully readable MRZ -> must CLEAR ---
scenarios.push(runScenario('Genuine Passport (readable MRZ, valid checksums)', {
  docType: 'passport',
  fileName: 'passport.jpg',
  ocrText: passportOcr,
  ocrLines: passportLines,
  ocrConf: 95,
  fields: [
    { key: 'passportNumber', label: 'Passport No.', value: ident.passportNumber, confidence: 99, labelDetected: true, validation: 'VALID' },
    { key: 'surname', label: 'Surname', value: ident.surname, confidence: 99, labelDetected: true, validation: 'VALID' },
    { key: 'givenNames', label: 'Given Names', value: ident.givenNames, confidence: 99, labelDetected: true, validation: 'VALID' },
    { key: 'dob', label: 'DOB', value: ident.dob, confidence: 99, labelDetected: true, validation: 'VALID' },
    { key: 'issueDate', label: 'Issue Date', value: ident.issueDate, confidence: 99, labelDetected: true, validation: 'VALID' },
    { key: 'expiryDate', label: 'Expiry Date', value: ident.expiryDate, confidence: 99, labelDetected: true, validation: 'VALID' },
    { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99, labelDetected: true, validation: 'VALID' },
    { key: 'sex', label: 'Sex', value: ident.gender, confidence: 99, labelDetected: true, validation: 'VALID' },
  ],
  mrzResult: parseTD3MRZ(passportLine1, passportLine2),
  expectClear: true,
  expectNotDetained: true,
}));

// --- Scenario 5: Genuine Passport, MRZ zone NOT OCR-readable -> NOT detained (PREVIOUSLY DETAINED via fabricated MRZ) ---
scenarios.push(runScenario('Genuine Passport (MRZ not captured) - previously DETAINED', {
  docType: 'passport',
  fileName: 'passport_front.jpg',
  ocrText: passportOcr.replace(`${passportLine1}\n${passportLine2}`, ''),
  ocrLines: passportOcr.replace(`${passportLine1}\n${passportLine2}`, '').split('\n'),
  ocrConf: 88,
  fields: [
    { key: 'passportNumber', label: 'Passport No.', value: ident.passportNumber, confidence: 96, labelDetected: true, validation: 'VALID' },
    { key: 'surname', label: 'Surname', value: ident.surname, confidence: 96, labelDetected: true, validation: 'VALID' },
    { key: 'givenNames', label: 'Given Names', value: ident.givenNames, confidence: 96, labelDetected: true, validation: 'VALID' },
    { key: 'dob', label: 'DOB', value: ident.dob, confidence: 96, labelDetected: true, validation: 'VALID' },
    { key: 'expiryDate', label: 'Expiry Date', value: ident.expiryDate, confidence: 96, labelDetected: true, validation: 'VALID' },
  ],
  mrzResult: null,
  expectNotDetained: true,
}));

// --- Scenario 6: Genuine Passport, OCR garbled number (conf 70) -> WARN not FAIL ---
scenarios.push(runScenario('Genuine Passport, OCR garbled number (conf 70)', {
  docType: 'passport',
  fileName: 'IMG_8821.jpg',
  ocrText: passportOcr.replace(ident.passportNumber, 'Z4829O4'),
  ocrLines: passportOcr.replace(ident.passportNumber, 'Z4829O4').split('\n'),
  ocrConf: 70,
  fields: [
    { key: 'passportNumber', label: 'Passport No.', value: 'Z4829O4', confidence: 74, labelDetected: true, validation: 'VALID' },
    { key: 'surname', label: 'Surname', value: ident.surname, confidence: 96, labelDetected: true, validation: 'VALID' },
    { key: 'givenNames', label: 'Given Names', value: ident.givenNames, confidence: 96, labelDetected: true, validation: 'VALID' },
    { key: 'dob', label: 'DOB', value: ident.dob, confidence: 96, labelDetected: true, validation: 'VALID' },
    { key: 'expiryDate', label: 'Expiry Date', value: ident.expiryDate, confidence: 96, labelDetected: true, validation: 'VALID' },
  ],
  mrzResult: null,
  expectNotDetained: true,
}));
// ---------------------------------------------------------------------------
console.log('================================================================');
console.log('REAL-DOCUMENT BEHAVIOR VERIFICATION (operator-reported scenarios)');
console.log('================================================================');
let allOk = true;
for (const s of scenarios) {
  console.log(`\n[${s.ok ? 'PASS' : 'FAIL'}] ${s.name}`);
  console.log(`  classification : supported=${s.classification.isSupported} type=${s.classification.detectedType} conf=${s.classification.confidence}`);
  console.log(`  decisionState  : ${s.decisionState}`);
  console.log(`  composite risk : ${s.risk} -> ${s.status}`);
  console.log(`  key rules      : ${s.ruleRefs.map(r => `${r.ruleId}=${r.status}(${r.severity})`).join(', ')}`);
  if (s.notes.length) console.log(`  notes          : ${s.notes.join('; ')}`);
  if (!s.ok) allOk = false;
}
console.log('\n================================================================');
console.log(allOk ? 'ALL OPERATOR SCENARIOS NOW BEHAVE CORRECTLY' : 'SOME SCENARIOS STILL FAIL');
console.log('================================================================');
process.exit(allOk ? 0 : 1);
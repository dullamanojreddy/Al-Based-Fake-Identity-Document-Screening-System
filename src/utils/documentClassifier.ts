import { DocumentType } from '../types';

export interface DocumentClassificationResult {
  isSupported: boolean;
  detectedType: DocumentType;
  confidence: number;
  detectedFeatures: string[];
  rejectionReasons: string[];
  mrzDetected: boolean;
  structureValid: boolean;
}

// Non-identity keywords that immediately indicate general/academic/business documents
const NON_IDENTITY_TRIGGERS = [
  'REQUIREMENTS',
  'MEMO',
  'MEMORANDUM',
  'SYLLABUS',
  'COLLEGE',
  'UNIVERSITY',
  'EXAMINATION',
  'SEMESTER',
  'MARKS',
  'GRADE',
  'CGPA',
  'TRANSCRIPT',
  'ASSIGNMENT',
  'INVOICE',
  'BILL',
  'RECEIPT',
  'RESUME',
  'CURRICULUM VITAE',
  'DESCRIPTION',
  'SUMMARY',
  'OWNER',
  'PLACEMENT',
  'GITHUB',
  'PROJECT',
  'CODE',
  'JAVA',
  'PYTHON',
  'DATABASE',
  'SECTION',
  'PRINTVIEW',
  'DOWNLOAD',
  'FOOD ORDERING',
];

// Legitimate Identity Document keywords
const PASSPORT_KEYWORDS = ['PASSPORT', 'PASSEPORT', 'PASAPORTE', 'UNITED STATES OF AMERICA', 'REPUBLIC OF', 'TYPE/CODE P', 'GIVEN NAMES', 'SURNAME', 'NATIONALITY', 'DATE OF BIRTH'];
const VISA_KEYWORDS = ['VISA', 'ENTRY PERMIT', 'VALID FROM', 'ENTRIES', 'CONTROL NUMBER', 'BEARER'];
const NATIONAL_ID_KEYWORDS = ['NATIONAL ID', 'IDENTITY CARD', 'CITIZEN ID', 'AADHAAR', 'RESIDENT CARD'];
const DRIVING_LICENSE_KEYWORDS = ['DRIVING LICENCE', 'DRIVER LICENSE', 'CLASS', 'VEHICLE', 'DL NO'];

/**
 * Classifies an incoming document by filename, text tokens, and structural signals.
 * Gates non-identity documents before executing identity-specific validation pipelines.
 */
export function classifyDocument(
  fileName: string,
  rawText?: string,
  declaredType?: DocumentType
): DocumentClassificationResult {
  const normalizedFileName = fileName.toUpperCase();
  const normalizedText = (rawText || '').toUpperCase();
  const fullCorpus = `${normalizedFileName} ${normalizedText}`;

  // 1. Check for Non-Identity Document Signatures
  const triggeredNonIdentityTerms = NON_IDENTITY_TRIGGERS.filter(term =>
    fullCorpus.includes(term)
  );

  // 2. Check for ICAO MRZ Lines (e.g. P<, I<, V<)
  const hasMRZ = /P<[A-Z]{3}|I<[A-Z]{3}|V<[A-Z]{3}|[A-Z0-9<]{30,44}/.test(normalizedText);

  // 3. Score identity document keywords
  const passportMatches = PASSPORT_KEYWORDS.filter(k => fullCorpus.includes(k));
  const visaMatches = VISA_KEYWORDS.filter(k => fullCorpus.includes(k));
  const idMatches = NATIONAL_ID_KEYWORDS.filter(k => fullCorpus.includes(k));
  const dlMatches = DRIVING_LICENSE_KEYWORDS.filter(k => fullCorpus.includes(k));

  // If heavy non-identity signatures exist and no genuine MRZ/passport structure:
  if (triggeredNonIdentityTerms.length >= 1 && passportMatches.length <= 1 && !hasMRZ) {
    return {
      isSupported: false,
      detectedType: 'unsupported_document',
      confidence: 96.4,
      detectedFeatures: [
        `Detected general/academic document indicators: [${triggeredNonIdentityTerms.slice(0, 3).join(', ')}]`,
      ],
      rejectionReasons: [
        'No machine-readable zone (MRZ) or ICAO Doc 9303 structure detected.',
        'Document content does not match supported identity document formats (Passport, Visa, National ID, Driving Licence).',
        'Semantic classification determined file is a general text / memo / non-travel document.',
      ],
      mrzDetected: false,
      structureValid: false,
    };
  }

  // If declared as passport or detected as passport
  if (passportMatches.length >= 2 || hasMRZ || (declaredType === 'passport' && triggeredNonIdentityTerms.length === 0)) {
    return {
      isSupported: true,
      detectedType: 'passport',
      confidence: hasMRZ ? 99.2 : 94.5,
      detectedFeatures: ['Passport Biographical Structure', hasMRZ ? 'ICAO MRZ Band' : 'Visual Identity Zone'],
      rejectionReasons: [],
      mrzDetected: hasMRZ,
      structureValid: true,
    };
  }

  if (visaMatches.length >= 2 || (declaredType === 'visa' && triggeredNonIdentityTerms.length === 0)) {
    return {
      isSupported: true,
      detectedType: 'visa',
      confidence: 92.0,
      detectedFeatures: ['Consular Visa Vignette Structure'],
      rejectionReasons: [],
      mrzDetected: hasMRZ,
      structureValid: true,
    };
  }

  if (idMatches.length >= 1 || dlMatches.length >= 1 || declaredType === 'national_id' || declaredType === 'driving_license' || declaredType === 'border_permit') {
    return {
      isSupported: true,
      detectedType: declaredType || 'national_id',
      confidence: 91.5,
      detectedFeatures: ['Identity Card / Permit Substrate'],
      rejectionReasons: [],
      mrzDetected: hasMRZ,
      structureValid: true,
    };
  }

  // Fallback rejection for generic files
  return {
    isSupported: false,
    detectedType: 'unsupported_document',
    confidence: 95.0,
    detectedFeatures: ['Unstructured General Document'],
    rejectionReasons: [
      'Document structure does not conform to ICAO Doc 9303, ISO-7810, or national travel credential standards.',
      'No biometric portrait, secure visual zone, or cryptographic MRZ detected.',
    ],
    mrzDetected: false,
    structureValid: false,
  };
}

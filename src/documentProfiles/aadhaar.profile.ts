import { DocumentProfile } from './passport.profile';

export const AadhaarProfile: DocumentProfile = {
  documentType: 'national_id',
  displayName: 'Aadhaar Card (UIDAI Statutory Credential)',
  issuingJurisdiction: 'INDIA / UIDAI',
  expectedAspectRatios: [1.4, 1.7], // Standard credit-card / letter ID size
  expectedHeaders: [
    'GOVERNMENT OF INDIA', 'BHARAT SARKAR', 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA',
    'MERA AADHAAR', 'AADHAAR', 'AADHAR', 'UIDAI'
  ],
  fieldDefinitions: [
    {
      key: 'aadhaarNumber',
      label: 'Aadhaar (UID) Number',
      required: true,
      // Accepts full 12-digit UID (4-4-4 groups, starts 2-9) AND UIDAI's official
      // masked e-Aadhaar format (e.g. "XXXX XXXX 1234", "XXXX-XXXX-1234").
      regexPattern: /^[2-9X][0-9X]{3}[\s-]*[0-9X]{4}[\s-]*\d{4}$/i,
      labelPatterns: [/AADHAAR\s*(?:NO|NUMBER|NUR)?/i, /AADHAR\s*(?:NO|NUMBER)?/i, /\bVID\b/i],
      defaultBoundingBox: { x: 26, y: 53, width: 44, height: 6 },
      formatHelp: '12-digit number (4-4-4 format), starting with 2-9',
    },
    {
      key: 'fullName',
      label: 'Full Name',
      required: true,
      regexPattern: /^[A-Z\s.-]{3,40}$/i,
      labelPatterns: [/\bNAME\b/i, /\bनाम\b/i, /HOLDER\s*NAME/i],
      defaultBoundingBox: { x: 26, y: 32, width: 38, height: 6 },
      formatHelp: 'Full citizen name in English and/or regional script',
    },
    {
      key: 'dob',
      label: 'Date of Birth / Year of Birth',
      required: true,
      regexPattern: /^\d{4}[-/]\d{2}[-/]\d{2}$|^\d{2}[-/]\d{2}[-/]\d{4}$|^\d{4}$/i,
      labelPatterns: [/DATE\s*OF\s*BIRTH/i, /\bDOB\b/i, /YEAR\s*OF\s*BIRTH/i, /\bYOB\b/i, /जन्म\s*तिथि/i],
      defaultBoundingBox: { x: 26, y: 39, width: 28, height: 5 },
      formatHelp: 'DD/MM/YYYY, YYYY-MM-DD, or YYYY',
    },
    {
      key: 'gender',
      label: 'Gender',
      required: true,
      regexPattern: /^MALE$|^FEMALE$|^TRANSGENDER$/i,
      labelPatterns: [/\bGENDER\b/i, /\bSEX\b/i, /\bलिंग\b/i],
      defaultBoundingBox: { x: 26, y: 46, width: 20, height: 5 },
      formatHelp: 'MALE, FEMALE, or TRANSGENDER',
    },
    {
      key: 'address',
      label: 'Residential Address',
      required: false,
      regexPattern: /.+/,
      labelPatterns: [/ADDRESS/i, /पता/i, /C\/O/i, /S\/O/i, /D\/O/i, /W\/O/i],
      defaultBoundingBox: { x: 26, y: 61, width: 46, height: 8 },
      formatHelp: 'Full residential address with 6-digit PIN code',
    },
  ],
  dateRules: {
    hasDob: true,
    hasIssueDate: false,
    hasExpiryDate: false,
    maxValidityYears: 100,
    allowNoExpiry: true,
  },
  qrRules: {
    supported: true,
    format: 'UIDAI_SECURE_QR',
    signatureVerificationCapable: true,
    encodedFields: ['name', 'dob', 'gender', 'lastFourDigits', 'address'],
  },
  securityFeatures: [
    { name: 'UIDAI Verhoeff Modulus D5', description: 'Dihedral group D5 mathematical checksum on 12-digit UID', criticality: 'HIGH' },
    { name: 'Secure 2D QR Barcode', description: 'High-density digitally signed UIDAI Quick Response code', criticality: 'HIGH' },
    { name: 'Ashoka Lion Capital Emblem', description: 'National Emblem of India security print', criticality: 'MEDIUM' },
    { name: 'UIDAI Slogan & Wave Lines', description: '"आधार — आम आदमी का अधिकार" guilloche wave microprint', criticality: 'MEDIUM' },
  ],
  jurisdictionRules: {
    recognizedIssuingStates: ['IND'],
    documentNumberRegex: /^[2-9X][0-9X]{3}[\s-]*[0-9X]{4}[\s-]*\d{4}$/i,
  },
  riskWeights: {
    cryptographicFailure: 95,
    checksumFailure: 90, // Verhoeff failure is extremely strong indicator of fake number
    crossMismatch: 80,
    forensicAnomaly: 60,
    structuralAnomaly: 50,
    ocrUncertainty: 20,
    metadataAnomaly: 15,
  },
};

import { DocumentType, BoundingBoxCoordinates } from '../types';

export interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
  regexPattern?: RegExp;
  labelPatterns: RegExp[];
  defaultBoundingBox: BoundingBoxCoordinates;
  formatHelp: string;
}

export interface DocumentProfile {
  documentType: DocumentType;
  displayName: string;
  issuingJurisdiction: string;
  expectedAspectRatios: [number, number]; // min, max
  expectedHeaders: string[];
  fieldDefinitions: FieldDefinition[];
  dateRules: {
    hasDob: boolean;
    hasIssueDate: boolean;
    hasExpiryDate: boolean;
    maxValidityYears: number;
    allowNoExpiry: boolean;
  };
  mrzRules?: {
    supportedFormats: Array<'TD1' | 'TD2' | 'TD3'>;
    checkDigits: string[];
    weights: number[];
  };
  qrRules?: {
    supported: boolean;
    format: 'UIDAI_SECURE_QR' | 'PDF417' | 'DATA_MATRIX' | 'GENERIC_QR';
    signatureVerificationCapable: boolean;
    encodedFields: string[];
  };
  securityFeatures: Array<{
    name: string;
    description: string;
    criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  jurisdictionRules: {
    recognizedIssuingStates: string[];
    documentNumberRegex: RegExp;
  };
  riskWeights: {
    cryptographicFailure: number;
    checksumFailure: number;
    crossMismatch: number;
    forensicAnomaly: number;
    structuralAnomaly: number;
    ocrUncertainty: number;
    metadataAnomaly: number;
  };
}

export const PassportProfile: DocumentProfile = {
  documentType: 'passport',
  displayName: 'Machine Readable Passport (ICAO Doc 9303)',
  issuingJurisdiction: 'INTERNATIONAL / ICAO',
  expectedAspectRatios: [1.3, 1.6], // Standard passport booklet ratio
  expectedHeaders: [
    'PASSPORT', 'PASSEPORT', 'PASAPORTE', 'REPUBLIC OF INDIA', 'UNITED STATES OF AMERICA',
    'MINISTRY OF EXTERNAL AFFAIRS', 'UNION OF INDIA'
  ],
  fieldDefinitions: [
    {
      key: 'passportNumber',
      label: 'Passport Number',
      required: true,
      regexPattern: /^[A-Z][0-9]{7,8}$|^[0-9]{9}$|^[A-Z0-9]{8,9}$/i,
      labelPatterns: [/PASSPORT\s*(?:NO|NUMBER|N°)/i, /DOCUMENT\s*(?:NO|NUMBER)/i, /TYPE\s*\/\s*CODE\s*P/i],
      defaultBoundingBox: { x: 63, y: 30, width: 16, height: 4 },
      formatHelp: '1 Letter + 7-8 digits (e.g. Z4829104)',
    },
    {
      key: 'surname',
      label: 'Surname',
      required: true,
      regexPattern: /^[A-Z\s'-]{2,30}$/i,
      labelPatterns: [/SURNAME/i, /NOM/i, /LAST\s*NAME/i],
      defaultBoundingBox: { x: 41, y: 34, width: 22, height: 4 },
      formatHelp: 'Alphabetical characters only',
    },
    {
      key: 'givenNames',
      label: 'Given Names',
      required: true,
      regexPattern: /^[A-Z\s'-]{2,35}$/i,
      labelPatterns: [/GIVEN\s*NAMES?/i, /PRÉNOMS?/i, /FIRST\s*NAME/i],
      defaultBoundingBox: { x: 41, y: 39, width: 26, height: 4 },
      formatHelp: 'Alphabetical characters only',
    },
    {
      key: 'nationality',
      label: 'Nationality',
      required: true,
      regexPattern: /^[A-Z]{3}$|^[A-Z\s]{3,20}$/i,
      labelPatterns: [/NATIONALITY/i, /NATIONALITÉ/i, /CITIZENSHIP/i],
      defaultBoundingBox: { x: 41, y: 44, width: 12, height: 4 },
      formatHelp: '3-letter ICAO country code (e.g. IND, USA, GBR)',
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      required: true,
      regexPattern: /^\d{2}[-/]\d{2}[-/]\d{4}$|^\d{4}[-/]\d{2}[-/]\d{2}$|^\d{2}\s+[A-Z]{3,9}\s+\d{4}$/i,
      labelPatterns: [/DATE\s*OF\s*BIRTH/i, /\bDOB\b/i, /BIRTH\s*DATE/i, /DATE\s*DE\s*NAISSANCE/i],
      defaultBoundingBox: { x: 41, y: 49, width: 18, height: 4.5 },
      formatHelp: 'DD/MM/YYYY or YYYY-MM-DD',
    },
    {
      key: 'sex',
      label: 'Sex',
      required: true,
      regexPattern: /^[MFX<]$/i,
      labelPatterns: [/\bSEX\b/i, /\bSEXE\b/i, /\bGENDER\b/i],
      defaultBoundingBox: { x: 41, y: 53.5, width: 8, height: 4 },
      formatHelp: 'M, F, or X',
    },
    {
      key: 'expiryDate',
      label: 'Date of Expiry',
      required: true,
      regexPattern: /^\d{2}[-/]\d{2}[-/]\d{4}$|^\d{4}[-/]\d{2}[-/]\d{2}$|^\d{2}\s+[A-Z]{3,9}\s+\d{4}$/i,
      labelPatterns: [/DATE\s*OF\s*EXPIRY/i, /EXPIRATION\s*DATE/i, /EXPIRES\s*ON/i, /DATE\s*D'EXPIRATION/i],
      defaultBoundingBox: { x: 41, y: 62.5, width: 18, height: 4 },
      formatHelp: 'DD/MM/YYYY or YYYY-MM-DD',
    },
  ],
  dateRules: {
    hasDob: true,
    hasIssueDate: true,
    hasExpiryDate: true,
    maxValidityYears: 10,
    allowNoExpiry: false,
  },
  mrzRules: {
    supportedFormats: ['TD3', 'TD2', 'TD1'],
    checkDigits: ['documentNumber', 'dob', 'expiry', 'composite'],
    weights: [7, 3, 1],
  },
  securityFeatures: [
    { name: 'Guilloche Background', description: 'Intricate interwoven anti-photocopy pattern', criticality: 'HIGH' },
    { name: 'Microtext Security Line', description: 'Continuous micro-lettering along data field baselines', criticality: 'MEDIUM' },
    { name: 'Ghost Portrait', description: 'Secondary low-opacity portrait replica in visual zone', criticality: 'HIGH' },
    { name: 'ICAO Modulo Checksum Band', description: '7-3-1 weighted modulus-10 check digits', criticality: 'HIGH' },
  ],
  jurisdictionRules: {
    recognizedIssuingStates: ['IND', 'USA', 'GBR', 'CAN', 'AUS', 'DEU', 'FRA', 'SGP', 'JPN', 'NPL', 'BTN', 'BGD'],
    documentNumberRegex: /^[A-Z0-9]{8,9}$/i,
  },
  riskWeights: {
    cryptographicFailure: 95,
    checksumFailure: 80,
    crossMismatch: 75,
    forensicAnomaly: 60,
    structuralAnomaly: 50,
    ocrUncertainty: 20,
    metadataAnomaly: 15,
  },
};

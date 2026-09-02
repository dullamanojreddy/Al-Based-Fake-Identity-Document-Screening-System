import { DocumentProfile } from './passport.profile';

export const DrivingLicenceProfile: DocumentProfile = {
  documentType: 'driving_license',
  displayName: 'Indian Driving Licence (Smart Card / Sarathi)',
  issuingJurisdiction: 'INDIA / STATE TRANSPORT DEPTS (MoRTH)',
  expectedAspectRatios: [1.4, 1.7],
  expectedHeaders: [
    'UNION OF INDIA DRIVING LICENCE', 'DRIVING LICENCE', 'DRIVER LICENSE',
    'TRANSPORT DEPARTMENT', 'MOTOR VEHICLES DEPARTMENT', 'INDIAN UNION DRIVING LICENCE'
  ],
  fieldDefinitions: [
    {
      key: 'dlNumber',
      label: 'Driving Licence Number',
      required: true,
      // Standard Indian DL: 2 State Letters + 2 RTO Digits + 4 Year Digits + 7 Sequential Digits (e.g. DL-0420230018921)
      regexPattern: /^[A-Z]{2}[-\s]?\d{2}[-\s]?(?:19|20)\d{2}[-\s]?\d{7}$|^[A-Z]{2}\d{13,14}$/i,
      labelPatterns: [/DL\s*(?:NO|NUMBER)/i, /LICEN[CS]E\s*(?:NO|NUMBER)/i, /DLN/i],
      defaultBoundingBox: { x: 28, y: 22, width: 45, height: 6 },
      formatHelp: 'State Code + RTO Code + Year + 7 digits (e.g. DL-0420230018921)',
    },
    {
      key: 'fullName',
      label: 'Holder Name',
      required: true,
      regexPattern: /^[A-Z\s.-]{3,40}$/i,
      labelPatterns: [/NAME/i, /HOLDER/i, /DRIVER\s*NAME/i],
      defaultBoundingBox: { x: 28, y: 32, width: 38, height: 5 },
      formatHelp: 'Full citizen name',
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      required: true,
      regexPattern: /^\d{2}[-/]\d{2}[-/]\d{4}$|^\d{4}[-/]\d{2}[-/]\d{2}$/i,
      labelPatterns: [/DATE\s*OF\s*BIRTH/i, /\bDOB\b/i, /BIRTH/i],
      defaultBoundingBox: { x: 28, y: 40, width: 25, height: 5 },
      formatHelp: 'DD/MM/YYYY',
    },
    {
      key: 'expiryDate',
      label: 'Valid Till (Non-Transport / Transport)',
      required: true,
      regexPattern: /^\d{2}[-/]\d{2}[-/]\d{4}$|^\d{4}[-/]\d{2}[-/]\d{2}$/i,
      labelPatterns: [/VALID\s*TILL/i, /EXPIRY/i, /VALIDITY/i, /NT\s*VALID/i],
      defaultBoundingBox: { x: 28, y: 55, width: 28, height: 5 },
      formatHelp: 'DD/MM/YYYY (usually up to 20 years or age 50)',
    },
    {
      key: 'vehicleClass',
      label: 'Vehicle Class Authorizations',
      required: true,
      regexPattern: /^(?:LMV|MCWG|MCWOG|HMV|HPMV|TRANS|COMMERCIAL|3W-CAB|LMV-NT|PSVBUS|TRAILR|LDRXCV)(?:,\s*(?:LMV|MCWG|MCWOG|HMV|HPMV|TRANS|COMMERCIAL|3W-CAB|LMV-NT|PSVBUS|TRAILR|LDRXCV))*$/i,
      labelPatterns: [/VEHICLE\s*CLASS/i, /COV/i, /CLASS\s*OF\s*VEHICLE/i, /AUTHORIS/i],
      defaultBoundingBox: { x: 28, y: 64, width: 30, height: 5 },
      formatHelp: 'MCWG, LMV, HMV, TRANS, 3W-CAB',
    },
  ],
  dateRules: {
    hasDob: true,
    hasIssueDate: true,
    hasExpiryDate: true,
    maxValidityYears: 20,
    allowNoExpiry: false,
  },
  securityFeatures: [
    { name: 'State RTO Encoding & Format Validation', description: 'ISO State code + RTO code matching national transport registry', criticality: 'HIGH' },
    { name: 'Micro-embossing & Hologram Zone', description: 'State emblem laser optical variable device', criticality: 'MEDIUM' },
    { name: 'Vehicle Class Parity', description: 'Motor Vehicle Act COV authorization matching', criticality: 'MEDIUM' },
  ],
  jurisdictionRules: {
    recognizedIssuingStates: [
      'DL', 'MH', 'KA', 'UP', 'TN', 'TS', 'AP', 'WB', 'GJ', 'RJ', 'MP', 'KL', 'PB', 'HR', 'BR', 'JH', 'OD', 'AS', 'UT', 'HP'
    ],
    documentNumberRegex: /^[A-Z]{2}[-\s]?\d{2}[-\s]?(?:19|20)\d{2}[-\s]?\d{7}$|^[A-Z]{2}\d{13,14}$/i,
  },
  riskWeights: {
    cryptographicFailure: 90,
    checksumFailure: 80,
    crossMismatch: 75,
    forensicAnomaly: 60,
    structuralAnomaly: 50,
    ocrUncertainty: 25,
    metadataAnomaly: 15,
  },
};

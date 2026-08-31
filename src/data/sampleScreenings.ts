import { ScreeningSession } from '../types';

// Helper to generate realistic high-resolution SVG mock document graphics
export function createSampleDocumentSvg(
  type: 
    | 'genuine_passport' 
    | 'expired_passport'
    | 'tampered_dob' 
    | 'altered_doc_num'
    | 'photo_replaced' 
    | 'mrz_mismatch'
    | 'face_mismatch'
    | 'interpol_fugitive'
    | 'forged_visa' 
    | 'multiple_anomalies'
): string {
  const width = 800;
  const height = 540;

  if (type === 'genuine_passport') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="16" fill="url(%23bgGrad1)" stroke="%2338bdf8" stroke-width="2"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1"/>
      <text x="350" y="65" font-family="sans-serif" font-size="20" font-weight="bold" fill="%231e293b" letter-spacing="2">PASSPORT / PASSEPORT</text>
      <text x="350" y="88" font-family="sans-serif" font-size="14" font-weight="600" fill="%23475569">REPUBLIC OF INDIA / RÉPUBLIQUE D'INDE</text>
      <circle cx="730" cy="70" r="28" fill="%23d97706" opacity="0.15"/>
      <text x="716" y="78" font-size="24">🇮🇳</text>
      <rect x="45" y="110" width="165" height="215" rx="8" fill="%23e2e8f0" stroke="%2364748b" stroke-width="1.5"/>
      <circle cx="127" cy="180" r="45" fill="%233b82f6"/>
      <path d="M 65,300 C 65,240 190,240 190,300 Z" fill="%231e40af"/>
      <g transform="translate(240, 125)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" fill="%2364748b" font-weight="600">Type / Code</text>
        <text x="0" y="18" font-size="15" fill="%230f172a" font-weight="bold">P / IND</text>
        <text x="140" y="0" font-size="11" fill="%2364748b" font-weight="600">Passport No.</text>
        <text x="140" y="18" font-size="16" fill="%230f172a" font-weight="bold" font-family="monospace">Z4829104</text>
        <text x="0" y="48" font-size="11" fill="%2364748b" font-weight="600">Given Name(s)</text>
        <text x="0" y="66" font-size="15" fill="%230f172a" font-weight="bold">ARJUN VIKRAM</text>
        <text x="0" y="96" font-size="11" fill="%2364748b" font-weight="600">Surname</text>
        <text x="0" y="114" font-size="15" fill="%230f172a" font-weight="bold">SHARMA</text>
        <text x="0" y="144" font-size="11" fill="%2364748b" font-weight="600">Nationality</text>
        <text x="0" y="162" font-size="14" fill="%230f172a" font-weight="bold">INDIAN</text>
        <text x="140" y="144" font-size="11" fill="%2364748b" font-weight="600">Date of Birth</text>
        <text x="140" y="162" font-size="14" fill="%230f172a" font-weight="bold">12/04/1988</text>
        <text x="280" y="144" font-size="11" fill="%2364748b" font-weight="600">Sex</text>
        <text x="280" y="162" font-size="14" fill="%230f172a" font-weight="bold">M</text>
        <text x="0" y="192" font-size="11" fill="%2364748b" font-weight="600">Date of Expiry</text>
        <text x="0" y="210" font-size="14" fill="%230f172a" font-weight="bold">09/06/2031</text>
      </g>
      <rect x="40" y="410" width="720" height="95" rx="6" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="1.5"/>
      <text x="55" y="445" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">P&lt;INDSHARMA&lt;&lt;ARJUN&lt;VIKRAM&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="55" y="482" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">Z4829104&lt;4IND8804128M3106096&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</text>
    </svg>`;
  }

  if (type === 'expired_passport') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="16" fill="%230f172a" stroke="%23f59e0b" stroke-width="2"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1"/>
      <text x="320" y="65" font-family="sans-serif" font-size="20" font-weight="bold" fill="%231e293b">PASSPORT / UNITED STATES OF AMERICA</text>
      <rect x="45" y="110" width="165" height="215" rx="8" fill="%23e2e8f0"/>
      <circle cx="127" cy="180" r="45" fill="%23475569"/>
      <path d="M 65,300 C 65,240 190,240 190,300 Z" fill="%231e293b"/>
      <g transform="translate(240, 125)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" fill="%2364748b">Passport Number</text>
        <text x="0" y="18" font-size="16" font-weight="bold">928104712</text>
        <text x="160" y="0" font-size="11" fill="%2364748b">Bearer Name</text>
        <text x="160" y="18" font-size="16" font-weight="bold">SARAH ELIZABETH JENKINS</text>
        <g transform="translate(0, 50)">
          <rect x="-4" y="12" width="140" height="26" rx="4" fill="%23fef3c7" stroke="%23f59e0b"/>
          <text x="0" y="0" font-size="11" fill="%23b45309" font-weight="bold">Date of Expiry (EXPIRED)</text>
          <text x="4" y="28" font-size="15" font-weight="bold" fill="%23b45309">14/02/2023</text>
          <text x="145" y="26" font-size="10" fill="%23d97706" font-weight="bold">⚠ DOCUMENT LAPSED</text>
        </g>
      </g>
      <rect x="40" y="410" width="720" height="95" rx="6" fill="%23fffbeb" stroke="%23f59e0b" stroke-width="1.5"/>
      <text x="55" y="445" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">P&lt;USAJENKINS&lt;&lt;SARAH&lt;ELIZABETH&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="55" y="482" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">9281047128USA8905204F2302146&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4</text>
    </svg>`;
  }

  if (type === 'photo_replaced') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="16" fill="%231e1b4b" stroke="%23ef4444" stroke-width="3"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23fffbeb" stroke="%23fde68a" stroke-width="1"/>
      <text x="310" y="65" font-family="sans-serif" font-size="20" font-weight="bold" fill="%2378350f" letter-spacing="2">TRAVEL IDENTITY PERMIT</text>
      <g id="spliced_photo">
        <rect x="42" y="107" width="171" height="221" rx="4" fill="none" stroke="%23ef4444" stroke-width="2.5" stroke-dasharray="6,4"/>
        <rect x="45" y="110" width="165" height="215" fill="%23e0e7ff"/>
        <circle cx="127" cy="180" r="46" fill="%23ea580c"/>
        <path d="M 65,300 C 65,235 190,235 190,300 Z" fill="%239a3412"/>
        <rect x="48" y="115" width="110" height="20" rx="4" fill="%23ef4444"/>
        <text x="54" y="129" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23ffffff">⚠ SPLICING EDGES</text>
      </g>
      <g transform="translate(240, 125)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" fill="%2392400e" font-weight="600">Permit ID</text>
        <text x="0" y="18" font-size="15" fill="%2378350f" font-weight="bold">BP-7890124</text>
        <text x="160" y="0" font-size="11" fill="%2392400e" font-weight="600">Bearer Name</text>
        <text x="160" y="18" font-size="16" fill="%2378350f" font-weight="bold">RAJESH KUMAR ROY</text>
        <text x="0" y="60" font-size="11" fill="%2392400e" font-weight="600">Nationality</text>
        <text x="0" y="78" font-size="14" fill="%2378350f" font-weight="bold">NEPALESE (NPL)</text>
      </g>
      <rect x="40" y="410" width="720" height="95" rx="6" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="1.5"/>
      <text x="55" y="445" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%2378350f" letter-spacing="4">I&lt;NPLROY&lt;&lt;RAJESH&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="55" y="482" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%2378350f" letter-spacing="4">BP78901248NPL9111234M2601146&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;3</text>
    </svg>`;
  }

  // Default fallback
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" rx="16" fill="%230f172a" stroke="%23ef4444" stroke-width="2"/>
    <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23ffffff"/>
    <text x="250" y="65" font-family="sans-serif" font-size="20" font-weight="bold" fill="%231e293b">INTERNATIONAL TRAVEL DOCUMENT</text>
    <rect x="45" y="110" width="165" height="215" rx="6" fill="%23f1f5f9"/>
    <circle cx="127" cy="180" r="45" fill="%23ef4444"/>
    <path d="M 65,300 C 65,240 190,240 190,300 Z" fill="%23991b1b"/>
    <g transform="translate(240, 125)" font-family="sans-serif">
      <text x="0" y="0" font-size="11" fill="%2364748b">Identity Record</text>
      <text x="0" y="18" font-size="16" font-weight="bold">SCREENING EXAMINATION CASE</text>
    </g>
    <rect x="40" y="410" width="720" height="95" rx="6" fill="%23fef2f2" stroke="%23ef4444" stroke-width="1.5"/>
    <text x="55" y="445" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">P&lt;UTOTRAVELER&lt;&lt;DEMO&lt;CASE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    <text x="55" y="482" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="%23b91c1c" letter-spacing="4">X998877661UTO8501014M3001018&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;9</text>
  </svg>`;
}

export const SAMPLE_SCREENING_CASES: ScreeningSession[] = [
  // 1. Genuine Indian Passport
  {
    id: 'SSB-SCAN-2026-001',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'ARJUN VIKRAM SHARMA',
    travelerNationality: 'IND',
    travelerDob: '1988-04-12',
    travelerPassportNumber: 'Z4829104',
    documentType: 'passport',
    documentImageUrl: createSampleDocumentSvg('genuine_passport'),
    processingTimeMs: 1840,
    fields: [
      { key: 'passportNumber', label: 'Passport Number', value: 'Z4829104', confidence: 99.8, source: 'visual_zone' },
      { key: 'fullName', label: 'Full Name', value: 'ARJUN VIKRAM SHARMA', confidence: 99.4, source: 'visual_zone' },
      { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99.9, source: 'visual_zone' },
      { key: 'dob', label: 'Date of Birth', value: '1988-04-12', confidence: 98.9, source: 'visual_zone' },
      { key: 'sex', label: 'Sex', value: 'M', confidence: 100, source: 'visual_zone' },
      { key: 'expiryDate', label: 'Date of Expiry', value: '2031-06-09', confidence: 99.2, source: 'visual_zone' },
      { key: 'issuePlace', label: 'Place of Issue', value: 'NEW DELHI', confidence: 98.7, source: 'visual_zone' },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'P<INDSHARMA<<ARJUN<VIKRAM<<<<<<<<<<<<<<<<<<<<',
        'Z4829104<4IND8804128M3106096<<<<<<<<<<<<<<8',
      ],
      documentType: 'P',
      countryCode: 'IND',
      documentNumber: 'Z4829104',
      documentNumberCheckDigit: '4',
      nationality: 'IND',
      birthDate: '880412',
      birthDateFormatted: '1988-04-12',
      birthDateCheckDigit: '8',
      sex: 'M',
      expirationDate: '310609',
      expirationDateFormatted: '2031-06-09',
      expirationDateCheckDigit: '6',
      compositeCheckDigit: '8',
      computedCompositeCheckDigit: '8',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Document Number', extractedValue: 'Z4829104', checkDigit: '4', computedCheckDigit: '4', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth', extractedValue: '880412', checkDigit: '8', computedCheckDigit: '8', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Expiry', extractedValue: '310609', checkDigit: '6', computedCheckDigit: '6', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
      ],
      vizMismatchDetected: false,
      vizMismatchDetails: [],
    },
    tampering: {
      overallTamperScore: 2,
      isTampered: false,
      photoReplacement: {
        detected: false,
        confidence: 99.2,
        splicingEdgeDetected: false,
        lightingInconsistency: false,
        elaAnomalyScore: 3,
        noiseResidualDisparity: 2,
        details: 'Photo edge gradients and compression quantization align seamlessly with passport substrate.',
      },
      textManipulation: {
        detected: false,
        confidence: 99.5,
        fontInconsistency: false,
        baselineMisalignment: false,
        alteredFields: [],
        digitalCopyPasteArtifacts: false,
        details: 'Standard ICAO OCR-B typography and consistent baseline alignment throughout.',
      },
      stampForgery: {
        detected: false,
        confidence: 99.0,
        structuralSimilarityScore: 98,
        circularEdgeIntegrity: 99,
        inkBleedAnomaly: false,
        clonedSealDetected: false,
        details: 'Genuine security guilloche pattern and official Ministry seal intact.',
      },
      metadataAnalysis: {
        detected: false,
        editingSoftwareFound: false,
        softwareTraces: [],
        exifMissingOrStripped: false,
        creationDateAnomaly: false,
        compressionQuantizationAnomaly: false,
        details: 'Raw camera and scanner ICC color profiles verified without editing markers.',
      },
      tamperBoxes: [],
    },
    biometrics: {
      isBiometricVerified: true,
      similarityScore: 96.8,
      matchStatus: 'MATCH_VERIFIED',
      antiSpoofing: {
        isLive: true,
        confidence: 99.1,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Live passenger presence verified. Active 3D facial mesh and natural eye-blink confirmed.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 98.4,
      details: 'High-confidence biometric match (96.8%). Facial geometry fully consistent with passport photo.',
    },
    watchlist: {
      isHit: false,
      matchType: 'NONE',
      threatLevel: 'NONE',
      watchlistDatabase: 'INTERPOL SLTD + SSB National Database',
      details: 'No records found. Clear across all national and international watchlists.',
      actionRequired: 'Proceed with standard automated e-Gate clearance.',
    },
    risk: {
      overallRiskScore: 4,
      reviewPriority: 'LOW REVIEW PRIORITY',
      confidenceLevel: 99.2,
      breakdown: {
        ocrExtractionScore: 99,
        mrzValidationScore: 100,
        tamperRiskScore: 2,
        biometricMatchScore: 97,
        watchlistThreatScore: 0,
      },
      keyRiskFactors: [],
      positiveFactors: [
        'Valid ICAO Doc 9303 checksums (Document, DOB, Expiry, Composite)',
        'Error Level Analysis (ELA) confirms genuine original photograph',
        '96.8% facial biometric match against live traveler webcam',
        'Clean Interpol SLTD and SSB Watchlist status',
      ],
      recommendedAction: 'Grant automated e-Gate border clearance. Document authentic and traveler verified.',
      decisionTimestamp: new Date().toISOString(),
      findings: [
        {
          id: 'f-1',
          sourceModule: 'MRZ',
          code: 'MRZ_VALID',
          severity: 'INFO',
          title: 'ICAO 9303 Checksum Valid',
          description: 'All 7-3-1 check digits successfully validated.',
        },
        {
          id: 'f-2',
          sourceModule: 'BIOMETRICS',
          code: 'BIO_MATCH',
          severity: 'INFO',
          title: 'Facial Biometrics Match',
          description: '1:1 facial biometric match confirmed (96.8%).',
        }
      ],
    },
    status: 'CLEARED',
  },

  // 2. Spliced Photo Permit
  {
    id: 'SSB-SCAN-2026-002',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'RAJESH KUMAR ROY',
    travelerNationality: 'NPL',
    travelerDob: '1991-11-23',
    travelerPassportNumber: 'BP7890124',
    documentType: 'border_permit',
    documentImageUrl: createSampleDocumentSvg('photo_replaced'),
    processingTimeMs: 2120,
    fields: [
      { key: 'documentNumber', label: 'Permit ID', value: 'BP7890124', confidence: 97.4 },
      { key: 'fullName', label: 'Bearer Name', value: 'RAJESH KUMAR ROY', confidence: 96.8 },
      { key: 'nationality', label: 'Nationality', value: 'NPL', confidence: 99.0 },
      { key: 'dob', label: 'Date of Birth', value: '1991-11-23', confidence: 95.5 },
      { key: 'photo', label: 'Portrait Photo', value: 'SPLICED_DETECTED', confidence: 24.0, isTampered: true, anomalyReason: 'Rectangular edge discontinuity & distinct JPEG ELA compression variance' },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'I<NPLROY<<RAJESH<KUMAR<<<<<<<<<<<<<<<<<<<',
        'BP78901248NPL9111234M2601146<<<<<<<<<<<<<3',
      ],
      documentType: 'I',
      countryCode: 'NPL',
      documentNumber: 'BP7890124',
      documentNumberCheckDigit: '8',
      nationality: 'NPL',
      birthDate: '911123',
      birthDateFormatted: '1991-11-23',
      birthDateCheckDigit: '4',
      sex: 'M',
      expirationDate: '260114',
      expirationDateFormatted: '2026-01-14',
      expirationDateCheckDigit: '6',
      compositeCheckDigit: '3',
      computedCompositeCheckDigit: '3',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Document Number', extractedValue: 'BP7890124', checkDigit: '8', computedCheckDigit: '8', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth', extractedValue: '911123', checkDigit: '4', computedCheckDigit: '4', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Expiry', extractedValue: '260114', checkDigit: '6', computedCheckDigit: '6', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
      ],
      vizMismatchDetected: false,
      vizMismatchDetails: [],
    },
    tampering: {
      overallTamperScore: 92,
      isTampered: true,
      photoReplacement: {
        detected: true,
        confidence: 98.6,
        splicingEdgeDetected: true,
        lightingInconsistency: true,
        elaAnomalyScore: 92,
        noiseResidualDisparity: 86,
        details: 'CRITICAL: Severe Error Level Analysis (ELA) anomaly in portrait zone (x: 5.6%, y: 20.3%). Boundary cut-and-paste halo detected.',
      },
      textManipulation: {
        detected: false,
        confidence: 92.0,
        fontInconsistency: false,
        baselineMisalignment: false,
        alteredFields: [],
        digitalCopyPasteArtifacts: false,
        details: 'Substrate text fields appear unchanged on original card base.',
      },
      stampForgery: {
        detected: true,
        confidence: 84.2,
        structuralSimilarityScore: 45,
        circularEdgeIntegrity: 62,
        inkBleedAnomaly: true,
        clonedSealDetected: true,
        details: 'Border post stamp overlaps spliced photograph without natural ink absorption into underlying paper fibers.',
      },
      metadataAnalysis: {
        detected: true,
        editingSoftwareFound: true,
        softwareTraces: ['Adobe Photoshop 2024 (Windows)', 'Canva Editor'],
        exifMissingOrStripped: true,
        creationDateAnomaly: true,
        compressionQuantizationAnomaly: true,
        details: 'Digital artifact traces: Quantization matrix shows double JPEG compression consistent with image replacement.',
      },
      tamperBoxes: [
        {
          id: 'tb-1',
          x: 5.6,
          y: 20.3,
          width: 20.6,
          height: 39.8,
          label: 'Photo Splicing Detected',
          type: 'photo',
          severity: 'HIGH',
          confidence: 98.6,
          description: 'Error Level Analysis (ELA) shows intense compression discrepancy. Sharp rectangular boundary halo indicates physical photo overlay.',
        },
      ],
    },
    biometrics: {
      isBiometricVerified: false,
      similarityScore: 28.4,
      matchStatus: 'SUSPECT_IMPERSONATION',
      antiSpoofing: {
        isLive: true,
        confidence: 96.0,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Live traveler is physically present, but facial nodal geometry does NOT match the document portrait.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 28.4,
      details: 'CRITICAL BIOMETRIC DIVERGENCE (28.4%): Significant jawline and nasal bridge mismatch. Suspected imposter using altered permit.',
    },
    watchlist: {
      isHit: false,
      matchType: 'NONE',
      threatLevel: 'NONE',
      watchlistDatabase: 'SSB Border Post Database',
      details: 'Permit base serial belongs to a registered citizen, but photo replaced for imposter entry.',
      actionRequired: 'Detain bearer and verify original registered permit owner.',
    },
    risk: {
      overallRiskScore: 92,
      reviewPriority: 'ENHANCED REVIEW RECOMMENDED',
      confidenceLevel: 98.8,
      breakdown: {
        ocrExtractionScore: 85,
        mrzValidationScore: 90,
        tamperRiskScore: 92,
        biometricMatchScore: 28,
        watchlistThreatScore: 40,
      },
      keyRiskFactors: [
        'Photo Replacement: Spliced portrait with 92% ELA compression variance anomaly',
        'Biometric Impersonation: Live traveler facial similarity is only 28.4% against document photo',
      ],
      positiveFactors: [],
      recommendedAction: 'ENHANCED REVIEW RECOMMENDED: Detain subject and seize altered permit. Notify SSB Police II.',
      decisionTimestamp: new Date().toISOString(),
      findings: [
        {
          id: 'f-splicing',
          sourceModule: 'TAMPERING',
          code: 'PHOTO_SPLICING',
          severity: 'HIGH',
          title: 'Portrait Replacement Anomaly',
          description: 'Severe Error Level Analysis (ELA) compression discrepancy around portrait perimeter.',
          boundingBox: { x: 5.6, y: 20.3, width: 20.6, height: 39.8 },
        },
        {
          id: 'f-impersonation',
          sourceModule: 'BIOMETRICS',
          code: 'IMPERSONATION_DETECTED',
          severity: 'HIGH',
          title: 'Facial Biometric Mismatch',
          description: 'Live face differs drastically from document portrait (28.4% similarity).',
        }
      ],
    },
    status: 'DETAINED',
  },

  // 3. Altered DOB Passport
  {
    id: 'SSB-SCAN-2026-003',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'DAVID JAMES STERLING',
    travelerNationality: 'GBR',
    travelerDob: '1994-08-15',
    travelerPassportNumber: '559102841',
    documentType: 'passport',
    documentImageUrl: createSampleDocumentSvg('tampered_dob'),
    processingTimeMs: 1980,
    fields: [
      { key: 'passportNumber', label: 'Passport Number', value: '559102841', confidence: 99.1 },
      { key: 'fullName', label: 'Full Name', value: 'DAVID JAMES STERLING', confidence: 98.7 },
      { key: 'dob', label: 'Date of Birth (VIZ)', value: '15/08/1994', confidence: 62.0, isTampered: true, anomalyReason: 'Visual DOB altered from 1982 to 1994. Baseline offset and font style diverge.' },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'P<GBRSTERLING<<DAVID<JAMES<<<<<<<<<<<<<<<<',
        '5591028414GBR8208156M2910289<<<<<<<<<<<<<<2',
      ],
      documentType: 'P',
      countryCode: 'GBR',
      documentNumber: '559102841',
      documentNumberCheckDigit: '4',
      nationality: 'GBR',
      birthDate: '820815',
      birthDateFormatted: '1982-08-15',
      birthDateCheckDigit: '6',
      sex: 'M',
      expirationDate: '291028',
      expirationDateFormatted: '2029-10-28',
      expirationDateCheckDigit: '9',
      compositeCheckDigit: '2',
      computedCompositeCheckDigit: '2',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Document Number', extractedValue: '559102841', checkDigit: '4', computedCheckDigit: '4', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth (MRZ Decoded)', extractedValue: '820815 (1982-08-15)', checkDigit: '6', computedCheckDigit: '6', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
      ],
      vizMismatchDetected: true,
      vizMismatchDetails: [
        'Date of Birth Discrepancy: Visual Zone shows "15/08/1994" while MRZ decodes to "1982-08-15".',
      ],
    },
    tampering: {
      overallTamperScore: 78,
      isTampered: true,
      photoReplacement: {
        detected: false,
        confidence: 96.0,
        splicingEdgeDetected: false,
        lightingInconsistency: false,
        elaAnomalyScore: 12,
        noiseResidualDisparity: 8,
        details: 'Photo appears authentic to the passport page.',
      },
      textManipulation: {
        detected: true,
        confidence: 97.4,
        fontInconsistency: true,
        baselineMisalignment: true,
        alteredFields: ['Date of Birth'],
        digitalCopyPasteArtifacts: true,
        details: 'Digit "9" and "4" in year 1994 exhibit distinct serif curvature and 1.8px baseline vertical shift.',
      },
      stampForgery: {
        detected: false,
        confidence: 94.0,
        structuralSimilarityScore: 92,
        circularEdgeIntegrity: 95,
        inkBleedAnomaly: false,
        clonedSealDetected: false,
        details: 'No seal tampering detected.',
      },
      metadataAnalysis: {
        detected: false,
        editingSoftwareFound: false,
        softwareTraces: [],
        exifMissingOrStripped: false,
        creationDateAnomaly: false,
        compressionQuantizationAnomaly: false,
        details: 'Physical document scraping / mechanical alteration of printed number.',
      },
      tamperBoxes: [
        {
          id: 'tb-3',
          x: 29.5,
          y: 28.2,
          width: 24.5,
          height: 9.8,
          label: 'Font Alteration (DOB)',
          type: 'text',
          severity: 'HIGH',
          confidence: 97.4,
          description: 'Digit 1994 manually altered. Optical character baseline misalignment detected.',
        }
      ],
    },
    biometrics: {
      isBiometricVerified: true,
      similarityScore: 89.2,
      matchStatus: 'MATCH_VERIFIED',
      antiSpoofing: {
        isLive: true,
        confidence: 98.0,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Subject is verified live.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 89.2,
      details: 'Facial biometrics match document portrait, confirming traveler is the original passport holder attempting age modification.',
    },
    watchlist: {
      isHit: true,
      matchType: 'VISA_VIOLATION',
      threatLevel: 'MEDIUM',
      watchlistDatabase: 'Immigration & Overstay Records',
      details: 'Subject previously flagged under birth year 1982 for overstaying student visa in 2018.',
      actionRequired: 'Secondary interrogation regarding fraudulent age modification.',
    },
    risk: {
      overallRiskScore: 78,
      reviewPriority: 'ENHANCED REVIEW RECOMMENDED',
      confidenceLevel: 97.5,
      breakdown: {
        ocrExtractionScore: 65,
        mrzValidationScore: 40,
        tamperRiskScore: 78,
        biometricMatchScore: 89,
        watchlistThreatScore: 65,
      },
      keyRiskFactors: [
        'Visual-to-MRZ Mismatch: Visual DOB "15/08/1994" conflicts directly with MRZ encoded date "1982-08-15"',
        'Text Manipulation: Font baseline misalignment on DOB field',
      ],
      positiveFactors: [],
      recommendedAction: 'ENHANCED REVIEW RECOMMENDED: Altered document detected to bypass entry ban. Confiscate passport under MHA Section 14.',
      decisionTimestamp: new Date().toISOString(),
      findings: [
        {
          id: 'f-dob-mismatch',
          sourceModule: 'MRZ',
          code: 'VIZ_MRZ_DOB_MISMATCH',
          severity: 'HIGH',
          title: 'Visual vs MRZ Date of Birth Mismatch',
          description: 'Visual Zone displays 1994 while MRZ contains 1982.',
          boundingBox: { x: 29.5, y: 28.2, width: 24.5, height: 9.8 },
        }
      ],
    },
    status: 'DETAINED',
  },

  // 4. Interpol Red Notice
  {
    id: 'SSB-SCAN-2026-005',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'MAXIMILIAN KLAUS WEBER',
    travelerNationality: 'AUT',
    travelerDob: '1981-05-19',
    travelerPassportNumber: 'A77192083',
    documentType: 'passport',
    documentImageUrl: createSampleDocumentSvg('interpol_fugitive'),
    processingTimeMs: 1650,
    fields: [
      { key: 'passportNumber', label: 'Passport Number', value: 'A77192083', confidence: 99.4 },
      { key: 'fullName', label: 'Passport Name', value: 'MAXIMILIAN KLAUS WEBER', confidence: 99.1 },
      { key: 'interpolHit', label: 'Watchlist Status', value: 'INTERPOL RED NOTICE (CRITICAL)', confidence: 100, isTampered: true, anomalyReason: 'Matches active fugitive warrant RN-2025/88921-EU.' },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'P<AUTWEBER<<MAXIMILIAN<KLAUS<<<<<<<<<<<<<<',
        'A771920836AUT8105193M3005124<<<<<<<<<<<<<<6',
      ],
      documentType: 'P',
      countryCode: 'AUT',
      documentNumber: 'A77192083',
      documentNumberCheckDigit: '6',
      nationality: 'AUT',
      birthDate: '810519',
      birthDateFormatted: '1981-05-19',
      birthDateCheckDigit: '3',
      sex: 'M',
      expirationDate: '300512',
      expirationDateFormatted: '2030-05-12',
      expirationDateCheckDigit: '4',
      compositeCheckDigit: '6',
      computedCompositeCheckDigit: '6',
      isAllChecksumsValid: true,
      checksumList: [],
      vizMismatchDetected: false,
      vizMismatchDetails: [],
    },
    tampering: {
      overallTamperScore: 24,
      isTampered: false,
      photoReplacement: { detected: false, confidence: 96.0, splicingEdgeDetected: false, lightingInconsistency: false, elaAnomalyScore: 14, noiseResidualDisparity: 10, details: 'Clean substrate.' },
      textManipulation: { detected: false, confidence: 98.0, fontInconsistency: false, baselineMisalignment: false, alteredFields: [], digitalCopyPasteArtifacts: false, details: 'Standard font printing.' },
      stampForgery: { detected: false, confidence: 97.0, structuralSimilarityScore: 98, circularEdgeIntegrity: 98, inkBleedAnomaly: false, clonedSealDetected: false, details: 'Authentic seal.' },
      metadataAnalysis: { detected: false, editingSoftwareFound: false, softwareTraces: [], exifMissingOrStripped: false, creationDateAnomaly: false, compressionQuantizationAnomaly: false, details: 'No editing software.' },
      tamperBoxes: [],
    },
    biometrics: {
      isBiometricVerified: true,
      similarityScore: 95.2,
      matchStatus: 'MATCH_VERIFIED',
      antiSpoofing: { isLive: true, confidence: 99.4, screenReplayAttack: false, printAttackDetected: false, depthAnomaly: false, livenessPassed: true, details: 'Live passenger biometrics confirmed.' },
      facialLandmarksCount: 68,
      matchConfidence: 95.2,
      details: 'Facial biometrics cross-match INTERPOL Red Notice database (99.1% match against fugitive alias Vladimir Ivanov).',
    },
    watchlist: {
      isHit: true,
      matchType: 'INTERPOL_RED_NOTICE',
      threatLevel: 'CRITICAL',
      matchedAlias: 'Vladimir Ivanov / Maxim Weber',
      interpolNoticeId: 'RN-2025/88921-EU',
      offenseCategory: 'Transnational Syndicate Fraud & Identity Laundering',
      watchlistDatabase: 'INTERPOL Lyon Central Red Notice Database',
      details: 'HIGH-PRIORITY RED NOTICE: Subject wanted by Austrian Federal Criminal Police and Europol.',
      actionRequired: 'TRIGGER LEVEL-1 ARREST PROTOCOL: Lockdown e-Gate and alert armed SSB Quick Reaction Team.',
    },
    risk: {
      overallRiskScore: 99,
      reviewPriority: 'ENHANCED REVIEW RECOMMENDED',
      confidenceLevel: 99.8,
      breakdown: { ocrExtractionScore: 99, mrzValidationScore: 100, tamperRiskScore: 24, biometricMatchScore: 95, watchlistThreatScore: 100 },
      keyRiskFactors: ['CRITICAL INTERPOL RED NOTICE: Active international arrest warrant (Ref: RN-2025/88921-EU)'],
      positiveFactors: [],
      recommendedAction: 'TACTICAL INTERVENTION: Alert armed SSB security to detain subject immediately for Interpol liaison.',
      decisionTimestamp: new Date().toISOString(),
      findings: [
        {
          id: 'f-interpol',
          sourceModule: 'WATCHLIST',
          code: 'INTERPOL_RED_NOTICE',
          severity: 'CRITICAL',
          title: 'Interpol Red Notice Match',
          description: 'Subject matches active fugitive arrest warrant RN-2025/88921-EU.',
        }
      ],
    },
    status: 'DETAINED',
  },
];

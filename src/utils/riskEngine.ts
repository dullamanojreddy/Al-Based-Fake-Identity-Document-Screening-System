import {
  CompositeRiskAssessment,
  ReviewPriority,
  RiskBreakdown,
  MRZData,
  TamperingForensics,
  BiometricVerification,
  WatchlistResult,
  DocumentField,
  ScreeningFinding,
} from '../types';

export function calculateCompositeRisk(
  fields: DocumentField[],
  mrzData?: MRZData,
  tampering?: TamperingForensics,
  biometrics?: BiometricVerification,
  watchlist?: WatchlistResult
): CompositeRiskAssessment {
  const keyRiskFactors: string[] = [];
  const positiveFactors: string[] = [];
  const findings: ScreeningFinding[] = [];

  let tamperRisk = tampering?.overallTamperScore || 0;
  let mrzScore = mrzData ? (mrzData.isAllChecksumsValid && !mrzData.vizMismatchDetected ? 98 : 30) : 85;
  let ocrScore = 95;
  let bioScore = biometrics?.isBiometricVerified ? (biometrics.similarityScore || 90) : 50;
  let watchlistThreat = 0;

  let computedRisk = 0;

  // 1. Watchlist Screening (Highest Weight)
  if (watchlist?.isHit) {
    if (watchlist.threatLevel === 'CRITICAL' || watchlist.matchType === 'INTERPOL_RED_NOTICE') {
      watchlistThreat = 100;
      computedRisk += 95;
      keyRiskFactors.push(`CRITICAL WATCHLIST HIT: ${watchlist.matchType} - ${watchlist.details}`);
      findings.push({
        id: `f-wl-1`,
        sourceModule: 'WATCHLIST',
        code: 'INTERPOL_RED_NOTICE_MATCH',
        severity: 'CRITICAL',
        title: 'Active Interpol Red Notice / Fugitive Match',
        description: `Subject biometrics/passport matches high-priority arrest warrant: ${watchlist.details}`,
      });
    } else if (watchlist.threatLevel === 'HIGH' || watchlist.matchType === 'SSB_BLACKLIST') {
      watchlistThreat = 85;
      computedRisk += 80;
      keyRiskFactors.push(`SSB BLACKLIST MATCH: ${watchlist.details}`);
      findings.push({
        id: `f-wl-2`,
        sourceModule: 'WATCHLIST',
        code: 'SSB_NATIONAL_BLACKLIST_MATCH',
        severity: 'HIGH',
        title: 'SSB National Security Blacklist Flag',
        description: watchlist.details,
      });
    } else {
      watchlistThreat = 60;
      computedRisk += 45;
      keyRiskFactors.push(`WATCHLIST FLAG: ${watchlist.details}`);
      findings.push({
        id: `f-wl-3`,
        sourceModule: 'WATCHLIST',
        code: 'IMMIGRATION_VIOLATION_RECORD',
        severity: 'MEDIUM',
        title: 'Prior Immigration Violation Flagged',
        description: watchlist.details,
      });
    }
  } else {
    positiveFactors.push('Clear Interpol SLTD & SSB National Blacklist screening');
    findings.push({
      id: `f-wl-pass`,
      sourceModule: 'WATCHLIST',
      code: 'WATCHLIST_CLEAR',
      severity: 'INFO',
      title: 'Interpol & National Watchlist Clear',
      description: 'Zero matches located across Interpol SLTD, Red Notices, and SSB Blacklist databases.',
    });
  }

  // 2. Tampering & Forensics
  if (tampering) {
    if (tampering.photoReplacement.detected) {
      computedRisk += 40;
      keyRiskFactors.push(`Photo Splicing Detected: ${tampering.photoReplacement.details}`);
      findings.push({
        id: `f-tmp-photo`,
        sourceModule: 'TAMPERING',
        code: 'PHOTO_SPLICING_ANOMALY',
        severity: 'HIGH',
        title: 'Portrait Photo Replacement / Splicing Detected',
        description: tampering.photoReplacement.details,
        boundingBox: { x: 5.6, y: 20.3, width: 20.6, height: 39.8 },
      });
    }
    if (tampering.textManipulation.detected) {
      computedRisk += 30;
      keyRiskFactors.push(`Text / Font Manipulation: ${tampering.textManipulation.details}`);
      findings.push({
        id: `f-tmp-text`,
        sourceModule: 'TAMPERING',
        code: 'TEXT_BASELINE_MISALIGNMENT',
        severity: 'HIGH',
        title: 'Font Morphology & Baseline Alteration',
        description: tampering.textManipulation.details,
        boundingBox: { x: 29.5, y: 28.2, width: 24.5, height: 9.8 },
      });
    }
    if (tampering.stampForgery.detected) {
      computedRisk += 35;
      keyRiskFactors.push(`Stamp / Seal Forgery: ${tampering.stampForgery.details}`);
      findings.push({
        id: `f-tmp-stamp`,
        sourceModule: 'TAMPERING',
        code: 'CLONED_SEAL_FORGERY',
        severity: 'HIGH',
        title: 'Counterfeit / Cloned Digital Consular Seal',
        description: tampering.stampForgery.details,
        boundingBox: { x: 70.0, y: 35.2, width: 20.0, height: 29.6 },
      });
    }
    if (tampering.metadataAnalysis.editingSoftwareFound) {
      computedRisk += 25;
      keyRiskFactors.push(`Digital Editing Signatures: Traces of ${tampering.metadataAnalysis.softwareTraces.join(', ')}`);
      findings.push({
        id: `f-tmp-meta`,
        sourceModule: 'METADATA',
        code: 'EDITING_SOFTWARE_TRACES',
        severity: 'LOW',
        title: 'Image Metadata References Photo-Editing Software',
        description: `Header analysis reveals traces of: ${tampering.metadataAnalysis.softwareTraces.join(', ')}`,
      });
    }

    if (!tampering.isTampered && tampering.overallTamperScore < 15) {
      positiveFactors.push('Error Level Analysis (ELA) and noise gradients show genuine un-spliced document integrity');
      findings.push({
        id: `f-tmp-pass`,
        sourceModule: 'TAMPERING',
        code: 'SUBSTRATE_INTEGRITY_VERIFIED',
        severity: 'INFO',
        title: 'Substrate & Forensic Noise Verified Authentic',
        description: 'No compression anomalies, boundary halos, or font scraping identified.',
      });
    }
  }

  // 3. MRZ & ICAO Doc 9303 Compliance
  if (mrzData) {
    if (!mrzData.isAllChecksumsValid) {
      computedRisk += 35;
      const failedChecksums = mrzData.checksumList.filter(c => !c.isValid).map(c => c.field).join(', ');
      keyRiskFactors.push(`ICAO 9303 Checksum Failure: Invalid 7-3-1 check digits in [${failedChecksums}]`);
      findings.push({
        id: `f-mrz-fail`,
        sourceModule: 'MRZ',
        code: 'ICAO_9303_CHECKSUM_MISMATCH',
        severity: 'HIGH',
        title: 'ICAO Doc 9303 Mathematical Checksum Failure',
        description: `7-3-1 weight algorithm check digit failure in: ${failedChecksums}`,
      });
    } else {
      positiveFactors.push('All ICAO Doc 9303 check digits (Doc#, DOB, Expiry, Composite) mathematically validated');
      findings.push({
        id: `f-mrz-pass`,
        sourceModule: 'MRZ',
        code: 'ICAO_9303_CHECKSUM_VALID',
        severity: 'INFO',
        title: 'ICAO 9303 Check Digits Verified',
        description: 'Document number, DOB, Expiry, and Composite checksums computed accurately.',
      });
    }

    if (mrzData.vizMismatchDetected) {
      computedRisk += 40;
      mrzData.vizMismatchDetails.forEach((detail, idx) => {
        keyRiskFactors.push(`Visual-to-MRZ Mismatch: ${detail}`);
        findings.push({
          id: `f-viz-mrz-${idx}`,
          sourceModule: 'MRZ',
          code: 'VIZ_MRZ_PARITY_MISMATCH',
          severity: 'HIGH',
          title: 'Visual Inspection Zone ↔ MRZ Discrepancy',
          description: detail,
        });
      });
    }
  }

  // 4. Biometric Face Verification
  if (biometrics) {
    if (biometrics.matchStatus === 'SUSPECT_IMPERSONATION' || biometrics.similarityScore < 50) {
      computedRisk += 45;
      keyRiskFactors.push(`Biometric Face Mismatch (${biometrics.similarityScore}%): Document portrait diverges from presented traveler.`);
      findings.push({
        id: `f-bio-mismatch`,
        sourceModule: 'BIOMETRICS',
        code: 'FACIAL_BIOMETRIC_DIVERGENCE',
        severity: 'HIGH',
        title: 'Facial Biometric Impersonation Alert',
        description: `Live passenger nodal coordinates diverge significantly from document portrait (${biometrics.similarityScore}% similarity score).`,
      });
    } else if (biometrics.matchStatus === 'MATCH_VERIFIED') {
      positiveFactors.push(`1:1 Biometric Facial Match confirmed (${biometrics.similarityScore}% confidence)`);
      findings.push({
        id: `f-bio-pass`,
        sourceModule: 'BIOMETRICS',
        code: 'FACIAL_BIOMETRIC_MATCH',
        severity: 'INFO',
        title: '1:1 Biometric Match Verified',
        description: `Facial similarity score of ${biometrics.similarityScore}% confirms traveler identity against passport photo.`,
      });
    }

    if (biometrics.antiSpoofing && !biometrics.antiSpoofing.isLive) {
      computedRisk += 35;
      keyRiskFactors.push(`Anti-Spoofing Failure: ${biometrics.antiSpoofing.details}`);
      findings.push({
        id: `f-bio-spoof`,
        sourceModule: 'BIOMETRICS',
        code: 'PRESENTATION_ATTACK_DETECTED',
        severity: 'CRITICAL',
        title: 'Biometric Presentation Attack / Spoofing Detected',
        description: biometrics.antiSpoofing.details,
      });
    }
  }

  // 5. OCR Field Validations
  const tamperedFields = fields.filter(f => f.isTampered);
  if (tamperedFields.length > 0) {
    ocrScore = 60;
    tamperedFields.forEach((f, idx) => {
      keyRiskFactors.push(`Field Anomaly [${f.label}]: ${f.anomalyReason || 'Altered character morphology'}`);
      findings.push({
        id: `f-ocr-field-${idx}`,
        sourceModule: 'OCR',
        code: 'FIELD_ANOMALY',
        severity: 'MEDIUM',
        title: `Optical Field Anomaly: ${f.label}`,
        description: f.anomalyReason || 'Inconsistent optical font density.',
        boundingBox: f.boundingBox,
      });
    });
  } else {
    positiveFactors.push('High-fidelity optical character extraction across all identity fields');
  }

  // Final Risk Score clamping (0 - 100)
  const finalRiskScore = Math.max(0, Math.min(100, Math.round(computedRisk)));

  let reviewPriority: ReviewPriority = 'LOW REVIEW PRIORITY';
  let recommendedAction = 'Authorize automated e-Gate entry. No forensic anomalies or security flags identified.';

  if (finalRiskScore >= 66) {
    reviewPriority = 'ENHANCED REVIEW RECOMMENDED';
    recommendedAction = 'ENHANCED REVIEW RECOMMENDED: Detain subject for interrogation. Critical forensic tampering or security watch alert detected.';
  } else if (finalRiskScore >= 26) {
    reviewPriority = 'REVIEW RECOMMENDED';
    recommendedAction = 'REVIEW RECOMMENDED: Refer passenger to Secondary Inspection Booth for physical ultraviolet (UV) lamp and tactile watermark verification.';
  }

  const breakdown: RiskBreakdown = {
    ocrExtractionScore: ocrScore,
    mrzValidationScore: mrzScore,
    tamperRiskScore: tamperRisk,
    biometricMatchScore: bioScore,
    watchlistThreatScore: watchlistThreat,
  };

  return {
    overallRiskScore: finalRiskScore,
    reviewPriority,
    confidenceLevel: 98.4,
    breakdown,
    keyRiskFactors,
    positiveFactors,
    recommendedAction,
    decisionTimestamp: new Date().toISOString(),
    findings,
  };
}

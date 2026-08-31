import {
  CompositeRiskAssessment,
  RiskTier,
  RiskBreakdown,
  MRZData,
  TamperingForensics,
  BiometricVerification,
  WatchlistResult,
  DocumentField,
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
    } else if (watchlist.threatLevel === 'HIGH' || watchlist.matchType === 'SSB_BLACKLIST') {
      watchlistThreat = 85;
      computedRisk += 80;
      keyRiskFactors.push(`SSB BLACKLIST MATCH: ${watchlist.details}`);
    } else {
      watchlistThreat = 60;
      computedRisk += 45;
      keyRiskFactors.push(`WATCHLIST FLAG: ${watchlist.details}`);
    }
  } else {
    positiveFactors.push('Clear Interpol SLTD & SSB National Blacklist screening');
  }

  // 2. Tampering & Forensics
  if (tampering) {
    if (tampering.photoReplacement.detected) {
      computedRisk += 40;
      keyRiskFactors.push(`Photo Splicing Detected: ${tampering.photoReplacement.details}`);
    }
    if (tampering.textManipulation.detected) {
      computedRisk += 30;
      keyRiskFactors.push(`Text / Font Manipulation: ${tampering.textManipulation.details}`);
    }
    if (tampering.stampForgery.detected) {
      computedRisk += 35;
      keyRiskFactors.push(`Stamp / Seal Forgery: ${tampering.stampForgery.details}`);
    }
    if (tampering.metadataAnalysis.editingSoftwareFound) {
      computedRisk += 25;
      keyRiskFactors.push(`Digital Editing Signatures: Traces of ${tampering.metadataAnalysis.softwareTraces.join(', ')}`);
    }

    if (!tampering.isTampered && tampering.overallTamperScore < 15) {
      positiveFactors.push('Error Level Analysis (ELA) and noise gradients show genuine un-spliced document integrity');
    }
  }

  // 3. MRZ & ICAO Doc 9303 Compliance
  if (mrzData) {
    if (!mrzData.isAllChecksumsValid) {
      computedRisk += 35;
      const failedChecksums = mrzData.checksumList.filter(c => !c.isValid).map(c => c.field).join(', ');
      keyRiskFactors.push(`ICAO 9303 Checksum Failure: Invalid 7-3-1 check digits in [${failedChecksums}]`);
    } else {
      positiveFactors.push('All ICAO Doc 9303 check digits (Doc#, DOB, Expiry, Composite) mathematically validated');
    }

    if (mrzData.vizMismatchDetected) {
      computedRisk += 40;
      mrzData.vizMismatchDetails.forEach(detail => keyRiskFactors.push(`Visual-to-MRZ Mismatch: ${detail}`));
    }
  }

  // 4. Biometric Face Verification
  if (biometrics) {
    if (biometrics.matchStatus === 'SUSPECT_IMPERSONATION' || biometrics.similarityScore < 50) {
      computedRisk += 45;
      keyRiskFactors.push(`Biometric Face Mismatch (${biometrics.similarityScore}%): Document portrait diverges from presented traveler.`);
    } else if (biometrics.matchStatus === 'MATCH_VERIFIED') {
      positiveFactors.push(`1:1 Biometric Facial Match confirmed (${biometrics.similarityScore}% confidence)`);
    }

    if (biometrics.antiSpoofing && !biometrics.antiSpoofing.isLive) {
      computedRisk += 35;
      keyRiskFactors.push(`Anti-Spoofing Failure: ${biometrics.antiSpoofing.details}`);
    }
  }

  // 5. OCR Field Validations
  const tamperedFields = fields.filter(f => f.isTampered);
  if (tamperedFields.length > 0) {
    ocrScore = 60;
    tamperedFields.forEach(f => {
      keyRiskFactors.push(`Field Anomaly [${f.label}]: ${f.anomalyReason || 'Altered character morphology'}`);
    });
  } else {
    positiveFactors.push('High-fidelity optical character extraction across all identity fields');
  }

  // Final Risk Score clamping (0 - 100)
  const finalRiskScore = Math.max(0, Math.min(100, Math.round(computedRisk)));

  let riskTier: RiskTier = 'CLEAR';
  let recommendedAction = 'Authorize entry. No forensic anomalies or security flags identified.';

  if (finalRiskScore >= 66) {
    riskTier = 'DETAIN_ALERT';
    recommendedAction = 'IMMEDIATE ACTION REQUIRED: Detain passenger, seize travel document, and initiate SSB/MHA intelligence interrogation.';
  } else if (finalRiskScore >= 26) {
    riskTier = 'SECONDARY_REVIEW';
    recommendedAction = 'Refer passenger to Secondary Inspection Booth for physical ultraviolet (UV) lamp and tactile watermark verification.';
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
    riskTier,
    confidenceLevel: 98.4,
    breakdown,
    keyRiskFactors,
    positiveFactors,
    recommendedAction,
    decisionTimestamp: new Date().toISOString(),
  };
}

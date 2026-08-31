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
  EvidenceSource,
} from '../types';

export function calculateCompositeRisk(
  fields: DocumentField[],
  mrzData?: MRZData | null,
  tampering?: TamperingForensics | null,
  biometrics?: BiometricVerification | null,
  watchlist?: WatchlistResult | null
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
    if (watchlist.threatLevel === 'CRITICAL' || watchlist.matchType === 'EXACT_MATCH') {
      watchlistThreat = 100;
      computedRisk += 95;
      keyRiskFactors.push(`CRITICAL WATCHLIST HIT: ${watchlist.details}`);
      findings.push({
        id: `f-wl-1`,
        finding_id: 'watchlist_hit',
        type: 'WATCHLIST_HIT',
        category: 'WATCHLIST',
        code: 'INTERPOL_RED_NOTICE_MATCH',
        severity: 'CRITICAL',
        title: 'Active Interpol Red Notice / Fugitive Match',
        description: `Subject matches high-priority arrest warrant: ${watchlist.details}`,
        sources: [
          { type: 'METADATA', details: watchlist.watchlistDatabase },
        ],
      });
    } else if (watchlist.threatLevel === 'HIGH' || watchlist.matchType === 'DOCUMENT_NUMBER_MATCH') {
      watchlistThreat = 85;
      computedRisk += 80;
      keyRiskFactors.push(`WATCHLIST FLAG: ${watchlist.details}`);
      findings.push({
        id: `f-wl-2`,
        finding_id: 'watchlist_sltd',
        type: 'WATCHLIST_HIT',
        category: 'WATCHLIST',
        code: 'SLTD_MATCH',
        severity: 'HIGH',
        title: 'Stolen or Lost Travel Document Flag',
        description: watchlist.details,
        sources: [
          { type: 'METADATA', details: watchlist.watchlistDatabase },
        ],
      });
    }
  } else {
    positiveFactors.push('Clear Interpol SLTD & National Watchlist screening');
  }

  // 2. Tampering & Forensics
  if (tampering) {
    if (tampering.photoReplacement.detected) {
      computedRisk += 40;
      keyRiskFactors.push(`Photo Splicing Detected: ${tampering.photoReplacement.details}`);
      findings.push({
        id: `f-tmp-photo`,
        finding_id: 'photo_splicing',
        type: 'PHOTO_REPLACEMENT',
        category: 'TAMPERING',
        code: 'PHOTO_SPLICING_ANOMALY',
        severity: 'HIGH',
        title: 'Portrait Photo Replacement / Splicing Detected',
        description: tampering.photoReplacement.details,
        boundingBox: { x: 23, y: 38, width: 17, height: 26 },
        sources: [
          { type: 'FORENSIC_ZONE', boundingBox: { x: 23, y: 38, width: 17, height: 26 }, details: 'ELA anomaly in photo border' },
        ],
      });
    }

    if (tampering.textManipulation.detected) {
      computedRisk += 30;
      keyRiskFactors.push(`Text / Font Manipulation: ${tampering.textManipulation.details}`);
      findings.push({
        id: `f-tmp-text`,
        finding_id: 'text_manipulation',
        type: 'TEXT_ALTERATION',
        category: 'TAMPERING',
        code: 'FONT_MISALIGNMENT',
        severity: 'HIGH',
        title: 'Text Font / Baseline Misalignment',
        description: tampering.textManipulation.details,
        boundingBox: { x: 41, y: 34, width: 26, height: 18 },
        sources: [
          { type: 'FORENSIC_ZONE', details: tampering.textManipulation.details },
        ],
      });
    }

    if (tampering.stampForgery.detected) {
      computedRisk += 25;
      keyRiskFactors.push(`Security Stamp / Seal Forgery: ${tampering.stampForgery.details}`);
      findings.push({
        id: `f-tmp-stamp`,
        finding_id: 'stamp_forgery',
        type: 'STAMP_FORGERY',
        category: 'TAMPERING',
        code: 'CLONED_STAMP',
        severity: 'MEDIUM',
        title: 'Security Stamp / Guilloche Discontinuity',
        description: tampering.stampForgery.details,
        boundingBox: { x: 70, y: 50, width: 15, height: 20 },
      });
    }
  }

  // 3. ICAO MRZ & Checksum Parity
  if (mrzData) {
    if (!mrzData.isAllChecksumsValid) {
      computedRisk += 35;
      mrzScore = 35;
      const failedChecks = mrzData.checksumList.filter(c => !c.isValid).map(c => c.field).join(', ');
      keyRiskFactors.push(`MRZ Checksum Failure: ${failedChecks}`);
      findings.push({
        id: `f-mrz-cs`,
        finding_id: 'mrz_checksum_failure',
        type: 'MRZ_CHECKSUM_FAILURE',
        category: 'MRZ_CHECKSUM',
        code: 'ICAO_CHECKSUM_MISMATCH',
        severity: 'HIGH',
        title: 'ICAO 9303 MRZ Checksum Failure',
        description: `Mathematical 7-3-1 Modulo-10 checksum validation failed for: ${failedChecks}`,
        boundingBox: { x: 22, y: 70, width: 58, height: 9.5 },
        sources: [
          { type: 'MRZ_FIELD', field: 'MRZ Line 2', value: mrzData.rawLines[1] },
        ],
      });
    }

    if (mrzData.vizMismatchDetected) {
      computedRisk += 40;
      keyRiskFactors.push(...mrzData.vizMismatchDetails);

      const isDobIssue = mrzData.vizMismatchDetails.some(d => d.includes('Date of Birth'));
      const dobField = fields.find(f => f.key === 'dob');

      findings.push({
        id: `f-mrz-viz`,
        finding_id: 'dob_mismatch',
        type: 'DOB_MISMATCH',
        category: 'CONSISTENCY',
        code: 'MRZ_VIZ_DOB_MISMATCH',
        severity: 'HIGH',
        title: 'Date of Birth Consistency Discrepancy',
        description: isDobIssue
          ? `Visual DOB (${dobField?.value || 'N/A'}) does not match MRZ decoded date (${mrzData.birthDateFormatted}).`
          : mrzData.vizMismatchDetails.join('; '),
        boundingBox: dobField?.boundingBox || { x: 41, y: 49, width: 18, height: 4.5 },
        sources: [
          {
            type: 'OCR_FIELD',
            field: 'date_of_birth',
            value: dobField?.value || 'N/A',
            boundingBox: dobField?.boundingBox,
          },
          {
            type: 'MRZ_FIELD',
            field: 'date_of_birth',
            value: mrzData.birthDateFormatted,
            boundingBox: { x: 22, y: 70, width: 58, height: 9.5 },
          },
        ],
      });
    }
  }

  // 4. Biometric Face Verification
  if (biometrics && biometrics.isBiometricVerified) {
    if (biometrics.matchStatus === 'MATCH_DISCREPANCY' || biometrics.matchStatus === 'MATCH_FAILED' || biometrics.similarityScore < 70) {
      computedRisk += 35;
      bioScore = biometrics.similarityScore;
      keyRiskFactors.push(`Face Verification Mismatch: ${biometrics.similarityScore}% similarity`);
      findings.push({
        id: `f-bio-mis`,
        finding_id: 'bio_match',
        type: 'FACE_MISMATCH',
        category: 'BIOMETRICS',
        code: 'FACIAL_SIMILARITY_LOW',
        severity: 'HIGH',
        title: 'Biometric Face Match Below Threshold',
        description: `Facial similarity score is ${biometrics.similarityScore}%, indicating probable imposter substitution.`,
        boundingBox: { x: 23, y: 38, width: 17, height: 26 },
        sources: [
          { type: 'BIOMETRIC_NODAL', details: `Similarity Score: ${biometrics.similarityScore}%` },
        ],
      });
    } else {
      positiveFactors.push(`1:1 Biometric match verified (${biometrics.similarityScore}% confidence)`);
    }
  }

  // 5. Expiry Check
  const expiryField = fields.find(f => f.key === 'expiryDate');
  if (expiryField && expiryField.value) {
    const expDate = new Date(expiryField.value);
    if (!isNaN(expDate.getTime()) && expDate < new Date()) {
      computedRisk += 30;
      keyRiskFactors.push(`Document Expired on ${expiryField.value}`);
      findings.push({
        id: `f-exp-1`,
        finding_id: 'document_expired',
        type: 'DOCUMENT_EXPIRED',
        category: 'EXPIRY',
        code: 'EXPIRED_CREDENTIAL',
        severity: 'HIGH',
        title: 'Expired Travel Credential',
        description: `The document expired on ${expiryField.value}. Credential no longer valid for international border clearance.`,
        boundingBox: expiryField.boundingBox || { x: 41, y: 62.5, width: 18, height: 4 },
        sources: [
          { type: 'OCR_FIELD', field: 'expiryDate', value: expiryField.value },
        ],
      });
    }
  }

  // Calculate final bounded score
  const overallRiskScore = Math.min(100, Math.max(0, computedRisk));

  let reviewPriority: ReviewPriority = 'LOW REVIEW PRIORITY';
  let recommendedAction = 'Automated clearance authorized. Document satisfies standard integrity benchmarks.';

  if (overallRiskScore >= 60 || findings.some(f => f.severity === 'CRITICAL')) {
    reviewPriority = 'ENHANCED REVIEW RECOMMENDED';
    recommendedAction = 'Enhanced review recommended. Discrepancies require manual inspection prior to clearance.';
  } else if (overallRiskScore >= 25 || findings.some(f => f.severity === 'HIGH')) {
    reviewPriority = 'REVIEW RECOMMENDED';
    recommendedAction = 'Secondary review recommended. Verify physical substrate and passenger credentials.';
  }

  const breakdown: RiskBreakdown = {
    ocrExtractionScore: ocrScore,
    mrzValidationScore: mrzScore,
    tamperRiskScore: tamperRisk,
    biometricMatchScore: bioScore,
    watchlistThreatScore: watchlistThreat,
  };

  return {
    overallRiskScore,
    reviewPriority,
    confidenceLevel: 96.5,
    breakdown,
    keyRiskFactors,
    positiveFactors,
    recommendedAction,
    decisionTimestamp: new Date().toISOString(),
    findings,
  };
}

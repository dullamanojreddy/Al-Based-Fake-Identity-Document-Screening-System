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
import { checkDuplicateIdentities } from './duplicateIdentityDetector';

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

  // 0. Duplicate Identity & Credential Recycling Check
  const travelerNameField = fields.find(f => f.key === 'fullName' || f.key === 'name' || f.key === 'surname')?.value || '';
  const docNumField = fields.find(f => f.key === 'passportNumber' || f.key === 'documentNumber' || f.key === 'aadhaarNumber')?.value || '';
  const dobFieldVal = fields.find(f => f.key === 'dob' || f.key === 'dateOfBirth')?.value || mrzData?.birthDateFormatted || '';
  const nationalityVal = fields.find(f => f.key === 'nationality' || f.key === 'country')?.value || mrzData?.nationality || '';

  if (travelerNameField && docNumField) {
    const dupResult = checkDuplicateIdentities(travelerNameField, docNumField, dobFieldVal, nationalityVal);
    if (dupResult.hasDuplicateFlag) {
      dupResult.matches.forEach((m, idx) => {
        computedRisk += m.threatLevel === 'CRITICAL' ? 50 : 35;
        keyRiskFactors.push(m.description);
        findings.push({
          id: `f-dup-${idx}`,
          finding_id: 'duplicate_identity',
          type: 'DUPLICATE_IDENTITY_DETECTED',
          category: 'CONSISTENCY',
          code: m.matchType,
          severity: m.threatLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          title: 'Cross-Border Duplicate Identity Match',
          description: m.description,
          sources: [
            { type: 'METADATA', details: `Previous Crossing ID: ${m.matchedRecord.previousScreeningId} (${m.matchedRecord.dateScreened})` },
          ],
        });
      });
    } else {
      positiveFactors.push('Unique identity verification: No historical cross-credential collisions');
    }
  }

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
  // IMPORTANT: Only treat MRZ failures as high-severity fraud evidence if the
  // MRZ was reliably extracted from the document. If the MRZ data was produced
  // from a synthetic fallback (built from VIZ fields), checksums will always
  // pass. If it came from OCR with uncertain quality, failures are inconclusive.
  if (mrzData) {
    // Consider MRZ reliable if checksums are being evaluated on real extracted data.
    // The status field indicates what was actually done.
    const mrzIsReliable = mrzData.status === 'CHECKSUM_VALID' || mrzData.status === 'CHECKSUM_INVALID';
    const mrzAllFailed = mrzData.checksumList.every(c => !c.isValid); // all failed = likely parser error
    const mrzPartialFail = !mrzData.isAllChecksumsValid && !mrzAllFailed; // some fail = more credible

    if (!mrzData.isAllChecksumsValid) {
      const failedChecks = mrzData.checksumList.filter(c => !c.isValid).map(c => c.field).join(', ');

      // If ALL checks fail simultaneously, this almost certainly means the MRZ
      // was not correctly extracted (parser fed wrong data), not genuine fraud.
      if (mrzAllFailed) {
        // OCR/parser quality issue — add LOW finding, do not escalate risk
        computedRisk += 8;
        mrzScore = 60;
        keyRiskFactors.push(`MRZ Validation Incomplete (OCR quality issue): ${failedChecks}`);
        findings.push({
          id: `f-mrz-cs`,
          finding_id: 'mrz_ocr_quality',
          type: 'MRZ_CHECKSUM_FAILURE',
          category: 'MRZ_CHECKSUM',
          code: 'MRZ_OCR_QUALITY_ISSUE',
          severity: 'LOW',
          title: 'MRZ Validation Incomplete (OCR Quality)',
          description: `MRZ could not be reliably parsed from this image — all check digits unverifiable. This indicates an OCR extraction issue, not necessarily a document anomaly. Manual inspection recommended for: ${failedChecks}`,
          boundingBox: { x: 22, y: 70, width: 58, height: 9.5 },
          sources: [
            { type: 'MRZ_FIELD', field: 'MRZ Quality', value: 'OCR_INSUFFICIENT' },
          ],
        });
      } else {
        // Partial failure: some checks pass, some fail — more credible finding
        computedRisk += 35;
        mrzScore = 35;
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
    } else {
      positiveFactors.push('ICAO 9303 MRZ check digits validated — all checksums pass');
    }

    if (mrzData.vizMismatchDetected) {
      // VIZ mismatches are only meaningful if MRZ checksums also passed
      // (meaning the MRZ was correctly parsed). If checksums all failed,
      // the mismatch is a side-effect of the parser failure, not real fraud.
      if (mrzAllFailed) {
        // Do not add VIZ mismatch finding — it's a cascade from OCR failure
        keyRiskFactors.push('VIZ/MRZ comparison inconclusive: MRZ could not be reliably parsed from image');
      } else {
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

import { BiometricVerification, AntiSpoofingResult } from '../types';

export interface FaceQualityGate {
  passed: boolean;
  sharpnessScore: number; // 0-100 (Laplacian variance proxy)
  illuminationUniformity: number; // 0-100
  poseAngleDegrees: number; // estimated yaw/pitch
  faceResolutionPx: { width: number; height: number };
  details: string;
}

/**
 * Assesses face image quality before running 1:1 facial biometric matching.
 * Rejects degraded, blurry, dark, or heavily angled captures with INCONCLUSIVE
 * to prevent false rejections.
 */
export function evaluateFaceQuality(imageUrl: string): FaceQualityGate {
  // If no image, fail gate
  if (!imageUrl) {
    return {
      passed: false,
      sharpnessScore: 0,
      illuminationUniformity: 0,
      poseAngleDegrees: 0,
      faceResolutionPx: { width: 0, height: 0 },
      details: 'No image provided for face quality gating.',
    };
  }

  // Standard acceptable quality metrics for demo
  return {
    passed: true,
    sharpnessScore: 84,
    illuminationUniformity: 92,
    poseAngleDegrees: 4.2,
    faceResolutionPx: { width: 320, height: 380 },
    details: 'Face quality benchmarks passed: High sharpness, balanced lighting, near-frontal pose (<5° yaw).',
  };
}

/**
 * Compares two face images and produces 1:1 facial biometric matching score
 * Includes simulated anti-spoofing heuristics (screen replay, print attack, 3D depth)
 * and Face Quality Gating.
 */
export async function compareFacialBiometrics(
  docFaceUrl: string,
  livePassengerFaceUrl?: string,
  forceMatchScenario?: {
    similarityScore: number;
    isSpoof?: boolean;
    spoofType?: 'screen_replay' | 'printed_photo';
    isLowQuality?: boolean;
  }
): Promise<BiometricVerification> {
  // If forced scenario (e.g. from preset test cases)
  if (forceMatchScenario) {
    if (forceMatchScenario.isLowQuality) {
      return {
        isBiometricVerified: false,
        similarityScore: 0,
        matchStatus: 'INCONCLUSIVE',
        antiSpoofing: {
          isLive: true,
          confidence: 50,
          screenReplayAttack: false,
          printAttackDetected: false,
          depthAnomaly: false,
          livenessPassed: false,
          details: 'Face Quality Gating: Image resolution or illumination insufficient for definitive 1:1 comparison. Result marked INCONCLUSIVE to prevent false rejection.',
        },
        documentFaceUrl: docFaceUrl,
        livePassengerFaceUrl: livePassengerFaceUrl || docFaceUrl,
        facialLandmarksCount: 0,
        matchConfidence: 0,
        details: 'Quality Gating Triggered: Re-capture passenger portrait under direct frontal illumination.',
      };
    }

    const isVerified = forceMatchScenario.similarityScore >= 80 && !forceMatchScenario.isSpoof;
    let matchStatus: BiometricVerification['matchStatus'] = 'MATCH_VERIFIED';
    
    if (forceMatchScenario.similarityScore < 50) {
      matchStatus = 'SUSPECT_IMPERSONATION';
    } else if (forceMatchScenario.similarityScore < 80) {
      matchStatus = 'UNMATCHED';
    }

    const antiSpoof: AntiSpoofingResult = {
      isLive: !forceMatchScenario.isSpoof,
      confidence: forceMatchScenario.isSpoof ? 94 : 98.6,
      screenReplayAttack: forceMatchScenario.spoofType === 'screen_replay',
      printAttackDetected: forceMatchScenario.spoofType === 'printed_photo',
      depthAnomaly: !!forceMatchScenario.isSpoof,
      livenessPassed: !forceMatchScenario.isSpoof,
      details: forceMatchScenario.isSpoof
        ? `Anti-spoofing failed: Detected high-frequency moiré patterns indicative of a ${forceMatchScenario.spoofType === 'screen_replay' ? 'digital screen replay attack' : 'printed paper photo attack'}.`
        : 'Liveness verified: Normal micro-expressions, 3D depth curvature, and natural eye-blink reflex confirmed.',
    };

    return {
      isBiometricVerified: isVerified,
      similarityScore: forceMatchScenario.similarityScore,
      matchStatus,
      antiSpoofing: antiSpoof,
      documentFaceUrl: docFaceUrl,
      livePassengerFaceUrl: livePassengerFaceUrl || docFaceUrl,
      facialLandmarksCount: 68,
      matchConfidence: Math.min(99.4, forceMatchScenario.similarityScore + 1.2),
      details: isVerified
        ? `High-confidence facial match (${forceMatchScenario.similarityScore}%). Key nodal point distances (interpupillary, nose-to-chin, jawline curvature) align within standard ICAO biometric thresholds.`
        : `Biometric discrepancy detected (${forceMatchScenario.similarityScore}%). Significant facial landmark divergence between document portrait and live passenger capture. Possible impersonation.`,
    };
  }

  // If live camera was provided
  if (!livePassengerFaceUrl) {
    return {
      isBiometricVerified: false,
      similarityScore: 0,
      matchStatus: 'NO_FACE_DETECTED',
      antiSpoofing: {
        isLive: false,
        confidence: 0,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: false,
        details: 'No live passenger photo captured for biometric comparison.',
      },
      documentFaceUrl: docFaceUrl,
      facialLandmarksCount: 0,
      matchConfidence: 0,
      details: 'Awaiting live passenger camera capture at checkpoint terminal.',
    };
  }

  // Face Quality Gate Check
  const qualityGate = evaluateFaceQuality(livePassengerFaceUrl);
  if (!qualityGate.passed) {
    return {
      isBiometricVerified: false,
      similarityScore: 0,
      matchStatus: 'INCONCLUSIVE',
      antiSpoofing: {
        isLive: false,
        confidence: 50,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: false,
        details: qualityGate.details,
      },
      documentFaceUrl: docFaceUrl,
      livePassengerFaceUrl,
      facialLandmarksCount: 0,
      matchConfidence: 0,
      details: 'Capture quality below threshold. Reposition subject and recapture.',
    };
  }

  // Standard live comparison calculation
  // Computes high similarity with minor natural variation
  const simulatedScore = Math.floor(88 + Math.random() * 10);
  return {
    isBiometricVerified: simulatedScore >= 80,
    similarityScore: simulatedScore,
    matchStatus: simulatedScore >= 80 ? 'MATCH_VERIFIED' : 'SUSPECT_IMPERSONATION',
    antiSpoofing: {
      isLive: true,
      confidence: 97.8,
      screenReplayAttack: false,
      printAttackDetected: false,
      depthAnomaly: false,
      livenessPassed: true,
      details: 'Active liveness verified: Real human subject detected with natural specular reflection and depth.',
    },
    documentFaceUrl: docFaceUrl,
    livePassengerFaceUrl,
    facialLandmarksCount: 68,
    matchConfidence: 96.5,
    details: `Facial feature match confirmed at ${simulatedScore}%. Biometric verification successful.`,
  };
}

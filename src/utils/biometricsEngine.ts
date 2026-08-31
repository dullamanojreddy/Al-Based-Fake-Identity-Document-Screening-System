import { BiometricVerification, AntiSpoofingResult } from '../types';

/**
 * Compares two face images and produces 1:1 facial biometric matching score
 * Includes simulated anti-spoofing heuristics (screen replay, print attack, 3D depth)
 */
export async function compareFacialBiometrics(
  docFaceUrl: string,
  livePassengerFaceUrl?: string,
  forceMatchScenario?: {
    similarityScore: number;
    isSpoof?: boolean;
    spoofType?: 'screen_replay' | 'printed_photo';
  }
): Promise<BiometricVerification> {
  // If forced scenario (e.g. from preset test cases)
  if (forceMatchScenario) {
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

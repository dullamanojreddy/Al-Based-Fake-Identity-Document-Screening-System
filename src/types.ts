export type DocumentType = 
  | 'passport' 
  | 'visa' 
  | 'national_id' 
  | 'driving_license' 
  | 'border_permit'
  | 'unsupported_document'
  | 'unknown';

export type ReviewPriority = 
  | 'LOW REVIEW PRIORITY' 
  | 'REVIEW RECOMMENDED' 
  | 'ENHANCED REVIEW RECOMMENDED';

export type ThreatLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DocumentField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0 - 100%
  isTampered?: boolean;
  anomalyReason?: string;
  source?: 'visual_zone' | 'mrz' | 'barcode';
  boundingBox?: {
    x: number; // % from left
    y: number; // % from top
    width: number; // % width
    height: number; // % height
  };
}

export interface MRZChecksumItem {
  field: string;
  extractedValue: string;
  checkDigit: string;
  computedCheckDigit: string;
  isValid: boolean;
  algorithm: string; // e.g. '7-3-1 Weight (Modulo 10)'
}

export interface MRZData {
  format: 'TD1' | 'TD2' | 'TD3' | 'MRV_A' | 'MRV_B';
  rawLines: string[];
  documentType: string;
  countryCode: string;
  documentNumber: string;
  documentNumberCheckDigit: string;
  nationality: string;
  birthDate: string; // YYMMDD
  birthDateFormatted: string; // YYYY-MM-DD
  birthDateCheckDigit: string;
  sex: 'M' | 'F' | 'X' | '<';
  expirationDate: string; // YYMMDD
  expirationDateFormatted: string; // YYYY-MM-DD
  expirationDateCheckDigit: string;
  personalNumber?: string;
  personalNumberCheckDigit?: string;
  compositeCheckDigit: string;
  computedCompositeCheckDigit: string;
  isAllChecksumsValid: boolean;
  checksumList: MRZChecksumItem[];
  vizMismatchDetected: boolean;
  vizMismatchDetails: string[];
}

export interface TamperBoundingBox {
  id: string;
  x: number; // percentage
  y: number; // percentage
  width: number;
  height: number;
  label: string;
  type: 'photo' | 'text' | 'stamp' | 'mrz' | 'metadata' | 'copy_move';
  severity: FindingSeverity;
  confidence: number;
  description: string;
  technicalDetails?: string;
}

export interface PhotoReplacementForensics {
  detected: boolean;
  confidence: number; // 0-100%
  splicingEdgeDetected: boolean;
  lightingInconsistency: boolean;
  elaAnomalyScore: number; // 0-100%
  noiseResidualDisparity: number; // 0-100%
  details: string;
}

export interface TextManipulationForensics {
  detected: boolean;
  confidence: number;
  fontInconsistency: boolean;
  baselineMisalignment: boolean;
  alteredFields: string[];
  digitalCopyPasteArtifacts: boolean;
  details: string;
}

export interface StampForgeryForensics {
  detected: boolean;
  confidence: number;
  structuralSimilarityScore: number;
  circularEdgeIntegrity: number; // 0-100%
  inkBleedAnomaly: boolean;
  clonedSealDetected: boolean;
  details: string;
}

export interface MetadataForensics {
  detected: boolean;
  editingSoftwareFound: boolean;
  softwareTraces: string[];
  exifMissingOrStripped: boolean;
  creationDateAnomaly: boolean;
  compressionQuantizationAnomaly: boolean;
  details: string;
}

export interface TamperingForensics {
  overallTamperScore: number; // 0-100%
  isTampered: boolean;
  photoReplacement: PhotoReplacementForensics;
  textManipulation: TextManipulationForensics;
  stampForgery: StampForgeryForensics;
  metadataAnalysis: MetadataForensics;
  tamperBoxes: TamperBoundingBox[];
  elaHeatmapUrl?: string;
  noiseMapUrl?: string;
}

export interface AntiSpoofingResult {
  isLive: boolean;
  confidence: number;
  screenReplayAttack: boolean;
  printAttackDetected: boolean;
  depthAnomaly: boolean;
  livenessPassed: boolean;
  details: string;
}

export interface BiometricVerification {
  isBiometricVerified: boolean;
  similarityScore: number; // 0 - 100%
  matchStatus: 'MATCH_VERIFIED' | 'SUSPECT_IMPERSONATION' | 'UNMATCHED' | 'NO_FACE_DETECTED';
  antiSpoofing: AntiSpoofingResult;
  documentFaceUrl?: string;
  livePassengerFaceUrl?: string;
  facialLandmarksCount: number;
  matchConfidence: number;
  details: string;
}

export interface WatchlistResult {
  isHit: boolean;
  matchType: 'INTERPOL_RED_NOTICE' | 'INTERPOL_SLTD' | 'SSB_BLACKLIST' | 'MULTI_IDENTITY_FRAUD' | 'VISA_VIOLATION' | 'NONE';
  threatLevel: ThreatLevel;
  matchedAlias?: string;
  interpolNoticeId?: string;
  offenseCategory?: string;
  watchlistDatabase: string;
  details: string;
  actionRequired: string;
}

export interface RiskBreakdown {
  ocrExtractionScore: number; // 0-100 (higher = more reliable)
  mrzValidationScore: number; // 0-100 (higher = more valid)
  tamperRiskScore: number;    // 0-100 (higher = higher danger)
  biometricMatchScore: number;// 0-100 (higher = match)
  watchlistThreatScore: number;// 0-100 (higher = higher threat)
}

export interface ScreeningFinding {
  id: string;
  sourceModule: 'OCR' | 'MRZ' | 'TAMPERING' | 'BIOMETRICS' | 'WATCHLIST' | 'METADATA';
  code: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visualEvidence?: string;
}

export interface OfficerReviewRecord {
  confirmedFindingIds: string[];
  dismissedFindingIds: string[];
  officerNotes: string;
  secondaryInspectionRequested: boolean;
  finalDecision: 'CLEARED' | 'SECONDARY_INSPECTION' | 'DETAINED';
  reviewedAt: string;
  officerBadge: string;
  officerName: string;
}

export interface CompositeRiskAssessment {
  overallRiskScore: number; // 0 - 100
  reviewPriority: ReviewPriority;
  confidenceLevel: number;
  breakdown: RiskBreakdown;
  keyRiskFactors: string[];
  positiveFactors: string[];
  recommendedAction: string;
  decisionTimestamp: string;
  findings: ScreeningFinding[];
  officerReview?: OfficerReviewRecord;
}

export interface AuditLogBlock {
  id: string;
  sequenceNumber: number;
  actorId: string;
  action: string;
  entityType: 'SCREENING' | 'DOCUMENT' | 'OFFICER_REVIEW' | 'WATCHLIST' | 'CONFIG';
  entityId: string;
  timestamp: string;
  previousHash: string;
  recordHash: string;
  payload: any;
}

export interface ModelRegistryEntry {
  id: string;
  modelName: string;
  modelType: 'OCR_MULTIMODAL' | 'MRZ_PARSER' | 'TAMPER_DETECTOR' | 'FACE_VERIFIER' | 'STAMP_ANALYZER';
  version: string;
  framework: string;
  weightsHash: string;
  thresholdConfig: Record<string, number | string | boolean>;
  active: boolean;
  datasetReference: string;
  metrics: {
    accuracy: number;
    f1Score?: number;
    avgLatencyMs: number;
  };
}

export interface ScreeningStats {
  totalScreened: number;
  clearedCount: number;
  secondaryReviewCount: number;
  detainedCount: number;
  averageProcessingTimeMs: number;
  forgeryTypeBreakdown: {
    photoSplicing: number;
    textManipulation: number;
    mrzDiscrepancy: number;
    stampSealForgery: number;
    biometricImpersonation: number;
    watchlistHit: number;
  };
}

export interface ScreeningSession {
  id: string;
  checkpointId: string;
  checkpointName: string;
  officerBadge: string;
  officerName: string;
  timestamp: string;
  travelerName: string;
  travelerNationality: string;
  travelerDob: string;
  travelerPassportNumber: string;
  documentType: DocumentType;
  documentImageUrl: string;
  liveCameraImageUrl?: string;
  
  // 4 Core Modules Output
  fields: DocumentField[];
  mrzData?: MRZData;
  tampering: TamperingForensics;
  biometrics?: BiometricVerification;
  watchlist: WatchlistResult;
  
  // Composite Evaluation
  risk: CompositeRiskAssessment;
  
  status: 'PENDING' | 'CLEARED' | 'SECONDARY_INSPECTION' | 'DETAINED' | 'UNSUPPORTED_DOCUMENT';
  processingTimeMs: number;
  unsupportedReason?: string;
  detectedClassificationConfidence?: number;
}

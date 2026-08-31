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

export type FindingSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'PASS';

export type MRZStatus = 
  | 'NOT_DETECTED' 
  | 'DETECTED' 
  | 'STRUCTURALLY_VALID' 
  | 'CHECKSUM_VALID' 
  | 'CHECKSUM_INVALID';

export interface BoundingBoxCoordinates {
  x: number; // % from left (0 - 100)
  y: number; // % from top (0 - 100)
  width: number; // % width (0 - 100)
  height: number; // % height (0 - 100)
}

export interface DocumentField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0 - 100%
  isTampered?: boolean;
  anomalyReason?: string;
  source?: 'visual_zone' | 'ocr' | 'mrz' | 'barcode';
  boundingBox?: BoundingBoxCoordinates;
  labelDetected?: boolean;
  validation?: 'VALID' | 'INVALID' | 'SUSPICIOUS' | 'UNVERIFIED';
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
  status?: MRZStatus;
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
  livenessPassed?: boolean;
  screenReplayAttack: boolean;
  printAttackDetected: boolean;
  depthAnomaly: boolean;
  details?: string;
}

export type BiometricMatchStatus = 
  | 'MATCH_VERIFIED' 
  | 'MATCH_DISCREPANCY' 
  | 'MATCH_FAILED' 
  | 'PHOTO_UNAVAILABLE'
  | 'SUSPECT_IMPERSONATION'
  | 'UNMATCHED'
  | 'NO_FACE_DETECTED';

export interface BiometricVerification {
  isBiometricVerified: boolean;
  similarityScore: number; // 0 - 100%
  matchStatus: BiometricMatchStatus;
  matchConfidence?: number;
  antiSpoofing: AntiSpoofingResult;
  extractedDocFaceUrl?: string;
  documentFaceUrl?: string;
  livePassengerFaceUrl?: string;
  facialLandmarksCount?: number;
  details: string;
}

export type WatchlistMatchType = 
  | 'NONE' 
  | 'EXACT_MATCH' 
  | 'FUZZY_NAME_MATCH' 
  | 'DOCUMENT_NUMBER_MATCH'
  | 'INTERPOL_RED_NOTICE'
  | 'SSB_BLACKLIST'
  | 'VISA_VIOLATION';

export interface WatchlistResult {
  isHit: boolean;
  matchType: WatchlistMatchType;
  threatLevel: ThreatLevel;
  matchedEntityName?: string;
  matchedAlias?: string;
  interpolNoticeId?: string;
  offenseCategory?: string;
  watchlistDatabase: string;
  details: string;
  actionRequired: string;
  isExternalGovernmentVerified?: boolean;
}

export interface RiskBreakdown {
  ocrExtractionScore: number; // 0-100
  mrzValidationScore: number; // 0-100
  tamperRiskScore: number; // 0-100
  biometricMatchScore: number; // 0-100
  watchlistThreatScore: number; // 0-100
}

export interface EvidenceSource {
  type: 'OCR_FIELD' | 'MRZ_FIELD' | 'FORENSIC_ZONE' | 'BIOMETRIC_NODAL' | 'METADATA';
  field?: string;
  value?: string;
  boundingBox?: BoundingBoxCoordinates | [number, number, number, number];
  details?: string;
}

export interface ScreeningFinding {
  id: string;
  finding_id?: string;
  sourceModule?: string;
  type?: string;
  category?: 'OCR_INTEGRITY' | 'MRZ_CHECKSUM' | 'TAMPERING' | 'BIOMETRICS' | 'WATCHLIST' | 'EXPIRY' | 'CONSISTENCY';
  code: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  boundingBox?: BoundingBoxCoordinates;
  sources?: EvidenceSource[];
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
  
  // Document Type Gate Metadata
  document_type_confidence?: number;
  document_type_evidence?: string[];
  reason_code?: string;
  screening_started?: boolean;
  
  // Core Modules Output (Nullable if screening is rejected at document gate)
  fields: DocumentField[];
  mrzData?: MRZData | null;
  tampering?: TamperingForensics | null;
  biometrics?: BiometricVerification | null;
  watchlist?: WatchlistResult | null;
  
  // Composite Evaluation (Null if screening not performed)
  risk?: CompositeRiskAssessment | null;
  
  status: 'PENDING' | 'CLEARED' | 'SECONDARY_INSPECTION' | 'DETAINED' | 'UNSUPPORTED_DOCUMENT' | 'REJECTED';
  processingTimeMs: number;
  unsupportedReason?: string;
  detectedClassificationConfidence?: number;
}

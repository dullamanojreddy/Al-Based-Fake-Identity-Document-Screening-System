import { DecisionState, RuleSeverity, RuleStatus } from '../src/types';

export interface Modification {
  type: string;
  field?: string;
  originalValue?: string;
  modifiedValue?: string;
  description: string;
}

export interface ExpectedRule {
  ruleId: string;
  expectedStatus: RuleStatus;
  expectedSeverity: RuleSeverity | 'NONE';
}

export interface DocumentTestCase {
  id: string;
  category: 'PASSPORT' | 'VISA' | 'AADHAAR' | 'DRIVING_LICENCE' | 'PERMIT';
  expectedClassification: string;
  expectedTruth: 'VALID' | 'INVALID';
  sourceData: Record<string, unknown>;
  imageVariant: {
    lighting: 'NORMAL' | 'LOW' | 'BRIGHT' | 'GLARE';
    distance: 'CLOSE' | 'NORMAL' | 'FAR';
    angle: 'STRAIGHT' | 'SLIGHT' | 'MODERATE';
    blur: 'NONE' | 'LOW' | 'MEDIUM';
    resolution: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  modifications: Modification[];
  expectedRules: ExpectedRule[];
  expectedDecision: DecisionState;
  expectedRiskRange: {
    min: number;
    max: number;
  };
  expectedEvidence: string[];
  expectedSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TestExecutionResult {
  testCase: DocumentTestCase;
  actualClassification: string;
  actualDecision: DecisionState;
  actualRiskScore: number;
  actualRules: { ruleId: string; status: RuleStatus; severity: RuleSeverity; explanation: string }[];
  actualEvidence: string[];
  passed: boolean;
  mismatches: string[];
  rootCause?: string;
  sourceFile?: string;
  recommendedFix?: string;
}

export interface CategoryPerformance {
  category: string;
  total: number;
  validCount: number;
  invalidCount: number;
  validPassed: number;
  invalidPassed: number;
  passed: number;
  failed: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  averageRisk: number;
}

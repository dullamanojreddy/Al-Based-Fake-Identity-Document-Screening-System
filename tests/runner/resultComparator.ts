import { DocumentTestCase, TestExecutionResult } from '../types';
import { RuleResult, DecisionState } from '../../src/types';

export function compareTestResult(
  testCase: DocumentTestCase,
  actualClassification: string,
  actualDecision: DecisionState,
  actualRiskScore: number,
  actualRules: RuleResult[],
  actualEvidence: string[]
): TestExecutionResult {
  const mismatches: string[] = [];

  // 1. Classification check
  if (testCase.expectedClassification !== actualClassification) {
    mismatches.push(`Classification mismatch: expected '${testCase.expectedClassification}', got '${actualClassification}'`);
  }

  // 2. Decision State check
  if (testCase.expectedDecision !== actualDecision) {
    mismatches.push(`Decision mismatch: expected '${testCase.expectedDecision}', got '${actualDecision}'`);
  }

  // 3. Risk Range check
  if (
    actualRiskScore < testCase.expectedRiskRange.min ||
    actualRiskScore > testCase.expectedRiskRange.max
  ) {
    mismatches.push(
      `Risk Score out of expected range: expected [${testCase.expectedRiskRange.min}, ${testCase.expectedRiskRange.max}], got ${actualRiskScore}`
    );
  }

  // 4. Expected Rules check
  for (const expRule of testCase.expectedRules) {
    const actual = actualRules.find(r => r.ruleId === expRule.ruleId);
    if (!actual) {
      mismatches.push(`Rule ${expRule.ruleId} was not evaluated by engine`);
    } else if (actual.status !== expRule.expectedStatus) {
      mismatches.push(`Rule ${expRule.ruleId} status mismatch: expected '${expRule.expectedStatus}', got '${actual.status}'`);
    }
  }

  const passed = mismatches.length === 0;
  let rootCause: string | undefined;
  let sourceFile: string | undefined;
  let recommendedFix: string | undefined;

  if (!passed) {
    const firstMismatch = mismatches[0];
    if (firstMismatch.includes('P06') || firstMismatch.includes('MRZ')) {
      rootCause = 'MRZ checksum 7-3-1 weight calculation or composite parity discrepancy';
      sourceFile = 'src/utils/mrzValidator.ts';
      recommendedFix = 'Verify check digit modulo-10 weights and line slice offsets';
    } else if (firstMismatch.includes('A03') || firstMismatch.includes('Verhoeff')) {
      rootCause = 'UIDAI Verhoeff Dihedral D5 modulus validation discrepancy';
      sourceFile = 'src/utils/rulesEngine.ts';
      recommendedFix = 'Inspect multiplication and permutation tables in Verhoeff validator';
    } else if (firstMismatch.includes('G08') || firstMismatch.includes('Date')) {
      rootCause = 'Date chronology or future birth date check failure';
      sourceFile = 'src/utils/rulesEngine.ts';
      recommendedFix = 'Verify Date object comparisons and regex parser';
    } else if (firstMismatch.includes('Decision')) {
      rootCause = 'Risk aggregator decision threshold mapping discrepancy';
      sourceFile = 'src/utils/rulesEngine.ts';
      recommendedFix = 'Review risk score bands for Clear, Review, Enhanced Review, and Expired states';
    }
  }

  return {
    testCase,
    actualClassification,
    actualDecision,
    actualRiskScore,
    actualRules: actualRules.map(r => ({
      ruleId: r.ruleId,
      status: r.status,
      severity: r.severity,
      explanation: r.explanation,
    })),
    actualEvidence,
    passed,
    mismatches,
    rootCause,
    sourceFile,
    recommendedFix,
  };
}

import { TestExecutionResult, CategoryPerformance } from '../types';

export function calculateMetrics(results: TestExecutionResult[]): {
  overall: CategoryPerformance;
  byCategory: Record<string, CategoryPerformance>;
} {
  const categories = ['PASSPORT', 'VISA', 'AADHAAR', 'DRIVING_LICENCE', 'PERMIT'];
  const byCategory: Record<string, CategoryPerformance> = {};

  const calculateGroup = (groupResults: TestExecutionResult[], catName: string): CategoryPerformance => {
    let validCount = 0;
    let invalidCount = 0;
    let validPassed = 0;
    let invalidPassed = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;
    let totalRisk = 0;

    for (const r of groupResults) {
      const isExpValid = r.testCase.expectedTruth === 'VALID';
      const isActValid = r.actualDecision === 'CLEAR' || r.actualDecision === 'VERIFIED';
      totalRisk += r.actualRiskScore;

      if (isExpValid) {
        validCount++;
        if (r.passed) validPassed++;
        if (isActValid) truePositives++;
        else falseNegatives++;
      } else {
        invalidCount++;
        if (r.passed) invalidPassed++;
        if (!isActValid) trueNegatives++;
        else falsePositives++;
      }
    }

    const total = groupResults.length;
    const passed = groupResults.filter(r => r.passed).length;
    const failed = total - passed;

    const accuracy = total > 0 ? (truePositives + trueNegatives) / total : 1;
    const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 1;
    const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 1;
    const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 1;
    const averageRisk = total > 0 ? Math.round(totalRisk / total) : 0;

    return {
      category: catName,
      total,
      validCount,
      invalidCount,
      validPassed,
      invalidPassed,
      passed,
      failed,
      accuracy: Math.round(accuracy * 1000) / 10,
      precision: Math.round(precision * 1000) / 10,
      recall: Math.round(recall * 1000) / 10,
      f1Score: Math.round(f1Score * 1000) / 10,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      averageRisk,
    };
  };

  for (const cat of categories) {
    const catResults = results.filter(r => r.testCase.category === cat);
    byCategory[cat] = calculateGroup(catResults, cat);
  }

  const overall = calculateGroup(results, 'OVERALL');

  return {
    overall,
    byCategory,
  };
}

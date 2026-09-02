import * as fs from 'fs';
import * as path from 'path';
import { TestExecutionResult, CategoryPerformance } from '../types';

export function generateTerminalReport(
  results: TestExecutionResult[],
  overall: CategoryPerformance,
  byCategory: Record<string, CategoryPerformance>
): string {
  let out = '';
  out += '============================================================\n';
  out += 'SENTINEL-ID COMPREHENSIVE DOCUMENT VERIFICATION TEST REPORT\n';
  out += '============================================================\n\n';

  out += `TOTAL TESTS:     ${results.length}\n`;
  out += `PASSED:          ${overall.passed}\n`;
  out += `FAILED:          ${overall.failed}\n`;
  out += `PASS RATE:       ${((overall.passed / results.length) * 100).toFixed(2)}%\n\n`;

  out += '------------------------------------------------------------\n';
  out += 'DOCUMENT CATEGORY PERFORMANCE & CONFUSION MATRIX\n';
  out += '------------------------------------------------------------\n';
  out += 'CATEGORY         TOTAL   VALID   INVALID   ACC%   PREC%   REC%   F1%\n';
  out += '------------------------------------------------------------\n';

  for (const [cat, p] of Object.entries(byCategory)) {
    const catPad = cat.padEnd(16, ' ');
    const totPad = p.total.toString().padEnd(7, ' ');
    const valPad = `${p.validPassed}/${p.validCount}`.padEnd(8, ' ');
    const invPad = `${p.invalidPassed}/${p.invalidCount}`.padEnd(10, ' ');
    const accPad = `${p.accuracy}%`.padEnd(7, ' ');
    const prcPad = `${p.precision}%`.padEnd(8, ' ');
    const recPad = `${p.recall}%`.padEnd(7, ' ');
    const f1Pad = `${p.f1Score}%`;

    out += `${catPad}${totPad}${valPad}${invPad}${accPad}${prcPad}${recPad}${f1Pad}\n`;
  }
  out += '------------------------------------------------------------\n\n';

  // Decision Breakdown
  const decisionCounts: Record<string, number> = {};
  for (const r of results) {
    decisionCounts[r.actualDecision] = (decisionCounts[r.actualDecision] || 0) + 1;
  }

  out += '------------------------------------------------------------\n';
  out += 'DECISION STATE DISTRIBUTION\n';
  out += '------------------------------------------------------------\n';
  for (const [dec, count] of Object.entries(decisionCounts)) {
    out += `${dec.padEnd(24, ' ')}: ${count}\n`;
  }
  out += '\n';

  // Failed Tests Diagnostic Section
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    out += '------------------------------------------------------------\n';
    out += `FAILED TESTS DIAGNOSTIC REPORT (${failedTests.length} CASES)\n`;
    out += '------------------------------------------------------------\n';

    for (const f of failedTests) {
      out += `\n------------------------------------------------------------\n`;
      out += `TEST ID:          ${f.testCase.id} (${f.testCase.category})\n`;
      out += `EXPECTED:         ${f.testCase.expectedDecision} (Truth: ${f.testCase.expectedTruth}, Risk: [${f.testCase.expectedRiskRange.min}-${f.testCase.expectedRiskRange.max}])\n`;
      out += `ACTUAL:           ${f.actualDecision} (Risk: ${f.actualRiskScore})\n`;
      out += `MISMATCHES:       ${f.mismatches.join('; ')}\n`;
      if (f.rootCause) out += `ROOT CAUSE:       ${f.rootCause}\n`;
      if (f.sourceFile) out += `SOURCE FILE:      ${f.sourceFile}\n`;
      if (f.recommendedFix) out += `RECOMMENDED FIX:  ${f.recommendedFix}\n`;
    }
  } else {
    out += '============================================================\n';
    out += '🎉 ALL 200 TEST FIXTURES PASSED WITH ZERO MISMATCHES!\n';
    out += '============================================================\n';
  }

  return out;
}

export function saveAllReports(
  results: TestExecutionResult[],
  overall: CategoryPerformance,
  byCategory: Record<string, CategoryPerformance>,
  reportsDir: string,
  txtPath: string
): void {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // 1. JSON Report
  const jsonReport = {
    timestamp: new Date().toISOString(),
    overall,
    byCategory,
    results: results.map(r => ({
      id: r.testCase.id,
      category: r.testCase.category,
      expectedTruth: r.testCase.expectedTruth,
      expectedDecision: r.testCase.expectedDecision,
      actualDecision: r.actualDecision,
      expectedRiskRange: r.testCase.expectedRiskRange,
      actualRiskScore: r.actualRiskScore,
      passed: r.passed,
      mismatches: r.mismatches,
    })),
  };
  fs.writeFileSync(path.join(reportsDir, 'latest.json'), JSON.stringify(jsonReport, null, 2), 'utf-8');

  // 2. Comprehensive all_200_test_cases.txt
  let txtContent = '';
  txtContent += '====================================================================================\n';
  outLine('SENTINEL-ID COMPLETE 200-CASE AUTOMATED VERIFICATION TEST FIXTURE EXECUTION MANIFEST');
  txtContent += '====================================================================================\n';
  txtContent += `Generated: ${new Date().toISOString()}\n`;
  txtContent += `Total Test Cases: ${results.length} | Passed: ${overall.passed} | Failed: ${overall.failed} | Pass Rate: ${((overall.passed / results.length) * 100).toFixed(2)}%\n\n`;

  for (const r of results) {
    const tc = r.testCase;
    txtContent += `------------------------------------------------------------------------------------\n`;
    txtContent += `[${r.passed ? 'PASS' : 'FAIL'}] TEST CASE: ${tc.id} | CATEGORY: ${tc.category} | TRUTH: ${tc.expectedTruth}\n`;
    txtContent += `Image Variant: Lighting=${tc.imageVariant.lighting}, Dist=${tc.imageVariant.distance}, Angle=${tc.imageVariant.angle}, Blur=${tc.imageVariant.blur}, Res=${tc.imageVariant.resolution}\n`;
    txtContent += `Expected Decision: ${tc.expectedDecision} | Actual Decision: ${r.actualDecision}\n`;
    txtContent += `Expected Risk Range: [${tc.expectedRiskRange.min}, ${tc.expectedRiskRange.max}] | Actual Risk: ${r.actualRiskScore}\n`;
    if (tc.modifications.length > 0) {
      txtContent += `Modifications: ${tc.modifications.map(m => `[${m.type}] ${m.description}`).join('; ')}\n`;
    }
    if (!r.passed) {
      txtContent += `Status: FAILED - ${r.mismatches.join(' | ')}\n`;
      if (r.rootCause) txtContent += `Root Cause: ${r.rootCause}\n`;
    } else {
      txtContent += `Status: PASSED\n`;
    }
    txtContent += `\n`;
  }

  fs.writeFileSync(txtPath, txtContent, 'utf-8');

  function outLine(str: string) {
    txtContent += `${str}\n`;
  }
}

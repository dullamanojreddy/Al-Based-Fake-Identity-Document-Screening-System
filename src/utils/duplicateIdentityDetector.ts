import { DocumentField, ScreeningFinding } from '../types';

export interface DuplicateIdentityMatch {
  matchType: 'SAME_DOC_DIFF_NAME' | 'SAME_PERSON_DIFF_DOC' | 'HIGH_SIMILARITY_ALIAS';
  confidence: number; // 0-100%
  description: string;
  matchedRecord: {
    travelerName: string;
    documentNumber: string;
    dob: string;
    nationality: string;
    previousScreeningId: string;
    dateScreened: string;
  };
  threatLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}

export interface DuplicateIdentityResult {
  hasDuplicateFlag: boolean;
  matches: DuplicateIdentityMatch[];
  details: string;
}

// Normalized helper
function normalizeString(val: string): string {
  return (val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

/**
 * Historical/synthetic registry of previously processed identities at checkpoint
 */
const HISTORICAL_REGISTRY = [
  {
    travelerName: 'VLADIMIR IVANOV',
    documentNumber: 'A77192083',
    dob: '1981-05-19',
    nationality: 'AUT',
    previousScreeningId: 'SSB-HIST-2025-8819',
    dateScreened: '2025-11-14',
  },
  {
    travelerName: 'MAXIMILIAN KLAUS WEBER',
    documentNumber: 'P99201481',
    dob: '1981-05-19',
    nationality: 'DEU',
    previousScreeningId: 'SSB-HIST-2025-9041',
    dateScreened: '2025-12-02',
  },
  {
    travelerName: 'RAJESH KUMAR ROY',
    documentNumber: 'BP7890124',
    dob: '1988-04-12',
    nationality: 'NPL',
    previousScreeningId: 'SSB-HIST-2026-0112',
    dateScreened: '2026-01-20',
  },
  {
    travelerName: 'ARJUN VIKRAM SHARMA',
    documentNumber: 'Z4829104',
    dob: '1994-08-15',
    nationality: 'IND',
    previousScreeningId: 'SSB-HIST-2026-0091',
    dateScreened: '2026-02-10',
  },
];

/**
 * Scans current traveler identity against historical screening registry
 * to detect identity cloning, document number collisions, and alias variations.
 */
export function checkDuplicateIdentities(
  travelerName: string,
  documentNumber: string,
  dob: string,
  nationality?: string
): DuplicateIdentityResult {
  const normName = normalizeString(travelerName);
  const normDoc = normalizeString(documentNumber);
  const normDob = normalizeString(dob).replace(/-/g, '');

  const matches: DuplicateIdentityMatch[] = [];

  if (!normName && !normDoc) {
    return {
      hasDuplicateFlag: false,
      matches: [],
      details: 'Insufficient biographical input for duplicate identity matching.',
    };
  }

  for (const record of HISTORICAL_REGISTRY) {
    const recName = normalizeString(record.travelerName);
    const recDoc = normalizeString(record.documentNumber);
    const recDob = normalizeString(record.dob).replace(/-/g, '');

    // Case 1: Same Document Number but Different Name (Identity Theft / Cloned Credential)
    if (normDoc && recDoc && normDoc === recDoc && normName !== recName) {
      matches.push({
        matchType: 'SAME_DOC_DIFF_NAME',
        confidence: 96,
        threatLevel: 'CRITICAL',
        description: `Document number collision: Credential ${documentNumber} was previously presented under the name "${record.travelerName}" on ${record.dateScreened}. Probable cloned or forged substrate.`,
        matchedRecord: record,
      });
    }

    // Case 2: Same Name + Same DOB but Different Document Number (Alias / Multi-Passport Holder)
    else if (normName && recName && normName === recName && normDob === recDob && normDoc !== recDoc && normDoc) {
      matches.push({
        matchType: 'SAME_PERSON_DIFF_DOC',
        confidence: 88,
        threatLevel: 'HIGH',
        description: `Multiple Identity Alert: Subject "${travelerName}" (DOB: ${dob}) previously crossed using credential ${record.documentNumber} (${record.nationality}) on ${record.dateScreened}. Multi-passport cross-check required.`,
        matchedRecord: record,
      });
    }

    // Case 3: Same DOB + Same Country + Name Substring / Alias variation
    else if (normDob && recDob && normDob === recDob && (normName.includes(recName) || recName.includes(normName)) && normName !== recName) {
      matches.push({
        matchType: 'HIGH_SIMILARITY_ALIAS',
        confidence: 82,
        threatLevel: 'MEDIUM',
        description: `Potential Alias Match: Biographical profile (DOB: ${dob}) matches prior screening record for "${record.travelerName}" under case ${record.previousScreeningId}.`,
        matchedRecord: record,
      });
    }
  }

  const hasDuplicateFlag = matches.length > 0;
  const details = hasDuplicateFlag
    ? `Duplicate Identity Alert: Found ${matches.length} matching profile(s) in border crossing registry.`
    : 'No duplicate identity flags or cross-credential collisions detected.';

  return {
    hasDuplicateFlag,
    matches,
    details,
  };
}

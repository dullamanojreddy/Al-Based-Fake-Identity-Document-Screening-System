import { DocumentField, BoundingBoxCoordinates } from '../types';

export interface RawOcrLine {
  text: string;
  confidence?: number;
  boundingBox?: BoundingBoxCoordinates;
}

/**
 * Safely extracts identity document fields using strict label-value associations.
 * Prevents arbitrary dates, names, or numbers in non-identity documents from being mapped.
 */
export function extractIdentityFields(
  rawText: string,
  lines: RawOcrLine[] = []
): { fields: DocumentField[]; totalConfidence: number } {
  const fields: DocumentField[] = [];
  const upperText = rawText.toUpperCase();

  // Helper to find label-associated value from lines or regex
  const findLabelAssociatedValue = (
    labelPatterns: RegExp[],
    valueExtractor: RegExp,
    defaultBbox: BoundingBoxCoordinates
  ): { value: string; labelDetected: boolean; bbox: BoundingBoxCoordinates; conf: number } | null => {
    // 1. Check line by line for label followed by value
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upperLine = line.text.toUpperCase();

      for (const labelPat of labelPatterns) {
        if (labelPat.test(upperLine)) {
          // Check if value is in same line
          const match = upperLine.match(valueExtractor);
          if (match && match[1]) {
            return {
              value: match[1].trim(),
              labelDetected: true,
              bbox: line.boundingBox || defaultBbox,
              conf: line.confidence || 96.5,
            };
          }

          // Check next line
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextMatch = nextLine.text.toUpperCase().match(valueExtractor);
            if (nextMatch && nextMatch[1]) {
              return {
                value: nextMatch[1].trim(),
                labelDetected: true,
                bbox: nextLine.boundingBox || defaultBbox,
                conf: nextLine.confidence || 94.0,
              };
            }
          }
        }
      }
    }

    // 2. Global pattern match with label requirement
    for (const labelPat of labelPatterns) {
      const combinedPat = new RegExp(`${labelPat.source}[:\\s/]+(${valueExtractor.source})`, 'i');
      const globalMatch = upperText.match(combinedPat);
      if (globalMatch && globalMatch[1]) {
        return {
          value: globalMatch[1].trim(),
          labelDetected: true,
          bbox: defaultBbox,
          conf: 92.0,
        };
      }
    }

    return null;
  };

  // 1. Passport / Document Number (Requires label "Passport No", "Document No", etc.)
  const docNumResult = findLabelAssociatedValue(
    [/PASSPORT\s*(?:NO|NUMBER|N°)/, /DOCUMENT\s*(?:NO|NUMBER)/, /TYPE\s*\/\s*CODE\s*P/],
    /([A-Z0-9]{7,10})/,
    { x: 63, y: 30, width: 16, height: 4 }
  );
  if (docNumResult) {
    fields.push({
      key: 'passportNumber',
      label: 'Passport Number',
      value: docNumResult.value,
      confidence: docNumResult.conf,
      source: 'visual_zone',
      labelDetected: true,
      validation: 'VALID',
      boundingBox: docNumResult.bbox,
    });
  }

  // 2. Surname / Given Names
  const surnameResult = findLabelAssociatedValue(
    [/SURNAME/, /NOM/, /LAST\s*NAME/],
    /([A-Z\s]{2,30})/,
    { x: 41, y: 34, width: 22, height: 4 }
  );
  if (surnameResult) {
    fields.push({
      key: 'surname',
      label: 'Surname',
      value: surnameResult.value,
      confidence: surnameResult.conf,
      source: 'visual_zone',
      labelDetected: true,
      validation: 'VALID',
      boundingBox: surnameResult.bbox,
    });
  }

  const givenNamesResult = findLabelAssociatedValue(
    [/GIVEN\s*NAMES?/, /PRÉNOMS?/, /FIRST\s*NAME/],
    /([A-Z\s]{2,30})/,
    { x: 41, y: 39, width: 26, height: 4 }
  );
  if (givenNamesResult) {
    fields.push({
      key: 'givenNames',
      label: 'Given Names',
      value: givenNamesResult.value,
      confidence: givenNamesResult.conf,
      source: 'visual_zone',
      labelDetected: true,
      validation: 'VALID',
      boundingBox: givenNamesResult.bbox,
    });
  }

  // 3. Date of Birth (STRICT: Must have explicit DOB label, never map arbitrary dates!)
  const dobResult = findLabelAssociatedValue(
    [/DATE\s*OF\s*BIRTH/, /\bDOB\b/, /BIRTH\s*DATE/, /DATE\s*DE\s*NAISSANCE/],
    /(\d{2}[-/\s][A-Z]{3,9}[-/\s]\d{4}|\d{2}[-/\s]\d{2}[-/\s]\d{4}|\d{4}[-/\s]\d{2}[-/\s]\d{2})/,
    { x: 41, y: 49, width: 18, height: 4.5 }
  );
  if (dobResult) {
    fields.push({
      key: 'dob',
      label: 'Date of Birth',
      value: dobResult.value,
      confidence: dobResult.conf,
      source: 'visual_zone',
      labelDetected: true,
      validation: 'VALID',
      boundingBox: dobResult.bbox,
    });
  }

  // 4. Nationality
  const nationalityResult = findLabelAssociatedValue(
    [/NATIONALITY/, /NATIONALITÉ/, /CITIZENSHIP/],
    /([A-Z]{3,20})/,
    { x: 41, y: 44, width: 12, height: 4 }
  );
  if (nationalityResult) {
    fields.push({
      key: 'nationality',
      label: 'Nationality',
      value: nationalityResult.value,
      confidence: nationalityResult.conf,
      source: 'visual_zone',
      labelDetected: true,
      validation: 'VALID',
      boundingBox: nationalityResult.bbox,
    });
  }

  // 5. Date of Expiry
  const expiryResult = findLabelAssociatedValue(
    [/DATE\s*OF\s*EXPIRY/, /EXPIRATION\s*DATE/, /EXPIRES\s*ON/, /DATE\s*D'EXPIRATION/],
    /(\d{2}[-/\s][A-Z]{3,9}[-/\s]\d{4}|\d{2}[-/\s]\d{2}[-/\s]\d{4}|\d{4}[-/\s]\d{2}[-/\s]\d{2})/,
    { x: 41, y: 62.5, width: 18, height: 4 }
  );
  if (expiryResult) {
    fields.push({
      key: 'expiryDate',
      label: 'Date of Expiry',
      value: expiryResult.value,
      confidence: expiryResult.conf,
      source: 'visual_zone',
      labelDetected: true,
      validation: 'VALID',
      boundingBox: expiryResult.bbox,
    });
  }

  // 6. Sex / Gender
  const sexResult = findLabelAssociatedValue(
    [/\bSEX\b/, /\bSEXE\b/, /\bGENDER\b/],
    /([MFX<])/,
    { x: 41, y: 53.5, width: 8, height: 4 }
  );
  if (sexResult) {
    fields.push({
      key: 'sex',
      label: 'Sex',
      value: sexResult.value,
      confidence: sexResult.conf,
      source: 'visual_zone',
      labelDetected: true,
      validation: 'VALID',
      boundingBox: sexResult.bbox,
    });
  }

  const avgConfidence = fields.length > 0
    ? fields.reduce((acc, f) => acc + f.confidence, 0) / fields.length
    : 0;

  return {
    fields,
    totalConfidence: Math.round(avgConfidence * 10) / 10,
  };
}

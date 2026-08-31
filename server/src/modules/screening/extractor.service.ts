export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  labelDetected: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export class FieldExtractorService {
  extractFields(rawText: string): ExtractedField[] {
    const fields: ExtractedField[] = [];
    const upperText = rawText.toUpperCase();

    // 1. Passport Number
    const docMatch = upperText.match(/(?:PASSPORT\s*(?:NO|NUMBER|N°)|DOCUMENT\s*(?:NO|NUMBER))[:\s/]+([A-Z0-9]{7,10})/i);
    if (docMatch && docMatch[1]) {
      fields.push({
        key: 'passportNumber',
        label: 'Passport Number',
        value: docMatch[1].trim(),
        confidence: 99.2,
        labelDetected: true,
        boundingBox: { x: 63, y: 30, width: 16, height: 4 },
      });
    }

    // 2. Full Name
    const nameMatch = upperText.match(/(?:SURNAME|NAME|NOM)[:\s/]+([A-Z\s]{3,30})/i);
    if (nameMatch && nameMatch[1]) {
      fields.push({
        key: 'fullName',
        label: 'Full Name',
        value: nameMatch[1].trim(),
        confidence: 98.6,
        labelDetected: true,
        boundingBox: { x: 41, y: 34, width: 26, height: 8 },
      });
    }

    // 3. Date of Birth (STRICT label association)
    const dobMatch = upperText.match(/(?:DATE\s*OF\s*BIRTH|\bDOB\b|BIRTH\s*DATE)[:\s/]+(\d{2}[-/\s][A-Z]{3,9}[-/\s]\d{4}|\d{2}[-/\s]\d{2}[-/\s]\d{4}|\d{4}[-/\s]\d{2}[-/\s]\d{2})/i);
    if (dobMatch && dobMatch[1]) {
      fields.push({
        key: 'dob',
        label: 'Date of Birth',
        value: dobMatch[1].trim(),
        confidence: 98.1,
        labelDetected: true,
        boundingBox: { x: 41, y: 49, width: 18, height: 4.5 },
      });
    }

    // 4. Date of Expiry
    const expMatch = upperText.match(/(?:DATE\s*OF\s*EXPIRY|EXPIRATION\s*DATE|EXPIRES\s*ON)[:\s/]+(\d{2}[-/\s][A-Z]{3,9}[-/\s]\d{4}|\d{2}[-/\s]\d{2}[-/\s]\d{4}|\d{4}[-/\s]\d{2}[-/\s]\d{2})/i);
    if (expMatch && expMatch[1]) {
      fields.push({
        key: 'expiryDate',
        label: 'Date of Expiry',
        value: expMatch[1].trim(),
        confidence: 99.0,
        labelDetected: true,
        boundingBox: { x: 41, y: 62.5, width: 18, height: 4 },
      });
    }

    // 5. Nationality
    const natMatch = upperText.match(/(?:NATIONALITY|CITIZENSHIP)[:\s/]+([A-Z]{3,20})/i);
    if (natMatch && natMatch[1]) {
      fields.push({
        key: 'nationality',
        label: 'Nationality',
        value: natMatch[1].trim(),
        confidence: 99.5,
        labelDetected: true,
        boundingBox: { x: 41, y: 44, width: 12, height: 4 },
      });
    }

    return fields;
  }
}

export const extractorService = new FieldExtractorService();

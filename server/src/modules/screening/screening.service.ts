import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';
import { classifierService } from './classifier.service';
import { extractorService } from './extractor.service';

/**
 * Server-side screening engine with Document Classification Gate & Vision Multimodal fallback
 */
export class ScreeningService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const keys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
    if (keys.length > 0) {
      this.ai = new GoogleGenAI({ apiKey: keys[0] });
    }
  }

  /**
   * Run multi-layer screening on uploaded document buffer
   */
  async screenDocumentWithAI(fileBuffer: Buffer, mimeType: string, fileName: string = 'document.pdf') {
    // 1. Run Document Classification Gate
    const classification = classifierService.classify(fileName, '');

    if (!classification.isSupported) {
      return {
        success: true,
        data: {
          status: 'UNSUPPORTED_DOCUMENT',
          documentType: 'unsupported_document',
          document_type_confidence: classification.confidence,
          document_type_evidence: classification.evidence,
          reason_code: 'UNSUPPORTED_DOCUMENT',
          reason: classification.rejectionReasons.join(' '),
          screening_started: false,
          mrz: null,
          extracted_fields: [],
          forensic_findings: [],
          face_verification: null,
          watchlist_result: null,
          risk_score: null,
          recommendation: null,
        },
      };
    }

    // 2. If AI is configured, execute multimodal vision OCR
    if (this.ai) {
      try {
        const base64Data = fileBuffer.toString('base64');
        const prompt = `You are a forensic document examiner for the Ministry of Home Affairs (Sashastra Seema Bal - SSB).
Examine this identity travel document (Passport, Visa, ID, Permit) and extract all information in structured JSON format.

First check: Is this a genuine identity/travel document? If NO, set "status": "UNSUPPORTED_DOCUMENT" and empty fields.

If YES:
1. Document Type (passport, visa, national_id, border_permit)
2. Visual text fields with bounding box estimates and confidence
3. Machine Readable Zone (MRZ Lines 1 & 2 if present)
4. Forensic tampering signs (Photo replacement, font/baseline alterations, cloned stamps, visual splicing)
5. Generate composite risk score (0-100) and flag anomalies.

Output strictly valid JSON with keys:
{
  "status": string,
  "documentType": string,
  "travelerName": string,
  "nationality": string,
  "documentNumber": string,
  "dob": string,
  "expiryDate": string,
  "fields": Array<{ "key": string, "label": string, "value": string, "confidence": number, "isTampered": boolean }>,
  "mrzLines": Array<string>,
  "tamperingDetected": boolean,
  "tamperDetails": string,
  "riskScore": number,
  "recommendedAction": string
}`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        });

        const text = response.text || '{}';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          success: true,
          data: parsed,
        };
      } catch (err: any) {
        console.error('Gemini screening error, fallback to deterministic parser:', err);
      }
    }

    // 3. Fallback deterministic extraction for supported document
    const extractedFields = extractorService.extractFields(fileName);

    return {
      success: true,
      data: {
        status: 'OCR_UNAVAILABLE',
        documentType: classification.detectedType,
        document_type_confidence: classification.confidence,
        document_type_evidence: classification.evidence,
        screening_started: true,
        travelerName: 'UNKNOWN',
        nationality: 'UNKNOWN',
        documentNumber: '',
        dob: 'UNKNOWN',
        expiryDate: 'UNKNOWN',
        fields: extractedFields,
        mrzLines: [],
        tamperingDetected: false,
        tamperDetails: 'AI OCR service unavailable. Forensic analysis requires manual inspection.',
        riskScore: 0,
        recommendedAction: 'OCR service offline. Manual document verification required.',
      },
    };
  }
}

export const screeningService = new ScreeningService();

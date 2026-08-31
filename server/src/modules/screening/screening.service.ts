import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';

/**
 * Server-side screening engine using Gemini Multimodal Vision API
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
   * Run multi-modal vision screening on uploaded document buffer
   */
  async screenDocumentWithAI(fileBuffer: Buffer, mimeType: string) {
    if (!this.ai) {
      return {
        success: false,
        error: 'Gemini AI API key not configured',
      };
    }

    try {
      const base64Data = fileBuffer.toString('base64');
      const prompt = `You are a forensic document examiner for the Ministry of Home Affairs (Sashastra Seema Bal - SSB).
Examine this identity travel document (Passport, Visa, ID, Permit) and extract all information in structured JSON format.

Analyze:
1. Document Type (passport, visa, national_id, border_permit)
2. Visual text fields (Full Name, Document Number, Nationality, DOB, Expiry, Gender, Place of Issue)
3. Machine Readable Zone (MRZ Lines 1 & 2 if present)
4. Forensic tampering signs (Photo replacement, font/baseline alterations, cloned stamps, visual splicing)
5. Generate composite risk score (0-100) and flag anomalies.

Output strictly valid JSON with keys:
{
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
      console.error('Gemini screening error:', err);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export const screeningService = new ScreeningService();

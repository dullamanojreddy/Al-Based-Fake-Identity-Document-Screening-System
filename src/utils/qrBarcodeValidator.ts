import jsQR from 'jsqr';
import { DocumentField, QRPayloadField, QRPayloadFormat, QRValidationResult } from '../types';

async function decodeQrFromImage(imageSource: string | HTMLImageElement): Promise<{ data: string; found: boolean } | null> {
  return new Promise(resolve => {
    const img = typeof imageSource === 'string' ? new Image() : imageSource;
    if (typeof imageSource === 'string') { img.crossOrigin = 'anonymous'; img.src = imageSource; }
    const process = () => {
      try {
        const natW = img.naturalWidth || img.width, natH = img.naturalHeight || img.height;
        if (!natW || !natH) { resolve(null); return; }
        for (const scale of [1, 2, 0.5]) {
          const width = Math.max(1, Math.round(natW * scale)), height = Math.max(1, Math.round(natH * scale));
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) continue;
          ctx.imageSmoothingEnabled = scale < 1; ctx.drawImage(img, 0, 0, width, height);
          const result = jsQR(ctx.getImageData(0, 0, width, height).data, width, height, { inversionAttempts: 'attemptBoth' });
          if (result && result.data) { resolve({ data: result.data, found: true }); return; }
        }
        resolve({ data: '', found: false });
      } catch { resolve(null); }
    };
    if (img.complete && (img.naturalWidth || img.width)) process();
    else { img.onload = process; img.onerror = () => resolve(null); }
  });
}

function parseUidaiNumericPayload(raw: string): QRPayloadField[] {
  const fields: QRPayloadField[] = [];
  const parts = raw.split(/[\n\r]+|(?<=\d{4})(?=[A-Za-z]{2,})/g);
  for (const part of parts) {
    const t = part.trim(); if (!t) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) fields.push({ key: 'dob', value: t });
    else if (/^\d{6}$/.test(t)) fields.push({ key: 'postcode', value: t });
    else if (/^(MALE|FEMALE|M|F|TRANSGENDER)$/i.test(t)) fields.push({ key: 'gender', value: t.toUpperCase() });
    else if (/^[A-Za-z][A-Za-z\s\.']{2,60}$/.test(t) && !/^\d+$/.test(t)) fields.push({ key: 'name', value: t.trim() });
  }
  return fields;
}

function parseGenericPayload(raw: string): QRPayloadField[] {
  const fields: QRPayloadField[] = [];
  const kvRegex = /([A-Za-z_ ]{2,20})\s*[:=]\s*([^,\n;]{1,60})/g; let m: RegExpExecArray | null;
  while ((m = kvRegex.exec(raw)) !== null) { fields.push({ key: m[1].trim().toLowerCase().replace(/\s+/g, '_'), value: m[2].trim() }); }
  if (fields.length === 0) {
    const dateMatch = raw.match(/\d{2}[/-]\d{2}[/-]\d{4}|\d{4}-\d{2}-\d{2}/);
    if (dateMatch) fields.push({ key: 'dob', value: dateMatch[0] });
    const nameMatch = raw.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/);
    if (nameMatch) fields.push({ key: 'name', value: nameMatch[0] });
  }
  return fields;
}

function detectPayloadFormat(raw: string): QRPayloadFormat {
  if (/^\d{8,}/.test(raw) && !/[A-Za-z]/.test(raw.slice(0, 40))) return 'NUMERIC_COMPRESSED';
  if (raw.includes('UIDAI') || raw.includes('<?xml') || raw.includes('<PrintLetterBarcodeData')) return 'UIDAI_XML';
  if (/[A-Za-z]{2,}/.test(raw)) return 'PLAIN_TEXT';
  return 'UNKNOWN';
}

function normalizeName(name: string) { return name.toUpperCase().replace(/[^A-Z]/g, ''); }
function normalizeDate(raw: string): string | null {
  const c = raw.trim(); let m = c.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}${m[2]}${m[3]}`;
  m = c.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/); if (m) return `${m[3]}${m[2]}${m[1]}`;
  m = c.match(/^(\d{2})(\d{2})(\d{4})$/); if (m) return `${m[3]}${m[2]}${m[1]}`; return null;
}

export async function validateDocumentQr(imageSource: string | HTMLImageElement, visibleFields: DocumentField[]): Promise<QRValidationResult> {
  const decodeResult = await decodeQrFromImage(imageSource);
  if (!decodeResult) return { qrDetected: false, decoded: false, payloadFormat: 'NONE', payloadFields: [], matches: [], mismatches: [], consistencyScore: 50, details: 'QR analysis unavailable (image could not be processed).' };
  if (!decodeResult.found) return { qrDetected: false, decoded: false, payloadFormat: 'NONE', payloadFields: [], matches: [], mismatches: [], consistencyScore: 50, details: 'No QR code detected. QR cross-validation skipped (neutral).' };

  const rawPayload = decodeResult.data; const payloadFormat = detectPayloadFormat(rawPayload);
  let payloadFields: QRPayloadField[] = [];
  if (payloadFormat === 'UIDAI_XML') {
    const nameMatch = rawPayload.match(/<name>([^<]+)<\/name>/i); const dobMatch = rawPayload.match(/<dob>([^<]+)<\/dob>/i); const genderMatch = rawPayload.match(/<gender>([^<]+)<\/gender>/i);
    if (nameMatch) payloadFields.push({ key: 'name', value: nameMatch[1].trim() });
    if (dobMatch) payloadFields.push({ key: 'dob', value: dobMatch[1].trim() });
    if (genderMatch) payloadFields.push({ key: 'gender', value: genderMatch[1].trim().toUpperCase() });
  } else if (payloadFormat === 'NUMERIC_COMPRESSED') { payloadFields = parseUidaiNumericPayload(rawPayload); }
  else { payloadFields = parseGenericPayload(rawPayload); }

  const matches: string[] = []; const mismatches: string[] = [];
  const visibleName = visibleFields.find(f => f.key === 'fullName' || f.key === 'surname')?.value || '';
  const visibleDob = visibleFields.find(f => f.key === 'dob')?.value || '';
  const visibleGender = visibleFields.find(f => f.key === 'gender' || f.key === 'sex')?.value || '';

  for (const pf of payloadFields) {
    if (pf.key === 'name' && visibleName) { if (normalizeName(pf.value) === normalizeName(visibleName)) matches.push(`Name: QR "${pf.value}" matches visible "${visibleName}".`); else mismatches.push(`NAME MISMATCH: QR says "${pf.value}" but visible name is "${visibleName}".`); }
    else if (pf.key === 'dob' && visibleDob) { const qd = normalizeDate(pf.value), vd = normalizeDate(visibleDob); if (qd && vd && qd === vd) matches.push('Date of Birth: QR matches visible.'); else if (qd && vd) mismatches.push(`DOB MISMATCH: QR decodes to ${qd} but visible DOB is ${vd}.`); }
    else if (pf.key === 'gender' && visibleGender) { const g = pf.value.trim().toUpperCase(), v = visibleGender.trim().toUpperCase(); const ok = g === v || (g === 'M' && v === 'MALE') || (g === 'F' && v === 'FEMALE') || (v === 'M' && g === 'MALE') || (v === 'F' && g === 'FEMALE'); if (ok) matches.push('Gender: QR matches visible.'); else mismatches.push(`GENDER MISMATCH: QR says "${pf.value}" but visible says "${visibleGender}".`); }
  }

  let consistencyScore: number; let details: string;
  if (payloadFields.length === 0) { consistencyScore = 50; details = `QR decoded but payload is a binary/signed stream. Preview: ${rawPayload.slice(0,48).replace(/[^\x20-\x7E]/g, '·')}...`; }
  else if (mismatches.length > 0) { consistencyScore = Math.max(0, 100 - mismatches.length * 40); details = `QR cross-validation found ${mismatches.length} mismatch(es). ${mismatches.join(' ')}`; }
  else { consistencyScore = 100; details = `QR payload decoded (${payloadFormat}) and all ${matches.length} comparable field(s) match visible data.`; }

  return { qrDetected: true, decoded: true, payloadFormat, rawPayloadPreview: rawPayload.slice(0,120).replace(/[^\x20-\x7E]/g, '·'), payloadFields, matches, mismatches, consistencyScore, details };
}

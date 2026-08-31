import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

/**
 * Derives a 32-byte key from the encryption password using scrypt.
 * Falls back to a default password if env var is not set.
 */
const getEncryptionKey = (): Buffer => {
  const password = process.env.DB_ENCRYPTION_PWD || 'evalai-default-encryption-key-change-in-prod';
  return crypto.scryptSync(password, 'evalai-salt', 32);
};

const key = getEncryptionKey();
const iv = Buffer.alloc(16, 0); // Static IV for deterministic encryption (acceptable for field-level search)

/**
 * Encrypts a plaintext field value using AES-256-CBC.
 * Returns hex-encoded ciphertext.
 */
export const encryptField = (text: string): string => {
  if (!text || text.trim().length === 0) return text;
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * Decrypts a hex-encoded ciphertext back to plaintext using AES-256-CBC.
 */
export const decryptField = (encryptedText: string): string => {
  if (!encryptedText || encryptedText.trim().length === 0) return encryptedText;
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails, return original (could be plaintext from before encryption was implemented)
    return encryptedText;
  }
};


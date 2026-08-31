import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from project root (eval_ai/.env), not server/.env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Validates required environment variables at startup
 */
function validateEnv(): void {
  const requiredVars: { key: string; name: string; optional?: boolean }[] = [
    { key: 'GEMINI_API_KEY', name: 'Gemini API Key', optional: true },
    { key: 'PORT', name: 'Server Port', optional: true },
    { key: 'MONGODB_URI', name: 'MongoDB URI', optional: true },
    { key: 'CORS_ORIGIN', name: 'CORS Origin', optional: true },
  ];

  for (const v of requiredVars) {
    if (!v.optional && (!process.env[v.key] || process.env[v.key] === `your_${v.key.toLowerCase()}`)) {
      console.error(`❌ Missing required environment variable: ${v.key} (${v.name})`);
      console.error(`   Set it in .env (project root) or as an environment variable.`);
      if (!v.optional) {
        process.exit(1);
      }
    }
  }
}

validateEnv();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/Scripthub',
  /** Single Gemini API key — you control the value; put one key or comma-separated keys as you wish */
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  /** AI provider: 'OLLAMA' (local) or 'GEMINI' (cloud). Defaults to OLLAMA. */
  AI_PROVIDER: process.env.AI_PROVIDER || 'OLLAMA',
  /** Ollama REST API URL */
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  /** Ollama model name (e.g. qwen3:4b, llama3, etc.) */
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen3:4b',
  JWT_SECRET: process.env.JWT_SECRET || 'evalai-jwt-secret-key-change-in-production',
  DB_ENCRYPTION_PWD: process.env.DB_ENCRYPTION_PWD || 'evalai-default-encryption-key-change-in-prod',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || '+14155238886',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  LOG_DIR: process.env.LOG_DIR || './logs',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  PYTHON_PATH: process.env.PYTHON_PATH || 'python',
  API_PREFIX: '/api/v1',
  isDev: () => env.NODE_ENV === 'development',
  isProd: () => env.NODE_ENV === 'production',
};

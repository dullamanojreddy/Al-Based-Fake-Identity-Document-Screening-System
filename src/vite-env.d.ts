/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'jsqr' {
  interface QRCode {
    binaryData: number[];
    data: string;
    chunks: any[];
    version: number;
    location: any;
  }
  interface Options {
    inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst';
  }
  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    providedOptions?: Options
  ): QRCode | null;
}


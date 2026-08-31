import { ScreeningSession } from '../types';

// Helper to generate realistic high-resolution SVG mock document graphics
export function createSampleDocumentSvg(
  type: 'genuine_passport' | 'photo_replaced' | 'tampered_dob' | 'forged_visa' | 'interpol_fugitive'
): string {
  const width = 800;
  const height = 540;

  if (type === 'genuine_passport') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 0,20 Q 10,0 20,20 T 40,20" fill="none" stroke="%23334155" stroke-width="0.75" opacity="0.4"/>
          <circle cx="20" cy="20" r="12" fill="none" stroke="%231e3a8a" stroke-width="0.5" opacity="0.25"/>
        </pattern>
      </defs>
      
      <!-- Document Outer Page -->
      <rect width="${width}" height="${height}" rx="16" fill="url(%23bgGrad)" stroke="%2338bdf8" stroke-width="2"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1"/>
      <rect x="25" y="25" width="${width - 50}" height="${height - 50}" fill="url(%23guilloche)"/>

      <!-- Header / Republic of India -->
      <text x="350" y="65" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="%231e293b" letter-spacing="2">PASSPORT / PASSEPORT</text>
      <text x="350" y="88" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="%23475569">REPUBLIC OF INDIA / RÉPUBLIQUE D'INDE</text>
      
      <!-- Emblem -->
      <circle cx="730" cy="70" r="28" fill="%23d97706" opacity="0.15"/>
      <text x="716" y="78" font-family="serif" font-size="24" fill="%23b45309">🇮🇳</text>

      <!-- Photo Box -->
      <rect x="45" y="110" width="165" height="215" rx="8" fill="%23e2e8f0" stroke="%2364748b" stroke-width="1.5"/>
      <!-- Portrait silhouette -->
      <circle cx="127" cy="180" r="45" fill="%233b82f6"/>
      <path d="M 65,300 C 65,240 190,240 190,300 Z" fill="%231e40af"/>
      <text x="75" y="320" font-family="monospace" font-size="10" fill="%2364748b">ICAO BIO COMPLIANT</text>

      <!-- VIZ Data Fields -->
      <g transform="translate(240, 125)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" fill="%2364748b" font-weight="600">Type / Code</text>
        <text x="0" y="18" font-size="15" fill="%230f172a" font-weight="bold">P / IND</text>

        <text x="140" y="0" font-size="11" fill="%2364748b" font-weight="600">Passport No.</text>
        <text x="140" y="18" font-size="16" fill="%230f172a" font-weight="bold" font-family="monospace">Z4829104</text>

        <text x="0" y="48" font-size="11" fill="%2364748b" font-weight="600">Given Name(s) / Prénoms</text>
        <text x="0" y="66" font-size="15" fill="%230f172a" font-weight="bold">ARJUN VIKRAM</text>

        <text x="0" y="96" font-size="11" fill="%2364748b" font-weight="600">Surname / Nom</text>
        <text x="0" y="114" font-size="15" fill="%230f172a" font-weight="bold">SHARMA</text>

        <text x="0" y="144" font-size="11" fill="%2364748b" font-weight="600">Nationality</text>
        <text x="0" y="162" font-size="14" fill="%230f172a" font-weight="bold">INDIAN</text>

        <text x="140" y="144" font-size="11" fill="%2364748b" font-weight="600">Date of Birth</text>
        <text x="140" y="162" font-size="14" fill="%230f172a" font-weight="bold">12/04/1988</text>

        <text x="280" y="144" font-size="11" fill="%2364748b" font-weight="600">Sex</text>
        <text x="280" y="162" font-size="14" fill="%230f172a" font-weight="bold">M</text>

        <text x="0" y="192" font-size="11" fill="%2364748b" font-weight="600">Date of Issue</text>
        <text x="0" y="210" font-size="14" fill="%230f172a" font-weight="bold">10/06/2021</text>

        <text x="140" y="192" font-size="11" fill="%2364748b" font-weight="600">Date of Expiry</text>
        <text x="140" y="210" font-size="14" fill="%230f172a" font-weight="bold">09/06/2031</text>

        <text x="280" y="192" font-size="11" fill="%2364748b" font-weight="600">Place of Issue</text>
        <text x="280" y="210" font-size="14" fill="%230f172a" font-weight="bold">NEW DELHI</text>
      </g>

      <!-- MRZ Zone Background -->
      <rect x="40" y="410" width="720" height="95" rx="6" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="1.5"/>
      <text x="55" y="445" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">P&lt;INDSHARMA&lt;&lt;ARJUN&lt;VIKRAM&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="55" y="482" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">Z4829104&lt;4IND8804128M3106096&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</text>
    </svg>`;
  }

  if (type === 'photo_replaced') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#090723"/>
        </linearGradient>
      </defs>
      
      <rect width="${width}" height="${height}" rx="16" fill="url(%23bgGrad2)" stroke="%23ef4444" stroke-width="3"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23fffbeb" stroke="%23fde68a" stroke-width="1"/>
      
      <text x="310" y="65" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="%2378350f" letter-spacing="2">TRAVEL IDENTITY PERMIT</text>
      <text x="310" y="88" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="%2392400e">IMMIGRATION &amp; BORDER TRANSIT</text>

      <!-- SPLICED PHOTO REGION (Visually obvious tampering border & mismatch) -->
      <g id="spliced_photo">
        <!-- Glue residue / halo border -->
        <rect x="42" y="107" width="171" height="221" rx="4" fill="none" stroke="%23ef4444" stroke-width="2.5" stroke-dasharray="6,4"/>
        <!-- Replaced photo with different lighting/grain -->
        <rect x="45" y="110" width="165" height="215" fill="%23e0e7ff"/>
        <circle cx="127" cy="180" r="46" fill="%23ea580c"/>
        <path d="M 65,300 C 65,235 190,235 190,300 Z" fill="%239a3412"/>
        <rect x="45" y="110" width="165" height="215" fill="none" stroke="%23f97316" stroke-width="2"/>
        <!-- Splicing tag -->
        <rect x="48" y="115" width="110" height="20" rx="4" fill="%23ef4444"/>
        <text x="54" y="129" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23ffffff">⚠ SPLICING EDGES</text>
      </g>

      <!-- VIZ Data Fields -->
      <g transform="translate(240, 125)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" fill="%2392400e" font-weight="600">Permit ID / Code</text>
        <text x="0" y="18" font-size="15" fill="%2378350f" font-weight="bold">BP-7890124</text>

        <text x="160" y="0" font-size="11" fill="%2392400e" font-weight="600">Bearer Name</text>
        <text x="160" y="18" font-size="16" fill="%2378350f" font-weight="bold">RAJESH KUMAR ROY</text>

        <text x="0" y="60" font-size="11" fill="%2392400e" font-weight="600">Nationality</text>
        <text x="0" y="78" font-size="14" fill="%2378350f" font-weight="bold">NEPALESE (NPL)</text>

        <text x="160" y="60" font-size="11" fill="%2392400e" font-weight="600">Date of Birth</text>
        <text x="160" y="78" font-size="14" fill="%2378350f" font-weight="bold">23/11/1991</text>

        <text x="0" y="120" font-size="11" fill="%2392400e" font-weight="600">Issue Post</text>
        <text x="0" y="138" font-size="14" fill="%2378350f" font-weight="bold">BIRGUNJ SECTOR-1</text>

        <text x="160" y="120" font-size="11" fill="%2392400e" font-weight="600">Validity Period</text>
        <text x="160" y="138" font-size="14" fill="%2378350f" font-weight="bold">15/01/2024 - 14/01/2026</text>
      </g>

      <!-- Tampered Stamp -->
      <g transform="translate(560, 240)">
        <circle cx="50" cy="50" r="45" fill="none" stroke="%23ef4444" stroke-width="2" opacity="0.6"/>
        <text x="25" y="45" font-size="9" fill="%23ef4444" font-weight="bold">BORDER POST</text>
        <text x="35" y="60" font-size="8" fill="%23ef4444">VERIFIED</text>
      </g>

      <!-- MRZ Section -->
      <rect x="40" y="410" width="720" height="95" rx="6" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="1.5"/>
      <text x="55" y="445" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%2378350f" letter-spacing="4">I&lt;NPLROY&lt;&lt;RAJESH&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="55" y="482" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%2378350f" letter-spacing="4">BP78901248NPL9111234M2601146&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;3</text>
    </svg>`;
  }

  if (type === 'tampered_dob') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="16" fill="%230f172a" stroke="%23f59e0b" stroke-width="2.5"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1"/>
      
      <text x="330" y="65" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="%231e293b">BRITISH PASSPORT</text>
      <text x="330" y="88" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="%23475569">UNITED KINGDOM OF GREAT BRITAIN</text>

      <rect x="45" y="110" width="165" height="215" rx="8" fill="%23f1f5f9" stroke="%2394a3b8" stroke-width="1"/>
      <circle cx="127" cy="180" r="45" fill="%2364748b"/>
      <path d="M 65,300 C 65,240 190,240 190,300 Z" fill="%23334155"/>

      <g transform="translate(240, 125)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" fill="%2364748b" font-weight="600">Passport No.</text>
        <text x="0" y="18" font-size="16" fill="%230f172a" font-weight="bold" font-family="monospace">559102841</text>

        <text x="160" y="0" font-size="11" fill="%2364748b" font-weight="600">Full Name</text>
        <text x="160" y="18" font-size="16" fill="%230f172a" font-weight="bold">DAVID JAMES STERLING</text>

        <!-- ALTERED DATE OF BIRTH FIELD (Font mismatch highlight) -->
        <g transform="translate(0, 50)">
          <rect x="-4" y="12" width="130" height="26" rx="4" fill="%23fef2f2" stroke="%23ef4444" stroke-width="1.5"/>
          <text x="0" y="0" font-size="11" fill="%23dc2626" font-weight="bold">Date of Birth (Altered)</text>
          <text x="4" y="28" font-size="16" fill="%23b91c1c" font-weight="900" font-family="'Times New Roman', serif">15/08/1994</text>
          <text x="135" y="26" font-size="10" fill="%23ef4444" font-weight="bold">⚡ FONT MISMATCH</text>
        </g>

        <text x="0" y="120" font-size="11" fill="%2364748b" font-weight="600">Nationality</text>
        <text x="0" y="138" font-size="14" fill="%230f172a" font-weight="bold">BRITISH CITIZEN (GBR)</text>

        <text x="160" y="120" font-size="11" fill="%2364748b" font-weight="600">Expiry Date</text>
        <text x="160" y="138" font-size="14" fill="%230f172a" font-weight="bold">28/10/2029</text>
      </g>

      <!-- MRZ Section - Has actual birth year 1982 ('820815'), causing direct mismatch with visual '1994' -->
      <rect x="40" y="410" width="720" height="95" rx="6" fill="%23fef2f2" stroke="%23ef4444" stroke-width="1.5"/>
      <text x="55" y="445" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%230f172a" letter-spacing="4">P&lt;GBRSTERLING&lt;&lt;DAVID&lt;JAMES&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <!-- MRZ says 820815 (1982), but VIZ printed 1994 -->
      <text x="55" y="482" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%23b91c1c" letter-spacing="4">5591028414GBR8208156M2910289&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;2</text>
    </svg>`;
  }

  if (type === 'forged_visa') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" rx="16" fill="%231e293b" stroke="%23f43f5e" stroke-width="2"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23fff1f2" stroke="%23fecdd3" stroke-width="1"/>

      <text x="320" y="65" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="%23881337">SCHENGEN VISA / TOURIST C</text>
      <text x="320" y="88" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="%239f1239">CONSULAR SERVICE IMMIGRATION STAMP</text>

      <rect x="45" y="110" width="165" height="215" rx="6" fill="%23ffffff" stroke="%23fb7185" stroke-width="1"/>
      <circle cx="127" cy="180" r="45" fill="%23e11d48"/>
      <path d="M 65,300 C 65,240 190,240 190,300 Z" fill="%239f1239"/>

      <g transform="translate(240, 125)" font-family="sans-serif">
        <text x="0" y="0" font-size="11" fill="%239f1239" font-weight="600">Visa Control No.</text>
        <text x="0" y="18" font-size="16" fill="%23881337" font-weight="bold" font-family="monospace">FRA-99201948</text>

        <text x="180" y="0" font-size="11" fill="%239f1239" font-weight="600">Bearer Name</text>
        <text x="180" y="18" font-size="15" fill="%23881337" font-weight="bold">TARIQ MAHMOUD AL-HASSAN</text>

        <text x="0" y="55" font-size="11" fill="%239f1239" font-weight="600">Valid From - Until</text>
        <text x="0" y="73" font-size="14" fill="%23881337" font-weight="bold">01/05/2024 - 30/10/2024</text>

        <text x="180" y="55" font-size="11" fill="%239f1239" font-weight="600">Duration of Stay</text>
        <text x="180" y="73" font-size="14" fill="%23881337" font-weight="bold">90 DAYS (MULTIPLE ENTRY)</text>
      </g>

      <!-- CLONED / FORGED INK STAMP -->
      <g transform="translate(560, 190)">
        <circle cx="60" cy="60" r="55" fill="none" stroke="%23e11d48" stroke-width="3" stroke-dasharray="8,4"/>
        <circle cx="60" cy="60" r="42" fill="none" stroke="%23e11d48" stroke-width="1.5"/>
        <text x="28" y="55" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23e11d48">EMBASSY OF FRANCE</text>
        <text x="35" y="72" font-family="sans-serif" font-size="9" fill="%23e11d48">VISA GRANTED</text>
        <rect x="-10" y="120" width="140" height="20" rx="4" fill="%23e11d48"/>
        <text x="-4" y="134" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23ffffff">⚠ CLONED DIGITAL SEAL</text>
      </g>

      <!-- MRZ Zone -->
      <rect x="40" y="410" width="720" height="95" rx="6" fill="%23fff1f2" stroke="%23f43f5e" stroke-width="1.5"/>
      <text x="55" y="445" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%23881337" letter-spacing="4">V&lt;FRAAL&lt;HASSAN&lt;&lt;TARIQ&lt;MAHMOUD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="55" y="482" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%23881337" letter-spacing="4">FRA992019487SYR8503102M2410308&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;9</text>
    </svg>`;
  }

  // interpol_fugitive
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" rx="16" fill="%23450a0a" stroke="%23dc2626" stroke-width="3"/>
    <rect x="15" y="15" width="${width - 30}" height="${height - 30}" rx="12" fill="%23fef2f2" stroke="%23fca5a5" stroke-width="1"/>

    <!-- High alert banner -->
    <rect x="15" y="15" width="${width - 30}" height="42" fill="%23dc2626"/>
    <text x="210" y="42" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%23ffffff" letter-spacing="2">🚨 INTERPOL RED NOTICE IDENTIFIED</text>

    <text x="310" y="95" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="%237f1d1d">PASSPORT / REPUBLIK ÖSTERREICH</text>

    <rect x="45" y="120" width="165" height="205" rx="6" fill="%23ffffff" stroke="%23dc2626" stroke-width="2"/>
    <circle cx="127" cy="185" r="45" fill="%237f1d1d"/>
    <path d="M 65,300 C 65,240 190,240 190,300 Z" fill="%23450a0a"/>

    <g transform="translate(240, 130)" font-family="sans-serif">
      <text x="0" y="0" font-size="11" fill="%23991b1b" font-weight="600">Passport Number</text>
      <text x="0" y="18" font-size="16" fill="%237f1d1d" font-weight="bold" font-family="monospace">A77192083</text>

      <text x="180" y="0" font-size="11" fill="%23991b1b" font-weight="600">Printed Name</text>
      <text x="180" y="18" font-size="16" fill="%237f1d1d" font-weight="bold">MAXIMILIAN KLAUS WEBER</text>

      <text x="0" y="55" font-size="11" fill="%23991b1b" font-weight="600">Known Alias in Database</text>
      <text x="0" y="73" font-size="14" fill="%23dc2626" font-weight="bold">VLADIMIR IVANOV (WANTED)</text>

      <text x="0" y="110" font-size="11" fill="%23991b1b" font-weight="600">Interpol Notice Ref</text>
      <text x="0" y="128" font-size="14" fill="%23dc2626" font-weight="bold">RN-2025/88921-EU</text>

      <text x="180" y="110" font-size="11" fill="%23991b1b" font-weight="600">Offense Summary</text>
      <text x="180" y="128" font-size="14" fill="%237f1d1d" font-weight="bold">Transnational Syndicate Fraud &amp; Identity Theft</text>
    </g>

    <rect x="40" y="410" width="720" height="95" rx="6" fill="%23fee2e2" stroke="%23ef4444" stroke-width="1.5"/>
    <text x="55" y="445" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%237f1d1d" letter-spacing="4">P&lt;AUTWEBER&lt;&lt;MAXIMILIAN&lt;KLAUS&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    <text x="55" y="482" font-family="'Courier New', Courier, monospace" font-size="20" font-weight="bold" fill="%237f1d1d" letter-spacing="4">A771920836AUT8105193M3005124&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;6</text>
  </svg>`;
}

export const SAMPLE_SCREENING_CASES: ScreeningSession[] = [
  // 1. Genuine Indian Passport
  {
    id: 'SSB-SCAN-2026-001',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'ARJUN VIKRAM SHARMA',
    travelerNationality: 'IND',
    travelerDob: '1988-04-12',
    travelerPassportNumber: 'Z4829104',
    documentType: 'passport',
    documentImageUrl: createSampleDocumentSvg('genuine_passport'),
    fields: [
      { key: 'passportNumber', label: 'Passport Number', value: 'Z4829104', confidence: 99.8 },
      { key: 'fullName', label: 'Full Name', value: 'ARJUN VIKRAM SHARMA', confidence: 99.4 },
      { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99.9 },
      { key: 'dob', label: 'Date of Birth', value: '1988-04-12', confidence: 98.9 },
      { key: 'sex', label: 'Sex', value: 'M', confidence: 100 },
      { key: 'expiryDate', label: 'Date of Expiry', value: '2031-06-09', confidence: 99.2 },
      { key: 'issuePlace', label: 'Place of Issue', value: 'NEW DELHI', confidence: 98.7 },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'P<INDSHARMA<<ARJUN<VIKRAM<<<<<<<<<<<<<<<<<<<<',
        'Z4829104<4IND8804128M3106096<<<<<<<<<<<<<<8',
      ],
      documentType: 'P',
      countryCode: 'IND',
      documentNumber: 'Z4829104',
      documentNumberCheckDigit: '4',
      nationality: 'IND',
      birthDate: '880412',
      birthDateFormatted: '1988-04-12',
      birthDateCheckDigit: '8',
      sex: 'M',
      expirationDate: '310609',
      expirationDateFormatted: '2031-06-09',
      expirationDateCheckDigit: '6',
      compositeCheckDigit: '8',
      computedCompositeCheckDigit: '8',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Document Number', extractedValue: 'Z4829104', checkDigit: '4', computedCheckDigit: '4', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth', extractedValue: '880412', checkDigit: '8', computedCheckDigit: '8', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Expiry', extractedValue: '310609', checkDigit: '6', computedCheckDigit: '6', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Composite Checksum', extractedValue: 'Full MRZ Line 2', checkDigit: '8', computedCheckDigit: '8', isValid: true, algorithm: 'ICAO 9303 Composite' },
      ],
      vizMismatchDetected: false,
      vizMismatchDetails: [],
    },
    tampering: {
      overallTamperScore: 2,
      isTampered: false,
      photoReplacement: {
        detected: false,
        confidence: 99.2,
        splicingEdgeDetected: false,
        lightingInconsistency: false,
        elaAnomalyScore: 3,
        noiseResidualDisparity: 2,
        details: 'Photo edge gradients and compression quantization align seamlessly with passport substrate.',
      },
      textManipulation: {
        detected: false,
        confidence: 99.5,
        fontInconsistency: false,
        baselineMisalignment: false,
        alteredFields: [],
        digitalCopyPasteArtifacts: false,
        details: 'Standard ICAO OCR-B typography and consistent baseline alignment throughout.',
      },
      stampForgery: {
        detected: false,
        confidence: 99.0,
        structuralSimilarityScore: 98,
        circularEdgeIntegrity: 99,
        inkBleedAnomaly: false,
        clonedSealDetected: false,
        details: 'Genuine security guilloche pattern and official Ministry seal intact.',
      },
      metadataAnalysis: {
        detected: false,
        editingSoftwareFound: false,
        softwareTraces: [],
        exifMissingOrStripped: false,
        creationDateAnomaly: false,
        compressionQuantizationAnomaly: false,
        details: 'Raw camera and scanner ICC color profiles verified without editing markers.',
      },
      tamperBoxes: [],
    },
    biometrics: {
      isBiometricVerified: true,
      similarityScore: 96.8,
      matchStatus: 'MATCH_VERIFIED',
      antiSpoofing: {
        isLive: true,
        confidence: 99.1,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Live passenger presence verified. Active 3D facial mesh and natural eye-blink confirmed.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 98.4,
      details: 'High-confidence biometric match (96.8%). Facial geometry fully consistent with passport photo.',
    },
    watchlist: {
      isHit: false,
      matchType: 'NONE',
      threatLevel: 'NONE',
      watchlistDatabase: 'INTERPOL SLTD + SSB National Database',
      details: 'No records found. Clear across all national and international watchlists.',
      actionRequired: 'Proceed with standard border clearance.',
    },
    risk: {
      overallRiskScore: 4,
      riskTier: 'CLEAR',
      confidenceLevel: 99.2,
      breakdown: {
        ocrExtractionScore: 99,
        mrzValidationScore: 100,
        tamperRiskScore: 2,
        biometricMatchScore: 97,
        watchlistThreatScore: 0,
      },
      keyRiskFactors: [],
      positiveFactors: [
        'Valid ICAO Doc 9303 checksums (Document, DOB, Expiry, Composite)',
        'Error Level Analysis (ELA) confirms genuine original photograph',
        '96.8% facial biometric match against live traveler webcam',
        'Clean Interpol SLTD and SSB Watchlist status',
      ],
      recommendedAction: 'Grant e-Gate Border Clearance. Document authentic and traveler verified.',
      decisionTimestamp: new Date().toISOString(),
    },
    status: 'CLEARED',
  },

  // 2. Photo Replaced / Spliced Permit
  {
    id: 'SSB-SCAN-2026-002',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'RAJESH KUMAR ROY',
    travelerNationality: 'NPL',
    travelerDob: '1991-11-23',
    travelerPassportNumber: 'BP7890124',
    documentType: 'border_permit',
    documentImageUrl: createSampleDocumentSvg('photo_replaced'),
    fields: [
      { key: 'documentNumber', label: 'Permit ID', value: 'BP7890124', confidence: 97.4 },
      { key: 'fullName', label: 'Bearer Name', value: 'RAJESH KUMAR ROY', confidence: 96.8 },
      { key: 'nationality', label: 'Nationality', value: 'NPL', confidence: 99.0 },
      { key: 'dob', label: 'Date of Birth', value: '1991-11-23', confidence: 95.5 },
      { key: 'photo', label: 'Portrait Photo', value: 'SPLICED_DETECTED', confidence: 24.0, isTampered: true, anomalyReason: 'Rectangular edge discontinuity & distinct JPEG ELA compression variance' },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'I<NPLROY<<RAJESH<KUMAR<<<<<<<<<<<<<<<<<<<',
        'BP78901248NPL9111234M2601146<<<<<<<<<<<<<3',
      ],
      documentType: 'I',
      countryCode: 'NPL',
      documentNumber: 'BP7890124',
      documentNumberCheckDigit: '8',
      nationality: 'NPL',
      birthDate: '911123',
      birthDateFormatted: '1991-11-23',
      birthDateCheckDigit: '4',
      sex: 'M',
      expirationDate: '260114',
      expirationDateFormatted: '2026-01-14',
      expirationDateCheckDigit: '6',
      compositeCheckDigit: '3',
      computedCompositeCheckDigit: '3',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Document Number', extractedValue: 'BP7890124', checkDigit: '8', computedCheckDigit: '8', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth', extractedValue: '911123', checkDigit: '4', computedCheckDigit: '4', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Expiry', extractedValue: '260114', checkDigit: '6', computedCheckDigit: '6', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
      ],
      vizMismatchDetected: false,
      vizMismatchDetails: [],
    },
    tampering: {
      overallTamperScore: 89,
      isTampered: true,
      photoReplacement: {
        detected: true,
        confidence: 98.6,
        splicingEdgeDetected: true,
        lightingInconsistency: true,
        elaAnomalyScore: 92,
        noiseResidualDisparity: 86,
        details: 'CRITICAL: Severe Error Level Analysis (ELA) anomaly in portrait zone (x: 5.6%, y: 20.3%). Boundary cut-and-paste halo detected.',
      },
      textManipulation: {
        detected: false,
        confidence: 92.0,
        fontInconsistency: false,
        baselineMisalignment: false,
        alteredFields: [],
        digitalCopyPasteArtifacts: false,
        details: 'Substrate text fields appear unchanged on original card base.',
      },
      stampForgery: {
        detected: true,
        confidence: 84.2,
        structuralSimilarityScore: 45,
        circularEdgeIntegrity: 62,
        inkBleedAnomaly: true,
        clonedSealDetected: true,
        details: 'Border post stamp overlaps spliced photograph without natural ink absorption into underlying paper fibers.',
      },
      metadataAnalysis: {
        detected: true,
        editingSoftwareFound: true,
        softwareTraces: ['Adobe Photoshop 2024 (Windows)', 'Canva Editor'],
        exifMissingOrStripped: true,
        creationDateAnomaly: true,
        compressionQuantizationAnomaly: true,
        details: 'Digital artifact traces: Quantization matrix shows double JPEG compression consistent with image replacement.',
      },
      tamperBoxes: [
        {
          id: 'tb-1',
          x: 5.6,
          y: 20.3,
          width: 20.6,
          height: 39.8,
          label: 'Photo Splicing Detected',
          type: 'photo',
          severity: 'high',
          confidence: 98.6,
          description: 'Error Level Analysis (ELA) shows intense compression discrepancy. Sharp rectangular boundary halo indicates physical photo overlay.',
          technicalDetails: 'ELA pixel variance: +74.2dB vs background baseline (+8.1dB). Splicing border gradient: 0.89.',
        },
        {
          id: 'tb-2',
          x: 70.0,
          y: 44.4,
          width: 14.5,
          height: 18.2,
          label: 'Tampered Overprint Stamp',
          type: 'stamp',
          severity: 'high',
          confidence: 84.2,
          description: 'Synthetic rubber stamp generated digitally over spliced photo seam to simulate official border clearance.',
        },
      ],
    },
    biometrics: {
      isBiometricVerified: false,
      similarityScore: 28.4,
      matchStatus: 'SUSPECT_IMPERSONATION',
      antiSpoofing: {
        isLive: true,
        confidence: 96.0,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Live traveler is physically present, but facial nodal geometry does NOT match the document portrait.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 28.4,
      details: 'CRITICAL BIOMETRIC DIVERGENCE (28.4%): Significant jawline, nasal bridge, and ocular distance mismatch. Suspected imposter using altered permit.',
    },
    watchlist: {
      isHit: false,
      matchType: 'NONE',
      threatLevel: 'NONE',
      watchlistDatabase: 'SSB Border Post Database',
      details: 'Permit base serial belongs to a genuine registered citizen, but photo has been replaced to allow imposter entry.',
      actionRequired: 'Detain bearer and verify original registered permit owner.',
    },
    risk: {
      overallRiskScore: 92,
      riskTier: 'DETAIN_ALERT',
      confidenceLevel: 98.8,
      breakdown: {
        ocrExtractionScore: 85,
        mrzValidationScore: 90,
        tamperRiskScore: 89,
        biometricMatchScore: 28,
        watchlistThreatScore: 40,
      },
      keyRiskFactors: [
        'Photo Replacement: Spliced portrait with 92% ELA compression variance anomaly',
        'Biometric Impersonation: Live traveler facial similarity is only 28.4% against document photo',
        'Forged Seal Overprint: Cloned digital stamp overlaying spliced border',
        'Metadata Traces: Adobe Photoshop editing signatures detected in file stream',
      ],
      positiveFactors: [],
      recommendedAction: 'DETAIN IMMEDIATELY: Impersonation and physical document forgery confirmed. Transfer subject to SSB Intelligence & Police II interrogation.',
      decisionTimestamp: new Date().toISOString(),
    },
    status: 'DETAINED',
  },

  // 3. Modified Date of Birth (MRZ Mismatch)
  {
    id: 'SSB-SCAN-2026-003',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'DAVID JAMES STERLING',
    travelerNationality: 'GBR',
    travelerDob: '1994-08-15',
    travelerPassportNumber: '559102841',
    documentType: 'passport',
    documentImageUrl: createSampleDocumentSvg('tampered_dob'),
    fields: [
      { key: 'passportNumber', label: 'Passport Number', value: '559102841', confidence: 99.1 },
      { key: 'fullName', label: 'Full Name', value: 'DAVID JAMES STERLING', confidence: 98.7 },
      { key: 'nationality', label: 'Nationality', value: 'GBR', confidence: 99.4 },
      { key: 'dob', label: 'Date of Birth (VIZ)', value: '15/08/1994', confidence: 62.0, isTampered: true, anomalyReason: 'Visual DOB altered from 1982 to 1994. Font baseline and serif style differ from official UK passport template.' },
      { key: 'expiryDate', label: 'Date of Expiry', value: '28/10/2029', confidence: 98.4 },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'P<GBRSTERLING<<DAVID<JAMES<<<<<<<<<<<<<<<<',
        '5591028414GBR8208156M2910289<<<<<<<<<<<<<<2',
      ],
      documentType: 'P',
      countryCode: 'GBR',
      documentNumber: '559102841',
      documentNumberCheckDigit: '4',
      nationality: 'GBR',
      birthDate: '820815',
      birthDateFormatted: '1982-08-15',
      birthDateCheckDigit: '6',
      sex: 'M',
      expirationDate: '291028',
      expirationDateFormatted: '2029-10-28',
      expirationDateCheckDigit: '9',
      compositeCheckDigit: '2',
      computedCompositeCheckDigit: '2',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Document Number', extractedValue: '559102841', checkDigit: '4', computedCheckDigit: '4', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth (MRZ Decoded)', extractedValue: '820815 (1982-08-15)', checkDigit: '6', computedCheckDigit: '6', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Expiry', extractedValue: '291028', checkDigit: '9', computedCheckDigit: '9', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
      ],
      vizMismatchDetected: true,
      vizMismatchDetails: [
        'Date of Birth Discrepancy: Visual Zone shows "15/08/1994" (Age 32), while Machine Readable Zone decodes to "1982-08-15" (Age 44).',
      ],
    },
    tampering: {
      overallTamperScore: 76,
      isTampered: true,
      photoReplacement: {
        detected: false,
        confidence: 96.0,
        splicingEdgeDetected: false,
        lightingInconsistency: false,
        elaAnomalyScore: 12,
        noiseResidualDisparity: 8,
        details: 'Photo appears authentic to the passport page.',
      },
      textManipulation: {
        detected: true,
        confidence: 97.4,
        fontInconsistency: true,
        baselineMisalignment: true,
        alteredFields: ['Date of Birth'],
        digitalCopyPasteArtifacts: true,
        details: 'Digit "9" and "4" in year 1994 exhibit distinct serif curvature and 1.8px baseline vertical shift compared to neighboring characters.',
      },
      stampForgery: {
        detected: false,
        confidence: 94.0,
        structuralSimilarityScore: 92,
        circularEdgeIntegrity: 95,
        inkBleedAnomaly: false,
        clonedSealDetected: false,
        details: 'No seal tampering detected.',
      },
      metadataAnalysis: {
        detected: false,
        editingSoftwareFound: false,
        softwareTraces: [],
        exifMissingOrStripped: false,
        creationDateAnomaly: false,
        compressionQuantizationAnomaly: false,
        details: 'Physical document scraping / mechanical alteration of printed number.',
      },
      tamperBoxes: [
        {
          id: 'tb-3',
          x: 29.5,
          y: 28.2,
          width: 24.5,
          height: 9.8,
          label: 'Font Alteration (DOB)',
          type: 'text',
          severity: 'high',
          confidence: 97.4,
          description: 'Digit 1994 manually scraped and reprinted. Optical character baseline misalignment and ink density inconsistency detected.',
          technicalDetails: 'Baseline offset: +1.8px; Ink optical density variance: 42%; Mismatch with MRZ birth year (1982).',
        }
      ],
    },
    biometrics: {
      isBiometricVerified: true,
      similarityScore: 89.2,
      matchStatus: 'MATCH_VERIFIED',
      antiSpoofing: {
        isLive: true,
        confidence: 98.0,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Subject is verified live.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 89.2,
      details: 'Facial biometrics match the document portrait, confirming traveler is the passport holder attempting age modification.',
    },
    watchlist: {
      isHit: true,
      matchType: 'VISA_VIOLATION',
      threatLevel: 'MEDIUM',
      watchlistDatabase: 'Immigration & Overstay Records',
      details: 'Subject previously flagged under DOB 1982 for overstaying student visa in 2018. Altered DOB to bypass entry ban.',
      actionRequired: 'Secondary interrogation regarding fraudulent age modification.',
    },
    risk: {
      overallRiskScore: 78,
      riskTier: 'DETAIN_ALERT',
      confidenceLevel: 97.5,
      breakdown: {
        ocrExtractionScore: 65,
        mrzValidationScore: 40,
        tamperRiskScore: 76,
        biometricMatchScore: 89,
        watchlistThreatScore: 65,
      },
      keyRiskFactors: [
        'Visual-to-MRZ Mismatch: Visual DOB "15/08/1994" conflicts directly with MRZ encoded date "1982-08-15"',
        'Text Manipulation: Font baseline misalignment and modified ink density on DOB field',
        'Watchlist Match: Prior visa violation recorded under original birth year 1982',
      ],
      positiveFactors: [
        '1:1 Facial biometric match confirms subject is original passport holder',
      ],
      recommendedAction: 'DETAIN / DENY ENTRY: Document altered to circumvent previous immigration overstay ban. Confiscate passport under MHA Immigration Act Section 14.',
      decisionTimestamp: new Date().toISOString(),
    },
    status: 'DETAINED',
  },

  // 4. Forged Visa with Cloned Seal
  {
    id: 'SSB-SCAN-2026-004',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'TARIQ MAHMOUD AL-HASSAN',
    travelerNationality: 'SYR',
    travelerDob: '1985-03-10',
    travelerPassportNumber: 'FRA99201948',
    documentType: 'visa',
    documentImageUrl: createSampleDocumentSvg('forged_visa'),
    fields: [
      { key: 'visaNumber', label: 'Visa Control Number', value: 'FRA-99201948', confidence: 96.0 },
      { key: 'fullName', label: 'Bearer Name', value: 'TARIQ MAHMOUD AL-HASSAN', confidence: 97.2 },
      { key: 'validity', label: 'Validity Period', value: '01/05/2024 - 30/10/2024', confidence: 95.0 },
      { key: 'duration', label: 'Stay Duration', value: '90 DAYS (MULTIPLE)', confidence: 94.0 },
      { key: 'stamp', label: 'Consular Seal', value: 'CLONED_STAMP', confidence: 18.0, isTampered: true, anomalyReason: 'Cloned digital rubber stamp. No physical ink bleeding into paper substrate; structural pixel repetition matches known online template.' },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'V<FRAAL<HASSAN<<TARIQ<MAHMOUD<<<<<<<<<<<<<',
        'FRA992019487SYR8503102M2410308<<<<<<<<<<<<<<9',
      ],
      documentType: 'V',
      countryCode: 'FRA',
      documentNumber: 'FRA99201948',
      documentNumberCheckDigit: '7',
      nationality: 'SYR',
      birthDate: '850310',
      birthDateFormatted: '1985-03-10',
      birthDateCheckDigit: '2',
      sex: 'M',
      expirationDate: '241030',
      expirationDateFormatted: '2024-10-30',
      expirationDateCheckDigit: '8',
      compositeCheckDigit: '9',
      computedCompositeCheckDigit: '9',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Visa Number', extractedValue: 'FRA99201948', checkDigit: '7', computedCheckDigit: '7', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth', extractedValue: '850310', checkDigit: '2', computedCheckDigit: '2', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Expiry', extractedValue: '241030', checkDigit: '8', computedCheckDigit: '8', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
      ],
      vizMismatchDetected: false,
      vizMismatchDetails: [],
    },
    tampering: {
      overallTamperScore: 72,
      isTampered: true,
      photoReplacement: {
        detected: false,
        confidence: 94.0,
        splicingEdgeDetected: false,
        lightingInconsistency: false,
        elaAnomalyScore: 18,
        noiseResidualDisparity: 14,
        details: 'Photo integration is uniform.',
      },
      textManipulation: {
        detected: false,
        confidence: 91.0,
        fontInconsistency: false,
        baselineMisalignment: false,
        alteredFields: [],
        digitalCopyPasteArtifacts: false,
        details: 'Printed text conforms to template structure.',
      },
      stampForgery: {
        detected: true,
        confidence: 96.8,
        structuralSimilarityScore: 22,
        circularEdgeIntegrity: 41,
        inkBleedAnomaly: true,
        clonedSealDetected: true,
        details: 'CRITICAL: Seal is a digital vector overlay without microscopic capillary ink absorption. Edge perimeter shows digital anti-aliasing artifacts instead of genuine rubber stamp pressure variance.',
      },
      metadataAnalysis: {
        detected: true,
        editingSoftwareFound: true,
        softwareTraces: ['CorelDraw Graphics Suite', 'GIMP 2.10.34'],
        exifMissingOrStripped: true,
        creationDateAnomaly: true,
        compressionQuantizationAnomaly: true,
        details: 'GIMP and CorelDraw markers found in embedded image XMP metadata packet.',
      },
      tamperBoxes: [
        {
          id: 'tb-4',
          x: 70.0,
          y: 35.2,
          width: 20.0,
          height: 29.6,
          label: 'Forged Consular Seal',
          type: 'stamp',
          severity: 'high',
          confidence: 96.8,
          description: 'Synthetic rubber stamp created via graphic software. Absence of genuine micro-engraved security guilloche fibers.',
          technicalDetails: 'Ink pressure distribution score: 0.19 (Normal: >0.85); Fourier frequency analysis detects rasterization grid.',
        }
      ],
    },
    biometrics: {
      isBiometricVerified: true,
      similarityScore: 91.4,
      matchStatus: 'MATCH_VERIFIED',
      antiSpoofing: {
        isLive: true,
        confidence: 97.4,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Live passenger is present.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 91.4,
      details: 'Biometric face match verified against presented individual.',
    },
    watchlist: {
      isHit: false,
      matchType: 'NONE',
      threatLevel: 'NONE',
      watchlistDatabase: 'Schengen VIS & Interpol SLTD',
      details: 'Visa number not found in official French Consular Central Database (Counterfeit document sticker).',
      actionRequired: 'Flag for secondary inspection and consular verification.',
    },
    risk: {
      overallRiskScore: 72,
      riskTier: 'DETAIN_ALERT',
      confidenceLevel: 96.4,
      breakdown: {
        ocrExtractionScore: 92,
        mrzValidationScore: 88,
        tamperRiskScore: 72,
        biometricMatchScore: 91,
        watchlistThreatScore: 50,
      },
      keyRiskFactors: [
        'Counterfeit Consular Seal: Digital rubber stamp cloned without authentic security ink bleed',
        'Consular Database Missing Record: Visa control number unregistered in official central database',
        'Graphic Software Signatures: Embedded metadata contains CorelDraw and GIMP traces',
      ],
      positiveFactors: [
        'Facial biometric similarity verified against live individual',
      ],
      recommendedAction: 'DETAIN & SEIZE: Counterfeit travel visa detected. Contact French Consulate liaison officer and detain traveler.',
      decisionTimestamp: new Date().toISOString(),
    },
    status: 'DETAINED',
  },

  // 5. Interpol Red Notice Hit (High Threat Transnational Fugitive)
  {
    id: 'SSB-SCAN-2026-005',
    checkpointId: 'ICP-RAXAUL-04',
    checkpointName: 'Raxaul Integrated Check Post (SSB Police II)',
    officerBadge: 'SSB-7092',
    officerName: 'Insp. Vikram Rathore',
    timestamp: new Date().toISOString(),
    travelerName: 'MAXIMILIAN KLAUS WEBER',
    travelerNationality: 'AUT',
    travelerDob: '1981-05-19',
    travelerPassportNumber: 'A77192083',
    documentType: 'passport',
    documentImageUrl: createSampleDocumentSvg('interpol_fugitive'),
    fields: [
      { key: 'passportNumber', label: 'Passport Number', value: 'A77192083', confidence: 99.4 },
      { key: 'fullName', label: 'Passport Name', value: 'MAXIMILIAN KLAUS WEBER', confidence: 99.1 },
      { key: 'nationality', label: 'Nationality', value: 'AUT', confidence: 99.8 },
      { key: 'dob', label: 'Date of Birth', value: '1981-05-19', confidence: 98.9 },
      { key: 'interpolHit', label: 'Watchlist Status', value: 'INTERPOL RED NOTICE (CRITICAL)', confidence: 100, isTampered: true, anomalyReason: 'Matches active international fugitive notice RN-2025/88921-EU. Wanted for Transnational Financial Syndicate Fraud & Identity Laundering.' },
    ],
    mrzData: {
      format: 'TD3',
      rawLines: [
        'P<AUTWEBER<<MAXIMILIAN<KLAUS<<<<<<<<<<<<<<',
        'A771920836AUT8105193M3005124<<<<<<<<<<<<<<6',
      ],
      documentType: 'P',
      countryCode: 'AUT',
      documentNumber: 'A77192083',
      documentNumberCheckDigit: '6',
      nationality: 'AUT',
      birthDate: '810519',
      birthDateFormatted: '1981-05-19',
      birthDateCheckDigit: '3',
      sex: 'M',
      expirationDate: '300512',
      expirationDateFormatted: '2030-05-12',
      expirationDateCheckDigit: '4',
      compositeCheckDigit: '6',
      computedCompositeCheckDigit: '6',
      isAllChecksumsValid: true,
      checksumList: [
        { field: 'Document Number', extractedValue: 'A77192083', checkDigit: '6', computedCheckDigit: '6', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Birth', extractedValue: '810519', checkDigit: '3', computedCheckDigit: '3', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
        { field: 'Date of Expiry', extractedValue: '300512', checkDigit: '4', computedCheckDigit: '4', isValid: true, algorithm: 'ICAO 9303 7-3-1 Weight' },
      ],
      vizMismatchDetected: false,
      vizMismatchDetails: [],
    },
    tampering: {
      overallTamperScore: 24,
      isTampered: false,
      photoReplacement: {
        detected: false,
        confidence: 96.0,
        splicingEdgeDetected: false,
        lightingInconsistency: false,
        elaAnomalyScore: 14,
        noiseResidualDisparity: 10,
        details: 'Document substrate and photo appear legitimately issued (Fraudulent identity obtained via stolen blank passport).',
      },
      textManipulation: {
        detected: false,
        confidence: 98.0,
        fontInconsistency: false,
        baselineMisalignment: false,
        alteredFields: [],
        digitalCopyPasteArtifacts: false,
        details: 'Text printing conforms to Austrian Bundesdruckerei standards.',
      },
      stampForgery: {
        detected: false,
        confidence: 97.0,
        structuralSimilarityScore: 98,
        circularEdgeIntegrity: 98,
        inkBleedAnomaly: false,
        clonedSealDetected: false,
        details: 'Intaglio security embossing intact.',
      },
      metadataAnalysis: {
        detected: false,
        editingSoftwareFound: false,
        softwareTraces: [],
        exifMissingOrStripped: false,
        creationDateAnomaly: false,
        compressionQuantizationAnomaly: false,
        details: 'No digital editing markers.',
      },
      tamperBoxes: [],
    },
    biometrics: {
      isBiometricVerified: true,
      similarityScore: 95.2,
      matchStatus: 'MATCH_VERIFIED',
      antiSpoofing: {
        isLive: true,
        confidence: 99.4,
        screenReplayAttack: false,
        printAttackDetected: false,
        depthAnomaly: false,
        livenessPassed: true,
        details: 'Live passenger biometrics confirmed.',
      },
      facialLandmarksCount: 68,
      matchConfidence: 95.2,
      details: 'Facial biometrics match Austrian passport and cross-match INTERPOL Red Notice Biometric Database (99.1% match against alias Vladimir Ivanov).',
    },
    watchlist: {
      isHit: true,
      matchType: 'INTERPOL_RED_NOTICE',
      threatLevel: 'CRITICAL',
      matchedAlias: 'Vladimir Ivanov / Maxim Weber',
      interpolNoticeId: 'RN-2025/88921-EU',
      offenseCategory: 'Transnational Syndicate Fraud & Identity Laundering',
      watchlistDatabase: 'INTERPOL Lyon Central Command Red Notice Database',
      details: 'HIGH-PRIORITY RED NOTICE: Subject wanted by Austrian Federal Criminal Police and Europol. Category: Armed & Evasive International Fugitive.',
      actionRequired: 'TRIGGER LEVEL-1 ARREST PROTOCOL: Immediately lockdown e-Gate, alert armed SSB Quick Reaction Team (QRT), and detain subject without alerting traveler.',
    },
    risk: {
      overallRiskScore: 99,
      riskTier: 'DETAIN_ALERT',
      confidenceLevel: 99.8,
      breakdown: {
        ocrExtractionScore: 99,
        mrzValidationScore: 100,
        tamperRiskScore: 24,
        biometricMatchScore: 95,
        watchlistThreatScore: 100,
      },
      keyRiskFactors: [
        'CRITICAL INTERPOL RED NOTICE: Active international arrest warrant (Ref: RN-2025/88921-EU)',
        'Biometric Cross-Database Match: Facial embeddings match wanted fugitive alias Vladimir Ivanov',
        'Stolen Blank Passport Syndicate: Document is physically authentic but registered to stolen blank batch',
      ],
      positiveFactors: [],
      recommendedAction: 'TACTICAL INTERVENTION REQUIRED: Lock automated exit gates. Deploy armed checkpoint security to detain subject immediately for NCB-Interpol India liaison.',
      decisionTimestamp: new Date().toISOString(),
    },
    status: 'DETAINED',
  },
];

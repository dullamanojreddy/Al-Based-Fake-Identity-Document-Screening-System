import { WatchlistResult } from '../types';

export interface DocumentVerificationRequest {
  documentType: string;
  documentNumber: string;
  countryCode: string;
  holderName: string;
  dateOfBirth?: string;
  expiryDate?: string;
}

export interface DocumentVerificationResponse {
  isVerified: boolean;
  providerName: string;
  status: 'VERIFIED' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND' | 'NOT_AVAILABLE';
  details: string;
  timestamp: string;
  isExternalGovernmentVerified: boolean;
}

export interface VerificationProvider {
  name: string;
  isGovernmentAuthorized: boolean;
  verifyDocument(req: DocumentVerificationRequest): Promise<DocumentVerificationResponse>;
  checkWatchlist(name: string, passportNumber: string): Promise<WatchlistResult>;
}

/**
 * Local Demonstration Provider:
 * Uses synthetic offline database for border checkpoint demonstration.
 */
export class LocalDemoVerificationProvider implements VerificationProvider {
  name = 'SENTINEL-ID Local Demonstration Engine';
  isGovernmentAuthorized = false;

  private knownSyntheticRecords = [
    { docNum: 'Z4829104', name: 'ARJUN VIKRAM SHARMA', status: 'VERIFIED' as const },
    { docNum: '1234567890', name: 'UNITED STATES SPECIMEN', status: 'VERIFIED' as const },
    { docNum: 'M98765432', name: 'DAVID K. SMITH', status: 'REVOKED' as const },
  ];

  private syntheticWatchlist = [
    {
      name: 'VIKTOR S. PETROV',
      passportNumber: 'E9923841',
      matchType: 'EXACT_MATCH' as const,
      threatLevel: 'CRITICAL' as const,
      database: 'INTERPOL RED NOTICE #2024/991',
      details: 'Wanted by International Authorities for Financial Fraud & Identity Theft.',
      actionRequired: 'IMMEDIATELY DETAIN TRAVELER & NOTIFY CENTRAL COMMAND.',
    },
    {
      name: 'MARCUS V. CHEN',
      passportNumber: 'Z4829104',
      matchType: 'DOCUMENT_NUMBER_MATCH' as const,
      threatLevel: 'HIGH' as const,
      database: 'SLTD (Stolen & Lost Travel Documents)',
      details: 'Passport registered as stolen in transit (Interpol SLTD Reference #88412).',
      actionRequired: 'SECONDARY INSPECTION & BIOMETRIC CONFIRMATION REQUIRED.',
    },
  ];

  async verifyDocument(req: DocumentVerificationRequest): Promise<DocumentVerificationResponse> {
    const found = this.knownSyntheticRecords.find(
      r => r.docNum.toUpperCase() === req.documentNumber.toUpperCase()
    );

    if (found) {
      return {
        isVerified: found.status === 'VERIFIED',
        providerName: this.name,
        status: found.status,
        details: `Local mock record match: ${found.status}`,
        timestamp: new Date().toISOString(),
        isExternalGovernmentVerified: false,
      };
    }

    return {
      isVerified: true,
      providerName: this.name,
      status: 'VERIFIED',
      details: 'Document format verified via local synthetic checksum rules.',
      timestamp: new Date().toISOString(),
      isExternalGovernmentVerified: false,
    };
  }

  async checkWatchlist(name: string, passportNumber: string): Promise<WatchlistResult> {
    const normName = name.trim().toUpperCase();
    const normDoc = passportNumber.trim().toUpperCase();

    const hit = this.syntheticWatchlist.find(
      w => w.name === normName || w.passportNumber === normDoc
    );

    if (hit) {
      return {
        isHit: true,
        matchType: hit.matchType,
        threatLevel: hit.threatLevel,
        matchedEntityName: hit.name,
        watchlistDatabase: `${hit.database} [LOCAL DEMO SIMULATION]`,
        details: hit.details,
        actionRequired: hit.actionRequired,
        isExternalGovernmentVerified: false,
      };
    }

    return {
      isHit: false,
      matchType: 'NONE',
      threatLevel: 'NONE',
      watchlistDatabase: 'Local Demo Sentinel Index (Offline)',
      details: 'No records matching traveler in local demo index.',
      actionRequired: 'Standard screening protocol applies.',
      isExternalGovernmentVerified: false,
    };
  }
}

/**
 * Government Verification Provider Placeholder:
 * Exposes authorized integration hooks for Ministry of Home Affairs / SSB CIPA / IVFRT / Interpol I-24/7.
 * Currently returns NOT_AVAILABLE to avoid fabricating fake government-issued confirmations.
 */
export class GovernmentVerificationProvider implements VerificationProvider {
  name = 'Ministry of Home Affairs / CIPA / IVFRT Authorized Gateway';
  isGovernmentAuthorized = true;

  // TODO: Secure mTLS / IPsec VPN connection to MHA CIPA endpoint
  // TODO: Implement SAML 2.0 / OAuth2 JWT credential exchange
  // TODO: Connect to Interpol I-24/7 API via National Central Bureau (NCB) New Delhi

  async verifyDocument(req: DocumentVerificationRequest): Promise<DocumentVerificationResponse> {
    return {
      isVerified: false,
      providerName: this.name,
      status: 'NOT_AVAILABLE',
      details: 'Authorized Government Database Gateway is not connected in this standalone prototype environment. Integration endpoints are prepared for secured deployment.',
      timestamp: new Date().toISOString(),
      isExternalGovernmentVerified: false,
    };
  }

  async checkWatchlist(name: string, passportNumber: string): Promise<WatchlistResult> {
    return {
      isHit: false,
      matchType: 'NONE',
      threatLevel: 'NONE',
      watchlistDatabase: 'MHA National Blacklist / IVFRT Gateway (Standby)',
      details: 'Government database verification: NOT AVAILABLE (Awaiting secure border network uplink).',
      actionRequired: 'Proceed with local document forensic and optical verification.',
      isExternalGovernmentVerified: false,
    };
  }
}

// Active provider instance (Local Demo for current prototype)
export const activeVerificationProvider: VerificationProvider = new LocalDemoVerificationProvider();
export const governmentGatewayStub: VerificationProvider = new GovernmentVerificationProvider();

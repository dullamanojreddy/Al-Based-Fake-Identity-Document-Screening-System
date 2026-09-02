import { DocumentType } from '../types';
import { DocumentProfile, PassportProfile } from './passport.profile';
import { AadhaarProfile } from './aadhaar.profile';
import { DrivingLicenceProfile } from './drivingLicence.profile';
import { VisaProfile } from './visa.profile';
import { PermitProfile } from './permit.profile';

export * from './passport.profile';
export * from './aadhaar.profile';
export * from './drivingLicence.profile';
export * from './visa.profile';
export * from './permit.profile';

const profilesMap: Record<DocumentType, DocumentProfile | null> = {
  passport: PassportProfile,
  national_id: AadhaarProfile,
  driving_license: DrivingLicenceProfile,
  visa: VisaProfile,
  border_permit: PermitProfile,
  unsupported_document: null,
  unknown: null,
};

export function getDocumentProfile(docType: DocumentType): DocumentProfile | null {
  return profilesMap[docType] || null;
}

export function getAllDocumentProfiles(): DocumentProfile[] {
  return [PassportProfile, AadhaarProfile, DrivingLicenceProfile, VisaProfile, PermitProfile];
}

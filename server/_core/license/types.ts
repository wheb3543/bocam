/**
 * License Types
 * أنواع التراخيص
 */

/**
 * License payload interface
 */
export interface LicensePayload {
  hid: string; // Hardware ID
  exp: number; // Expiry timestamp
  feat: string[]; // Enabled features
  iat: number; // Issued at timestamp
  ver: string; // License version
}

/**
 * License information interface
 */
export interface LicenseInfo {
  hardwareId: string;
  expiryDate: number;
  features: string[];
  issuedAt: number;
  version: string;
  isValid: boolean;
  validationMessage: string;
}

/**
 * License file interface
 */
export interface LicenseFile {
  key: string;
  hardwareId: string;
  expiryDate: string;
  features: string[];
  issuedAt: string;
  version: string;
}

/**
 * Signature verification result
 */
export interface SignatureVerificationResult {
  valid: boolean;
  payload: LicensePayload | null;
}

/**
 * Validation error types
 */
export type ValidationErrorType =
  | 'signature_invalid'
  | 'hardware_id_mismatch'
  | 'license_expired'
  | 'no_features_enabled'
  | 'file_not_found'
  | 'invalid_structure'
  | 'unknown_error';

/**
 * Validation error
 */
export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * License Management System
 * 
 * Local cryptographic license validation system that works offline.
 * Uses Hardware-ID binding with RSA-2048 digital signatures.
 * Acts as a Kill Switch - terminates server if license is invalid.
 * 
 * Security Features:
 * - Hardware-ID based licensing (MAC Address)
 * - RSA-2048 digital signature verification
 * - Offline validation (no internet required)
 * - Kill Switch on invalid license
 * - Feature flag support
 * 
 * @module license
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * License payload interface
 */
interface LicensePayload {
  hid: string;           // Hardware ID
  exp: number;           // Expiry timestamp
  feat: string[];        // Enabled features
  iat: number;           // Issued at timestamp
  ver: string;           // License version
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
interface LicenseFile {
  key: string;
  hardwareId: string;
  expiryDate: string;
  features: string[];
  issuedAt: string;
  version: string;
}

/**
 * Get Hardware ID (MAC Address)
 * 
 * Reads the MAC address of the first non-internal network interface.
 * This serves as a unique hardware identifier for license binding.
 * 
 * @returns Hardware ID (MAC Address in uppercase without colons)
 * @throws Error if no valid network interface is found
 */
export function getHardwareId(): string {
  try {
    const networkInterfaces = os.networkInterfaces();
    
    // Iterate through all network interfaces
    for (const interfaceName of Object.keys(networkInterfaces)) {
      const interfaces = networkInterfaces[interfaceName];
      
      if (!interfaces) continue;
      
      // Find first non-internal IPv4 interface
      for (const iface of interfaces) {
        if (
          iface.family === 'IPv4' &&
          !iface.internal &&
          iface.mac &&
          iface.mac !== '00:00:00:00:00:00' // Invalid MAC address
        ) {
          const hardwareId = iface.mac.replace(/:/g, '').toUpperCase();
          console.log(`🔍 Hardware ID detected: ${hardwareId} (${interfaceName})`);
          return hardwareId;
        }
      }
    }
    
    // Fallback: use first available MAC address
    for (const interfaceName of Object.keys(networkInterfaces)) {
      const interfaces = networkInterfaces[interfaceName];
      
      if (!interfaces) continue;
      
      for (const iface of interfaces) {
        if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
          const hardwareId = iface.mac.replace(/:/g, '').toUpperCase();
          console.log(`🔍 Hardware ID (fallback): ${hardwareId} (${interfaceName})`);
          return hardwareId;
        }
      }
    }
    
    throw new Error('No valid network interface found for Hardware ID generation');
  } catch (error) {
    console.error('❌ Error getting Hardware ID:', error);
    throw new Error(`Failed to get Hardware ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get license file path
 * 
 * Returns the path to the license.json file.
 * First checks current directory, then checks root directory.
 * 
 * @returns Path to license.json file
 */
function getLicenseFilePath(): string {
  // Check current directory first
  const currentDirLicense = path.join(process.cwd(), 'license.json');
  if (fs.existsSync(currentDirLicense)) {
    return currentDirLicense;
  }
  
  // Check root directory
  const rootDirLicense = path.join(process.cwd(), '..', 'license.json');
  if (fs.existsSync(rootDirLicense)) {
    return rootDirLicense;
  }
  
  // Return default path in current directory
  return currentDirLicense;
}

/**
 * Load license file
 * 
 * Reads and parses the license.json file.
 * 
 * @param licensePath - Path to license file
 * @returns License file object
 * @throws Error if license file is not found or invalid
 */
function loadLicenseFile(licensePath: string): LicenseFile {
  try {
    if (!fs.existsSync(licensePath)) {
      throw new Error(`License file not found: ${licensePath}`);
    }
    
    const licenseContent = fs.readFileSync(licensePath, 'utf-8');
    const licenseFile: LicenseFile = JSON.parse(licenseContent);
    
    // Validate license file structure
    if (!licenseFile.key || !licenseFile.hardwareId || !licenseFile.expiryDate || !licenseFile.features) {
      throw new Error('Invalid license file structure');
    }
    
    return licenseFile;
  } catch (error) {
    console.error('❌ Error loading license file:', error);
    throw new Error(`Failed to load license file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get public key for verification
 * 
 * Returns the public key used for digital signature verification.
 * The public key is embedded in the application (secure).
 * 
 * @returns Public key in PEM format
 * @throws Error if public key is not found
 */
function getPublicKey(): string {
  // Default public key (will be replaced with actual public key)
  const defaultPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuK1E6qF7VQ8qVhN6h5G9
X2Y7A3B5C8D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0QIDAQAB
-----END PUBLIC KEY-----`;

  // Try to load from file
  const publicKeyPath = path.join(process.cwd(), 'public-key.pem');
  if (fs.existsSync(publicKeyPath)) {
    return fs.readFileSync(publicKeyPath, 'utf-8');
  }
  
  return defaultPublicKey;
}

/**
 * Verify digital signature
 * 
 * Verifies the RSA-2048 digital signature of the license.
 * 
 * @param licenseKey - Base64 encoded license key
 * @returns Verification result
 */
function verifySignature(licenseKey: string): { valid: boolean; payload: LicensePayload | null } {
  try {
    // Decode license key
    const licenseBuffer = Buffer.from(licenseKey, 'base64');
    const licenseObject = JSON.parse(licenseBuffer.toString('utf-8'));
    
    if (!licenseObject.payload || !licenseObject.signature) {
      return { valid: false, payload: null };
    }
    
    const payload: LicensePayload = licenseObject.payload;
    const signature = Buffer.from(licenseObject.signature, 'base64');
    
    // Get public key
    const publicKey = getPublicKey();
    
    // Verify signature
    const payloadString = JSON.stringify(payload);
    const isValid = crypto.verify(
      'sha256',
      Buffer.from(payloadString),
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      },
      signature
    );
    
    return { valid: isValid, payload };
  } catch (error) {
    console.error('❌ Error verifying signature:', error);
    return { valid: false, payload: null };
  }
}

/**
 * Validate license
 * 
 * Comprehensive license validation including:
 * - Digital signature verification
 * - Hardware ID matching
 * - Expiry date check
 * - Feature flag validation
 * 
 * Acts as a Kill Switch - terminates server if license is invalid.
 * 
 * @returns License information
 * @throws Error and terminates process if license is invalid
 */
export function validateLicense(): LicenseInfo {
  console.log('🔐 License Validation Starting...');
  console.log('');
  
  try {
    // Get license file path
    const licensePath = getLicenseFilePath();
    console.log(`📄 License file path: ${licensePath}`);
    
    // Load license file
    const licenseFile = loadLicenseFile(licensePath);
    console.log(`✅ License file loaded successfully`);
    
    // Get current hardware ID
    const currentHardwareId = getHardwareId();
    
    // Verify signature
    console.log(`🔍 Verifying digital signature...`);
    const { valid, payload } = verifySignature(licenseFile.key);
    
    if (!valid || !payload) {
      console.error('❌ LICENSE VALIDATION FAILED: Invalid digital signature');
      console.error('');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('KILL SWITCH ACTIVATED: License signature is invalid');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');
      process.exit(1);
    }
    
    console.log(`✅ Digital signature verified`);
    
    // Validate hardware ID
    console.log(`🔍 Validating Hardware ID...`);
    console.log(`   - License Hardware ID: ${payload.hid}`);
    console.log(`   - Current Hardware ID: ${currentHardwareId}`);
    
    if (payload.hid !== currentHardwareId) {
      console.error('❌ LICENSE VALIDATION FAILED: Hardware ID mismatch');
      console.error('');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('KILL SWITCH ACTIVATED: Hardware ID does not match license');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');
      console.error(`Expected: ${payload.hid}`);
      console.error(`Current:  ${currentHardwareId}`);
      console.error('');
      console.error('To fix this issue:');
      console.error('1. Generate a new license for this machine');
      console.error('2. Run: pnpm license:generate <hardwareId> <expiry> <features>');
      console.error('');
      process.exit(1);
    }
    
    console.log(`✅ Hardware ID matched`);
    
    // Validate expiry date
    console.log(`🔍 Validating expiry date...`);
    const currentTime = Math.floor(Date.now() / 1000);
    console.log(`   - License expiry: ${new Date(payload.exp * 1000).toISOString()}`);
    console.log(`   - Current time: ${new Date(currentTime * 1000).toISOString()}`);
    
    if (payload.exp < currentTime) {
      console.error('❌ LICENSE VALIDATION FAILED: License has expired');
      console.error('');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('KILL SWITCH ACTIVATED: License has expired');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');
      console.error(`License expired on: ${new Date(payload.exp * 1000).toISOString()}`);
      console.error('');
      console.error('To fix this issue:');
      console.error('1. Renew your license');
      console.error('2. Contact support for a new license key');
      console.error('');
      process.exit(1);
    }
    
    console.log(`✅ License is valid (not expired)`);
    
    // Calculate days until expiry
    const daysUntilExpiry = Math.floor((payload.exp - currentTime) / (24 * 60 * 60));
    console.log(`⏰ License valid for: ${daysUntilExpiry} days`);
    
    // Validate features
    console.log(`🔍 Validating features...`);
    console.log(`   - Enabled features: ${payload.feat.join(', ')}`);
    
    if (!payload.feat || payload.feat.length === 0) {
      console.error('❌ LICENSE VALIDATION FAILED: No features enabled');
      console.error('');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('KILL SWITCH ACTIVATED: No features enabled in license');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('');
      process.exit(1);
    }
    
    console.log(`✅ Features validated (${payload.feat.length} features enabled)`);
    
    console.log('');
    console.log('🎉 LICENSE VALIDATION SUCCESSFUL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    // Return license info
    const licenseInfo: LicenseInfo = {
      hardwareId: payload.hid,
      expiryDate: payload.exp,
      features: payload.feat,
      issuedAt: payload.iat,
      version: payload.ver,
      isValid: true,
      validationMessage: 'License is valid',
    };
    
    return licenseInfo;
  } catch (error) {
    if (error instanceof Error && error.message.includes('process.exit')) {
      // Re-throw process.exit errors
      throw error;
    }
    
    console.error('❌ LICENSE VALIDATION FAILED:', error);
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('KILL SWITCH ACTIVATED: License validation error');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('');
    process.exit(1);
  }
}

/**
 * Check if a feature is enabled
 * 
 * Checks if a specific feature is enabled in the current license.
 * 
 * @param feature - Feature name to check
 * @returns True if feature is enabled, false otherwise
 */
export function isFeatureEnabled(feature: string): boolean {
  try {
    const licenseInfo = validateLicense();
    return licenseInfo.features.includes(feature) || licenseInfo.features.includes('*');
  } catch (error) {
    console.error('❌ Error checking feature:', error);
    return false;
  }
}

/**
 * Get enabled features
 * 
 * Returns list of all enabled features from the current license.
 * 
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): string[] {
  try {
    const licenseInfo = validateLicense();
    return licenseInfo.features;
  } catch (error) {
    console.error('❌ Error getting features:', error);
    return [];
  }
}

/**
 * License middleware initialization
 * 
 * Initializes the license validation system.
 * This should be called during application startup.
 * 
 * @returns License information
 */
export function initializeLicense(): LicenseInfo {
  try {
    console.log('🚀 Initializing License System...');
    console.log('');
    
    const licenseInfo = validateLicense();
    
    console.log('✅ License System initialized successfully');
    console.log('');
    
    return licenseInfo;
  } catch (error) {
    console.error('❌ Failed to initialize license system:', error);
    throw error;
  }
}
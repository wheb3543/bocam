#!/usr/bin/env tsx
/**
 * Generate License Key Pair Tool
 * 
 * Generates RSA-2048 public/private key pair for license signing and verification.
 * This tool creates the cryptographic foundation for the licensing system.
 * 
 * Usage:
 *   pnpm license:generate-keys
 * 
 * Security Notes:
 * - Keep the private key secure and NEVER commit it to version control
 * - The private key should be stored on a secure, offline system
 * - The public key will be embedded in the application for license verification
 * - RSA-2048 provides strong security for license validation
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface KeyPairGenerationOptions {
  modulusLength?: number;
  outputDir?: string;
  publicKeyFile?: string;
  privateKeyFile?: string;
}

/**
 * Generate RSA key pair for license signing
 * @param options - Configuration options for key generation
 * @returns Object containing public and private keys
 */
function generateKeyPair(options: KeyPairGenerationOptions = {}): {
  publicKey: string;
  privateKey: string;
} {
  const {
    modulusLength = 2048, // RSA-2048 for strong security
    outputDir = path.join(__dirname, '..', 'license-keys'),
    publicKeyFile = 'public-key.pem',
    privateKeyFile = 'private-key.pem',
  } = options;

  console.log('🔐 Generating RSA-2048 Key Pair...');
  console.log('⚙️  Configuration:');
  console.log(`   - Modulus Length: ${modulusLength} bits`);
  console.log(`   - Output Directory: ${outputDir}`);
  console.log(`   - Public Key File: ${publicKeyFile}`);
  console.log(`   - Private Key File: ${privateKeyFile}`);
  console.log('');

  // Generate RSA key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save public key
  const publicKeyPath = path.join(outputDir, publicKeyFile);
  fs.writeFileSync(publicKeyPath, publicKey);
  console.log('✅ Public key saved:', publicKeyPath);

  // Save private key
  const privateKeyPath = path.join(outputDir, privateKeyFile);
  fs.writeFileSync(privateKeyPath, privateKey);
  console.log('✅ Private key saved:', privateKeyPath);
  console.log('');

  // Security warnings
  console.log('⚠️  SECURITY WARNING:');
  console.log('   - The PRIVATE KEY must be kept SECRET and SECURE');
  console.log('   - NEVER commit the private key to version control');
  console.log('   - Store the private key on an offline, secure system');
  console.log('   - The public key is safe to distribute with the application');
  console.log('   - Only license generation should use the private key');
  console.log('');

  // Add to .gitignore if not already present
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  }

  const licenseKeysEntry = '# License keys - keep private key secure\nlicense-keys/\n';
  
  if (!gitignoreContent.includes('license-keys/')) {
    gitignoreContent += '\n' + licenseKeysEntry;
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Added license-keys/ to .gitignore');
  }

  console.log('🎉 Key pair generation completed successfully!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Use the private key to generate license keys');
  console.log('   2. Embed the public key in the application for verification');
  console.log('   3. Test license generation: pnpm license:generate <hardwareId> <expiry> <features>');
  console.log('');

  return {
    publicKey: publicKeyPath,
    privateKey: privateKeyPath,
  };
}

/**
 * Main execution
 */
function main() {
  try {
    const args = process.argv.slice(2);
    
    // Parse command line arguments
    const options: KeyPairGenerationOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--modulus':
        case '-m':
          options.modulusLength = parseInt(args[++i], 10);
          break;
        case '--output':
        case '-o':
          options.outputDir = args[++i];
          break;
        case '--public-key':
          options.publicKeyFile = args[++i];
          break;
        case '--private-key':
          options.privateKeyFile = args[++i];
          break;
        case '--help':
        case '-h':
          console.log(`
Usage: pnpm license:generate-keys [options]

Options:
  -m, --modulus <bits>        RSA modulus length (default: 2048)
  -o, --output <dir>          Output directory (default: ./license-keys)
  --public-key <file>         Public key filename (default: public-key.pem)
  --private-key <file>        Private key filename (default: private-key.pem)
  -h, --help                  Show this help message

Examples:
  pnpm license:generate-keys
  pnpm license:generate-keys --modulus 4096
  pnpm license:generate-keys --output ./secure-keys
          `);
          process.exit(0);
        default:
          console.error('❌ Unknown option:', args[i]);
          console.log('Use --help for usage information');
          process.exit(1);
      }
    }

    generateKeyPair(options);
  } catch (error) {
    console.error('❌ Error generating key pair:', error);
    process.exit(1);
  }
}

// Run the tool
main();
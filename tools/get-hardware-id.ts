#!/usr/bin/env tsx
/**
 * Get Hardware ID Tool
 * 
 * Quick tool to get the Hardware ID (MAC Address) for license generation.
 * 
 * Usage:
 *   pnpm license:get-hardware-id
 */

import os from 'os';

function getHardwareId(): string {
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
        iface.mac !== '00:00:00:00:00:00'
      ) {
        const hardwareId = iface.mac.replace(/:/g, '').toUpperCase();
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
        return hardwareId;
      }
    }
  }
  
  throw new Error('No valid network interface found for Hardware ID generation');
}

// Main execution
try {
  const hardwareId = getHardwareId();
  console.log('🔍 Hardware ID:', hardwareId);
  console.log('');
  console.log('📋 Usage:');
  console.log('   pnpm license:generate "' + hardwareId + '" <expiryTimestamp> "*"');
  console.log('');
  console.log('📅 Calculate expiry timestamp:');
  console.log('   - 30 days: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)');
  console.log('   - 1 year:  Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)');
  console.log('');
  console.log('🔢 Example (1 year from now):');
  const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  console.log('   pnpm license:generate "' + hardwareId + '" ' + oneYearFromNow + ' "*"');
  console.log('');
} catch (error) {
  console.error('❌ Error getting Hardware ID:', error);
  process.exit(1);
}
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import type { AccessContext, AccessPolicy, ValidationResult } from '@/types';

class ContextService {
  private fpPromise: Promise<any> | null = null;

  constructor() {
    this.fpPromise = FingerprintJS.load();
  }

  async getDeviceFingerprint(): Promise<string> {
    try {
      const fp = await this.fpPromise;
      const result = await fp?.get();
      return result?.visitorId || 'unknown-device';
    } catch (error) {
      console.error('Failed to get device fingerprint:', error);
      return 'unknown-device';
    }
  }

  async getCurrentContext(): Promise<AccessContext> {
    const deviceId = await this.getDeviceFingerprint();
    
    // In production, you'd get real IP and country from backend
    // For demo, we'll use placeholder or geolocation API
    const ipAddress = await this.getIPAddress();
    const country = await this.getCountry(ipAddress);

    return {
      deviceId,
      ipAddress,
      country,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
  }

  private async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '0.0.0.0';
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return '0.0.0.0';
    }
  }

  private async getCountry(ip: string): Promise<string> {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return data.country_name || 'Unknown';
    } catch (error) {
      console.error('Failed to get country:', error);
      return 'Unknown';
    }
  }

  validateAccess(context: AccessContext, policy: AccessPolicy): ValidationResult {
    const violations: string[] = [];
    let requireStepUp = policy.requireStepUp;

    // Check country
    if (policy.allowedCountries.length > 0 && !policy.allowedCountries.includes(context.country)) {
      violations.push(`Access from ${context.country} is not allowed`);
    }

    // Check time window
    if (policy.allowedTimeStart && policy.allowedTimeEnd) {
      const now = new Date(context.timestamp);
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime < policy.allowedTimeStart || currentTime > policy.allowedTimeEnd) {
        violations.push(`Access allowed only between ${policy.allowedTimeStart} and ${policy.allowedTimeEnd}`);
      }
    }

    // Check trusted devices
    if (policy.trustedDevices.length > 0 && !policy.trustedDevices.includes(context.deviceId)) {
      violations.push('Device not recognized as trusted');
      requireStepUp = true; // Force step-up for unknown devices
    }

    const allowed = violations.length === 0;

    return {
      allowed,
      requireStepUp: !allowed ? false : requireStepUp, // Only require step-up if access would be allowed
      reason: violations.join('; '),
      violations,
    };
  }

  // Demo context for testing
  getDemoContext(scenario: 'normal' | 'suspicious' | 'foreign' | 'new-device'): AccessContext {
    const baseContext: AccessContext = {
      deviceId: 'device-123',
      ipAddress: '103.45.67.89',
      country: 'India',
      timestamp: new Date().toISOString(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };

    switch (scenario) {
      case 'suspicious':
        return {
          ...baseContext,
          timestamp: new Date(new Date().setHours(3, 0, 0, 0)).toISOString(), // 3 AM
        };
      case 'foreign':
        return {
          ...baseContext,
          ipAddress: '198.51.100.42',
          country: 'Russia',
        };
      case 'new-device':
        return {
          ...baseContext,
          deviceId: 'device-unknown-999',
        };
      default:
        return baseContext;
    }
  }
}

export const contextService = new ContextService();

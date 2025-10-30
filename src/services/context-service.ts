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
    let score = 0;
    const violations: string[] = [];
    
    // Country check (40 points)
    if (policy.allowedCountries.length > 0) {
      if (policy.allowedCountries.includes(context.country)) {
        score += 40;
      } else {
        violations.push(`Access from ${context.country} is not allowed`);
      }
    } else {
      // If no country restriction, give full points
      score += 40;
    }
    
    // Trusted device check (40 points)
    if (policy.trustedDevices.length > 0) {
      if (policy.trustedDevices.includes(context.deviceId)) {
        score += 40;
      } else {
        violations.push('Device not recognized as trusted');
      }
    } else {
      // If no device restriction, give full points
      score += 40;
    }
    
    // Time window check (20 points)
    if (policy.allowedTimeStart && policy.allowedTimeEnd) {
      const now = new Date(context.timestamp);
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= policy.allowedTimeStart && currentTime <= policy.allowedTimeEnd) {
        score += 20;
      } else {
        violations.push(`Access allowed only between ${policy.allowedTimeStart} and ${policy.allowedTimeEnd}`);
      }
    } else {
      // If no time restriction, give full points
      score += 20;
    }
    
    // Determine access based on risk score
    let allowed = false;
    let requireStepUp = false;
    let reason = '';
    
    if (score >= 80) {
      // High trust - allow access
      allowed = true;
      requireStepUp = false;
      reason = `Access granted - High trust score (${score}/100)`;
    } else if (score >= 50) {
      // Medium trust - require step-up authentication
      allowed = true;
      requireStepUp = true;
      reason = `Step-up authentication required - Medium trust score (${score}/100)`;
    } else {
      // Low trust - deny access
      allowed = false;
      requireStepUp = false;
      reason = `Access denied - Low trust score (${score}/100)`;
    }

    return {
      allowed,
      requireStepUp,
      reason,
      violations,
      riskScore: score,
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

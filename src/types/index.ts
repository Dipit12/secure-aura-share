export interface AccessContext {
  deviceId: string;
  ipAddress: string;
  country: string;
  timestamp: string;
  userAgent: string;
}

export interface AccessPolicy {
  allowedCountries: string[];
  allowedTimeStart?: string; // HH:mm format
  allowedTimeEnd?: string;   // HH:mm format
  trustedDevices: string[];
  requireStepUp: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  policy: AccessPolicy;
  s3Key?: string;
}

export interface AccessLog {
  id: string;
  fileId: string;
  fileName: string;
  userId: string;
  action: 'upload' | 'download' | 'view' | 'denied';
  context: AccessContext;
  result: 'allowed' | 'denied' | 'step-up-required';
  reason?: string;
  violations?: string[];
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  trustedDevices: string[];
}

export interface ValidationResult {
  allowed: boolean;
  requireStepUp: boolean;
  reason?: string;
  violations: string[];
}

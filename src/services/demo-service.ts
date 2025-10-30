import type { FileItem, AccessLog, AccessPolicy } from '@/types';

// Demo data for testing without AWS
const DEMO_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Q4_Financial_Report.pdf',
    size: 2457600,
    uploadedAt: '2025-10-28T10:30:00Z',
    uploadedBy: 'demo-user',
    policy: {
      allowedCountries: ['India', 'United States'],
      allowedTimeStart: '09:00',
      allowedTimeEnd: '18:00',
      trustedDevices: ['device-123', 'device-456'],
      requireStepUp: true,
    },
  },
  {
    id: '2',
    name: 'Product_Roadmap_2025.docx',
    size: 1048576,
    uploadedAt: '2025-10-27T14:20:00Z',
    uploadedBy: 'demo-user',
    policy: {
      allowedCountries: ['India'],
      trustedDevices: ['device-123'],
      requireStepUp: false,
    },
  },
  {
    id: '3',
    name: 'Team_Photo.jpg',
    size: 524288,
    uploadedAt: '2025-10-26T09:15:00Z',
    uploadedBy: 'demo-user',
    policy: {
      allowedCountries: ['India', 'United States', 'United Kingdom'],
      trustedDevices: [],
      requireStepUp: false,
    },
  },
  {
    id: '4',
    name: 'Security_Audit_Report.pdf',
    size: 3145728,
    uploadedAt: '2025-10-25T16:45:00Z',
    uploadedBy: 'demo-user',
    policy: {
      allowedCountries: ['India'],
      allowedTimeStart: '09:00',
      allowedTimeEnd: '17:00',
      trustedDevices: ['device-123'],
      requireStepUp: true,
    },
  },
];

const DEMO_LOGS: AccessLog[] = [
  {
    id: 'log-1',
    fileId: '1',
    fileName: 'Q4_Financial_Report.pdf',
    userId: 'demo-user',
    action: 'download',
    context: {
      deviceId: 'device-123',
      ipAddress: '103.45.67.89',
      country: 'India',
      timestamp: '2025-10-30T10:15:00Z',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    result: 'allowed',
    timestamp: '2025-10-30T10:15:00Z',
  },
  {
    id: 'log-2',
    fileId: '4',
    fileName: 'Security_Audit_Report.pdf',
    userId: 'demo-user',
    action: 'download',
    context: {
      deviceId: 'device-789',
      ipAddress: '198.51.100.42',
      country: 'United States',
      timestamp: '2025-10-30T03:30:00Z',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    result: 'denied',
    reason: 'Access from untrusted country',
    violations: ['Country mismatch', 'Outside allowed hours'],
    timestamp: '2025-10-30T03:30:00Z',
  },
  {
    id: 'log-3',
    fileId: '2',
    fileName: 'Product_Roadmap_2025.docx',
    userId: 'demo-user',
    action: 'view',
    context: {
      deviceId: 'device-123',
      ipAddress: '103.45.67.89',
      country: 'India',
      timestamp: '2025-10-29T14:22:00Z',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    result: 'allowed',
    timestamp: '2025-10-29T14:22:00Z',
  },
  {
    id: 'log-4',
    fileId: '1',
    fileName: 'Q4_Financial_Report.pdf',
    userId: 'demo-user',
    action: 'download',
    context: {
      deviceId: 'device-999',
      ipAddress: '103.45.67.89',
      country: 'India',
      timestamp: '2025-10-29T11:45:00Z',
      userAgent: 'Mozilla/5.0 (Linux; Android 10)',
    },
    result: 'step-up-required',
    reason: 'New device detected',
    violations: ['Untrusted device'],
    timestamp: '2025-10-29T11:45:00Z',
  },
  {
    id: 'log-5',
    fileId: '3',
    fileName: 'Team_Photo.jpg',
    userId: 'demo-user',
    action: 'view',
    context: {
      deviceId: 'device-456',
      ipAddress: '198.51.100.42',
      country: 'United States',
      timestamp: '2025-10-28T16:00:00Z',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    result: 'allowed',
    timestamp: '2025-10-28T16:00:00Z',
  },
];

class DemoService {
  private files: FileItem[] = [...DEMO_FILES];
  private logs: AccessLog[] = [...DEMO_LOGS];

  async uploadFile(file: File, policy: AccessPolicy, userId: string): Promise<FileItem> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newFile: FileItem = {
      id: `demo-${Date.now()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      policy,
    };

    this.files.unshift(newFile);
    return newFile;
  }

  async getFiles(userId: string): Promise<FileItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.files.filter(f => f.uploadedBy === userId);
  }

  async getDownloadUrl(fileItem: FileItem): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Return a demo blob URL
    return `blob:demo/${fileItem.id}`;
  }

  async logAccess(log: AccessLog): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logs.unshift(log);
  }

  async getAccessLogs(userId: string, limit: number = 50): Promise<AccessLog[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.logs
      .filter(l => l.userId === userId)
      .slice(0, limit);
  }

  // Additional demo methods for testing
  getDemoFiles(): FileItem[] {
    return [...DEMO_FILES];
  }

  getDemoLogs(): AccessLog[] {
    return [...DEMO_LOGS];
  }
}

export const demoService = new DemoService();

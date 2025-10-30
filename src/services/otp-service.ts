import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { AWS_CONFIG, isAWSConfigured } from '@/lib/aws-config';

class OTPService {
  private sesClient: SESClient | null = null;
  private snsClient: SNSClient | null = null;
  private otpStore: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor() {
    if (isAWSConfigured()) {
      this.sesClient = new SESClient({
        region: AWS_CONFIG.region,
        credentials: AWS_CONFIG.credentials,
      });

      this.snsClient = new SNSClient({
        region: AWS_CONFIG.region,
        credentials: AWS_CONFIG.credentials,
      });
    }
  }

  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email using SES
  async sendOTPEmail(email: string, userId: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    this.otpStore.set(userId, { code: otp, expiresAt });

    if (!this.sesClient) {
      console.log(`[DEMO MODE] OTP for ${email}: ${otp}`);
      return otp; // Return OTP for demo purposes
    }

    try {
      const command = new SendEmailCommand({
        Source: AWS_CONFIG.ses.senderEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: 'Your Secure Access OTP',
          },
          Body: {
            Text: {
              Data: `Your OTP for secure file access is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
            },
            Html: {
              Data: `
                <html>
                  <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #0f172a;">Secure Access Verification</h2>
                    <p>Your OTP for secure file access is:</p>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
                      ${otp}
                    </div>
                    <p style="color: #64748b; margin-top: 20px;">This code will expire in 5 minutes.</p>
                    <p style="color: #64748b;">If you didn't request this, please ignore this email.</p>
                  </body>
                </html>
              `,
            },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`OTP sent to ${email}`);
      return otp;
    } catch (error) {
      console.error('Failed to send OTP via email:', error);
      throw new Error('Failed to send OTP');
    }
  }

  // Send OTP via SMS using SNS
  async sendOTPSMS(phoneNumber: string, userId: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    this.otpStore.set(userId, { code: otp, expiresAt });

    if (!this.snsClient) {
      console.log(`[DEMO MODE] OTP for ${phoneNumber}: ${otp}`);
      return otp; // Return OTP for demo purposes
    }

    try {
      const command = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: `Your Secure Access OTP is: ${otp}. Valid for 5 minutes.`,
      });

      await this.snsClient.send(command);
      console.log(`OTP sent to ${phoneNumber}`);
      return otp;
    } catch (error) {
      console.error('Failed to send OTP via SMS:', error);
      throw new Error('Failed to send OTP');
    }
  }

  // Verify OTP
  verifyOTP(userId: string, code: string): boolean {
    const stored = this.otpStore.get(userId);
    
    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(userId);
      return false;
    }

    if (stored.code !== code) {
      return false;
    }

    // OTP is valid, remove it
    this.otpStore.delete(userId);
    return true;
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [userId, stored] of this.otpStore.entries()) {
      if (now > stored.expiresAt) {
        this.otpStore.delete(userId);
      }
    }
  }
}

export const otpService = new OTPService();

// Clean up expired OTPs every minute
setInterval(() => otpService.cleanupExpiredOTPs(), 60000);

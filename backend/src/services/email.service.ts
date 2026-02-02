import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private static transporter: Transporter;

  /**
   * Initialize email transporter
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    const transporter = this.getTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Portfolio Website'} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<void> {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, 
          please ignore this email.
        </p>
      </div>
    `;

    const text = `
      Password Reset Request
      
      You requested to reset your password. Click the link below to reset it:
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request a password reset, 
      please ignore this email.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text,
      html,
    });
  }

  /**
   * Send password reset confirmation email
   */
  static async sendPasswordResetConfirmation(email: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Successful</h2>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          This is an automated message, please do not reply.
        </p>
      </div>
    `;

    const text = `
      Password Reset Successful
      
      Your password has been successfully reset.
      
      If you didn't make this change, please contact support immediately.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Successful',
      text,
      html,
    });
  }
}

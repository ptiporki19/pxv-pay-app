import { createClient } from '@supabase/supabase-js'

interface EmailRecipient {
  email: string
  name?: string
}

interface EmailRequest {
  to: EmailRecipient[]
  subject: string
  html: string
  text: string
  from?: {
    email: string
    name: string
  }
}

interface EmailTemplate {
  html: string
  text: string
}

interface SupportTicketDetails {
  ticketId: string
  subject: string
  category?: string
  priority: string
}

interface SupportReplyDetails {
  ticketId: string
  subject: string
  replyPreview: string
  isAdminReply: boolean
}

interface PaymentDetails {
  amount: string
  currency: string
  paymentMethod?: string
  customerName?: string
  merchantName?: string
  checkoutUrl?: string
}

class EmailService {
  private static instance: EmailService
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frdksqjaiuakkalebnzd.supabase.co'
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private getDefaultFrom() {
    return {
      email: process.env.FROM_EMAIL || 'info@primexvanguard.com',
      name: process.env.FROM_NAME || 'PXV Pay'
    }
  }

  /**
   * Send payment proof confirmation to customer
   */
  public async sendPaymentProofSubmittedEmail(
    customerEmail: string,
    customerName: string,
    paymentDetails: PaymentDetails
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'Payment Received',
      greeting: `Hello ${customerName}`,
      content: `
        <p>Your payment confirmation is under review.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6c757d; width: 30%;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">${paymentDetails.amount} ${paymentDetails.currency}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Status:</td><td style="padding: 8px 0; color: #f59e0b; font-weight: 500;">Under Review</td></tr>
          </table>
        </div>
        
        <p>You'll receive confirmation once verified. This typically takes 1-24 hours.</p>
      `,
      footerText: 'Thank you for your business.'
    })

    return this.sendEmail({
      to: [{ email: customerEmail, name: customerName }],
      subject: 'Payment Received - Under Review',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send notification to merchant about new payment requiring verification
   */
  public async sendNewPaymentNotificationEmail(
    merchantEmail: string,
    merchantName: string,
    paymentDetails: PaymentDetails,
    dashboardUrl: string = 'https://pxvpay.com/dashboard'
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'Payment Verification Required',
      greeting: `Hello ${merchantName}`,
      content: `
        <p>A customer has submitted payment confirmation requiring your review.</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6c757d; width: 30%;">Customer:</td><td style="padding: 8px 0; font-weight: 600;">${paymentDetails.customerName || 'Customer'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">${paymentDetails.amount} ${paymentDetails.currency}</td></tr>
            ${paymentDetails.paymentMethod ? `<tr><td style="padding: 8px 0; color: #6c757d;">Method:</td><td style="padding: 8px 0;">${paymentDetails.paymentMethod}</td></tr>` : ''}
          </table>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Review Payment
          </a>
        </div>
        
        <p>Please update the payment status in your dashboard.</p>
      `,
      footerText: 'Manage your payments with PXV Pay.'
    })

    return this.sendEmail({
      to: [{ email: merchantEmail, name: merchantName }],
      subject: 'Payment Verification Required',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send notification to admin about new payment activity
   */
  public async sendAdminPaymentNotificationEmail(
    adminEmail: string,
    paymentDetails: PaymentDetails,
    dashboardUrl: string = 'https://pxvpay.com/admin'
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'New Payment Activity',
      greeting: 'Admin Notification',
      content: `
        <p>New payment submitted on the platform.</p>
        
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6c757d; width: 30%;">Merchant:</td><td style="padding: 8px 0; font-weight: 600;">${paymentDetails.merchantName || 'Merchant'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">${paymentDetails.amount} ${paymentDetails.currency}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Customer:</td><td style="padding: 8px 0;">${paymentDetails.customerName || 'Customer'}</td></tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View Dashboard
          </a>
        </div>
      `,
      footerText: 'Platform monitoring'
    })

    return this.sendEmail({
      to: [{ email: adminEmail, name: 'Admin' }],
      subject: 'New Payment Activity',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send welcome email to new users
   */
  public async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'Welcome to PXV Pay',
      greeting: `Welcome ${userName}`,
      content: `
        <p>Your account is ready. Start creating payment links for your business.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Quick Start:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #6b7280;">
            <li>Create your first payment link</li>
            <li>Add your branding and payment details</li>
            <li>Share with customers</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://pxvpay.com/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Get Started
          </a>
        </div>
      `,
      footerText: 'Start accepting payments today.'
    })

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      subject: 'Welcome to PXV Pay',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send admin notification about new user signup
   */
  public async sendNewUserSignupNotificationEmail(
    adminEmail: string,
    newUserEmail: string,
    userRole: string
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'New User Registration',
      greeting: 'Admin Notification',
      content: `
        <p>New user registered on the platform.</p>
        
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6c757d; width: 30%;">Email:</td><td style="padding: 8px 0; font-weight: 600;">${newUserEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Role:</td><td style="padding: 8px 0;">${userRole}</td></tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://pxvpay.com/admin/users" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Manage Users
          </a>
        </div>
      `,
      footerText: 'User management'
    })

    return this.sendEmail({
      to: [{ email: adminEmail, name: 'Admin' }],
      subject: 'New User Registration',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send engagement reminder email to users (new function)
   */
  public async sendEngagementReminderEmail(
    userEmail: string,
    userName: string,
    userRole: string
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'Ready to Get Back to Business?',
      greeting: `Hello ${userName}`,
      content: `
        <p>Your PXV Pay account is ready when you are.</p>
        
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: white; margin: 0; font-size: 16px; line-height: 1.5;">
            <strong>Beyond Boundaries</strong><br/>
            <span style="opacity: 0.9;">Create payment experiences that work exactly how you want them.</span>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">What You Can Do:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #6b7280;">
            <li>Create custom payment links in minutes</li>
            <li>Add your branding and business details</li>
            <li>Accept payments from customers worldwide</li>
            <li>Track and manage all payments in one place</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://pxvpay.com/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Continue Building
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">Questions? We're here to help you succeed.</p>
      `,
      footerText: 'Building the future of business payments.'
    })

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      subject: 'Ready to Get Back to Business?',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send support ticket confirmation to user
   */
  public async sendSupportTicketConfirmationEmail(
    userEmail: string,
    userName: string,
    ticketDetails: SupportTicketDetails
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'Support Request Received',
      greeting: `Hello ${userName}`,
      content: `
        <p>Your support request has been received. We'll respond within 24 hours.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6c757d; width: 30%;">Ticket:</td><td style="padding: 8px 0; font-weight: 600;">#${ticketDetails.ticketId}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Subject:</td><td style="padding: 8px 0;">${ticketDetails.subject}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Priority:</td><td style="padding: 8px 0;">${ticketDetails.priority}</td></tr>
          </table>
        </div>
        
        <p>You'll receive email updates when we respond.</p>
      `,
      footerText: "We're here to help."
    })

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      subject: 'Support Request Received',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send support reply notification to user
   */
  public async sendSupportReplyNotificationEmail(
    userEmail: string,
    userName: string,
    replyDetails: SupportReplyDetails
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'Support Team Response',
      greeting: `Hello ${userName}`,
      content: `
        <p>Our support team has replied to your ticket.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6c757d; width: 30%;">Ticket:</td><td style="padding: 8px 0; font-weight: 600;">#${replyDetails.ticketId}</td></tr>
            <tr><td style="padding: 8px 0; color: #6c757d;">Subject:</td><td style="padding: 8px 0;">${replyDetails.subject}</td></tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://pxvpay.com/support/tickets/${replyDetails.ticketId}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            View Response
          </a>
        </div>
      `,
      footerText: 'Continue the conversation in support.'
    })

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      subject: `Support Team Reply - #${replyDetails.ticketId}`,
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Send loyalty/thank you email to users
   */
  public async sendLoyaltyThankYouEmail(
    userEmail: string,
    userName: string,
    userRole: string
  ): Promise<boolean> {
    const template = this.generateEmailTemplate({
      title: 'Thank You',
      greeting: `Hello ${userName}`,
      content: `
        <p>Thank you for choosing PXV Pay for your business.</p>
        
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: white; margin: 0; font-size: 16px; line-height: 1.5;">
            <strong>Beyond Boundaries</strong><br/>
            <span style="opacity: 0.9;">Your success drives our innovation.</span>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">What You've Achieved:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #6b7280;">
            <li>Created professional payment experiences</li>
            <li>Maintained complete control over your payments</li>
            <li>Built trust with your customers</li>
            <li>Scaled your business beyond boundaries</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://pxvpay.com/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Continue Growing
          </a>
        </div>
        
        <p>Your feedback helps us serve you better. Let us know how we can improve.</p>
      `,
      footerText: 'Building the future of business payments.'
    })

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      subject: 'Thank You',
      html: template.html,
      text: template.text,
      from: this.getDefaultFrom()
    })
  }

  /**
   * Generate email template with subtle, professional branding
   */
  private generateEmailTemplate(options: {
    title: string
    greeting: string
    content: string
    footerText?: string
  }): EmailTemplate {
    const { title, greeting, content, footerText } = options

    // Simple logo placeholder
    const logoSvg = 'data:image/svg+xml,%3Csvg width="32" height="32" fill="%234f46e5" viewBox="0 0 16 16"%3E%3Cpath d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/%3E%3C/svg%3E'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
        <div style="max-width: 580px; margin: 0 auto; background: white;">
          <!-- Header -->
          <div style="background: white; padding: 24px 24px 20px 24px; border-bottom: 1px solid #e5e7eb;">
            <div style="text-align: center;">
              <img src="${logoSvg}" alt="PXV Pay" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 12px;"/>
              <span style="font-size: 20px; font-weight: 600; color: #1f2937; vertical-align: middle;">PXV Pay</span>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${title}</h2>
            
            <p style="color: #374151; margin: 0 0 16px 0; font-size: 16px;">
              ${greeting},
            </p>
            
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            ${footerText ? `<p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">${footerText}</p>` : ''}
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Questions? Contact us at <a href="mailto:contact@primexvanguard.com" style="color: #4f46e5; text-decoration: none;">contact@primexvanguard.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = this.htmlToText(html, title, greeting, content, footerText)

    return { html, text }
  }

  /**
   * Convert HTML email to plain text version
   */
  private htmlToText(html: string, title: string, greeting: string, content: string, footerText?: string): string {
    // Remove HTML tags and format as plain text
    const plainContent = content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return `
${title}

${greeting},

${plainContent}

${footerText || ''}

Questions? Contact us at contact@primexvanguard.com

PXV Pay - Beyond Boundaries
    `.trim()
  }

  /**
   * Send email via Supabase Edge Function
   */
  private async sendEmail(emailRequest: EmailRequest): Promise<boolean> {
    try {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailRequest
      })

      if (error) {
        console.error('Email sending failed:', error)
        return false
      }

      if (data && data.success) {
        console.log('Email sent successfully')
        return true
      } else {
        console.error('Email sending failed:', data?.error || 'Unknown error')
        return false
      }
    } catch (error) {
      console.error('Email service error:', error)
      return false
    }
  }

  /**
   * Send bulk emails to all users (updated with engagement reminder)
   */
  public async sendBulkEmail(
    emailType: 'loyalty' | 'engagement' | 'announcement',
    customSubject?: string,
    customContent?: string
  ): Promise<{
    sent: number
    failed: number
    errors: string[]
  }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    try {
      // Get all users from Supabase
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      const { data: users, error } = await supabase
        .from('users')
        .select('email, role, created_at')
        .not('email', 'like', '%test%')

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`)
      }

      if (!users || users.length === 0) {
        console.log('No users found for bulk email')
        return results
      }

      console.log(`Sending bulk ${emailType} emails to ${users.length} users`)

      // Send emails in batches
      const batchSize = 3
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (user) => {
          try {
            const userName = user.email.split('@')[0]
            let success = false

            switch (emailType) {
              case 'loyalty':
                success = await this.sendLoyaltyThankYouEmail(user.email, userName, user.role)
                break
              case 'engagement':
                success = await this.sendEngagementReminderEmail(user.email, userName, user.role)
                break
              default:
                success = await this.sendEngagementReminderEmail(user.email, userName, user.role)
            }

            if (success) {
              results.sent++
            } else {
              results.failed++
              results.errors.push(`Failed to send to ${user.email}`)
            }
          } catch (error) {
            results.failed++
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            results.errors.push(`Error sending to ${user.email}: ${errorMessage}`)
            console.error(`Error sending to ${user.email}:`, error)
          }
        })

        await Promise.all(batchPromises)

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      console.log(`Bulk email campaign complete: ${results.sent} sent, ${results.failed} failed`)
      return results

    } catch (error) {
      console.error('Bulk email campaign failed:', error)
      results.errors.push(`Campaign failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return results
    }
  }
}

export const emailService = EmailService.getInstance() 
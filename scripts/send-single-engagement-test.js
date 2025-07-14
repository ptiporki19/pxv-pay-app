#!/usr/bin/env node

/**
 * Send Single Engagement Test Email
 * 
 * This script sends one test engagement reminder email to verify the system works.
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const SUPABASE_URL = 'https://frdksqjaiuakkalebnzd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Generate engagement reminder email template
 */
function generateEngagementEmail(userName) {
  const logoSvg = 'data:image/svg+xml,%3Csvg width="32" height="32" fill="%234f46e5" viewBox="0 0 16 16"%3E%3Cpath d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/%3E%3C/svg%3E'
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ready to Get Back to Business?</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
  <div style="max-width: 580px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: white; padding: 24px 24px 20px 24px; border-bottom: 1px solid #e5e7eb;">
      <div style="text-align: center;">
        <img src="${logoSvg}" alt="PXV Pay" width="32" height="32" style="display: inline-block; vertical-align: middle; margin-right: 12px;"/>
        <span style="font-size: 20px; font-weight: 600; color: #1f2937; vertical-align: middle;">PXV Pay</span>
      </div>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px;">
      <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Ready to Get Back to Business?</h2>
      
      <p style="color: #374151; margin: 0 0 16px 0; font-size: 16px;">
        Hello ${userName},
      </p>
      
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
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Building the future of business payments.</p>
      <p style="color: #9ca3af; margin: 0; font-size: 12px;">
        Questions? Contact us at <a href="mailto:contact@primexvanguard.com" style="color: #4f46e5; text-decoration: none;">contact@primexvanguard.com</a>
      </p>
    </div>
  </div>
</body>
</html>`

  const text = `Ready to Get Back to Business?

Hello ${userName},

Your PXV Pay account is ready when you are.

Beyond Boundaries
Create payment experiences that work exactly how you want them.

What You Can Do:
- Create custom payment links in minutes
- Add your branding and business details
- Accept payments from customers worldwide
- Track and manage all payments in one place

Continue Building: https://pxvpay.com/dashboard

Questions? We're here to help you succeed.

Building the future of business payments.

Questions? Contact us at contact@primexvanguard.com

PXV Pay - Beyond Boundaries`

  return { html, text }
}

/**
 * Send test engagement email
 */
async function sendTestEngagementEmail() {
  console.log('🚀 Sending test engagement reminder email...')
  console.log('📨 New tagline: "Beyond Boundaries"')
  console.log('🎨 Updated branding: Subtle, professional, minimalistic')
  console.log()

  try {
    const testUser = {
      email: 'frankwultof@gmail.com',
      name: 'Frank'
    }

    const template = generateEngagementEmail(testUser.name)
    
    console.log(`📧 Sending to: ${testUser.email}`)
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: [{ email: testUser.email, name: testUser.name }],
        subject: 'Ready to Get Back to Business?',
        html: template.html,
        text: template.text,
        from: {
          email: 'info@primexvanguard.com',
          name: 'PXV Pay'
        }
      }
    })

    if (error) {
      console.error('❌ Email sending failed:', error)
      return false
    }

    if (data && data.success) {
      console.log('✅ Test engagement email sent successfully!')
      console.log('📧 Check your inbox for the new "Beyond Boundaries" branding')
      return true
    } else {
      console.error('❌ Email sending failed:', data?.error || 'Unknown error')
      return false
    }
  } catch (error) {
    console.error('💥 Error sending test email:', error)
    return false
  }
}

// Run the script
if (require.main === module) {
  sendTestEngagementEmail()
    .then((success) => {
      if (success) {
        console.log('\n🎯 Test email sent! Check your inbox.')
      } else {
        console.log('\n❌ Test email failed.')
      }
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
} 
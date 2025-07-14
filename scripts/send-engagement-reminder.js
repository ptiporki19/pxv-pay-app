#!/usr/bin/env node

/**
 * Send Engagement Reminder Emails
 * 
 * This script sends a friendly reminder email to all users encouraging them
 * to continue using PXV Pay with the new "Beyond Boundaries" branding.
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const SUPABASE_URL = 'https://frdksqjaiuakkalebnzd.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1MTg3OCwiZXhwIjoyMDY0ODI3ODc4fQ.DhbQW5aYoEbFpkJKZkZG7VWdI5zK9yEbR8h-1vOJZJk'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'

// Use service role for reading users, anon for sending emails
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Generate engagement reminder email template
 */
function generateEngagementEmail(userName) {
  const logoSvg = 'data:image/svg+xml,%3Csvg width="32" height="32" fill="%234f46e5" viewBox="0 0 16 16"%3E%3Cpath d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/%3E%3C/svg%3E'
  
  const html = `
    <!DOCTYPE html>
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
    </html>
  `

  const text = `
Ready to Get Back to Business?

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

PXV Pay - Beyond Boundaries
  `.trim()

  return { html, text }
}

/**
 * Send email via Supabase Edge Function
 */
async function sendEmail(to, subject, html, text) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: [{ email: to.email, name: to.name }],
        subject: subject,
        html: html,
        text: text,
        from: {
          email: 'info@primexvanguard.com',
          name: 'PXV Pay'
        }
      }
    })

    if (error) {
      console.error(`❌ Email failed for ${to.email}:`, error)
      return false
    }

    if (data && data.success) {
      console.log(`✅ Email sent to ${to.email}`)
      return true
    } else {
      console.error(`❌ Email failed for ${to.email}:`, data?.error || 'Unknown error')
      return false
    }
  } catch (error) {
    console.error(`❌ Email error for ${to.email}:`, error)
    return false
  }
}

/**
 * Main function to send engagement reminders to all users
 */
async function sendEngagementReminders() {
  console.log('🚀 Starting engagement reminder campaign...')
  console.log('📨 New tagline: "Beyond Boundaries"')
  console.log('🎨 Updated branding: Subtle, professional, minimalistic')
  console.log()

  const results = {
    sent: 0,
    failed: 0,
    errors: []
  }

  try {
    // Get all users from Supabase (including test users for demo)
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('email, role, created_at')

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found for engagement reminder campaign')
      return results
    }

    console.log(`📬 Sending engagement reminders to ${users.length} users`)
    console.log()

    // Send emails in batches of 3 to avoid rate limits
    const batchSize = 3
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (user) => {
        try {
          const userName = user.email.split('@')[0]
          const template = generateEngagementEmail(userName)
          
          const success = await sendEmail(
            { email: user.email, name: userName },
            'Ready to Get Back to Business?',
            template.html,
            template.text
          )

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
          console.error(`❌ Error sending to ${user.email}:`, error)
        }
      })

      await Promise.all(batchPromises)

      // Small delay between batches
      if (i + batchSize < users.length) {
        console.log(`⏳ Batch ${Math.floor(i / batchSize) + 1} complete, waiting 2 seconds...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log()
    console.log('🎉 Engagement reminder campaign complete!')
    console.log(`✅ Successfully sent: ${results.sent}`)
    console.log(`❌ Failed: ${results.failed}`)
    
    if (results.errors.length > 0) {
      console.log('\n🔍 Errors:')
      results.errors.forEach(error => console.log(`   - ${error}`))
    }

    return results

  } catch (error) {
    console.error('💥 Campaign failed:', error)
    results.errors.push(`Campaign failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return results
  }
}

// Run the script
if (require.main === module) {
  sendEngagementReminders()
    .then(() => {
      console.log('\n🎯 Campaign finished!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
} 
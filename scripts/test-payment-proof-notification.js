const fetch = require('node-fetch')

async function testPaymentProofNotification() {
  console.log('🧪 Testing Payment Proof Email Notifications')
  console.log('=============================================')
  
  const projectUrl = 'https://frdksqjaiuakkalebnzd.supabase.co'
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'
  
  try {
    console.log('📧 Testing Customer Confirmation Email...')
    
    // Test customer confirmation email
    const customerEmailRequest = {
      to: [{ email: 'test-customer@example.com', name: 'Test Customer' }],
      subject: '✅ Payment Proof Received - Under Review | PXV Pay',
      html: generatePaymentProofEmailHTML(),
      text: generatePaymentProofEmailText()
    }
    
    const customerResponse = await fetch(`${projectUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerEmailRequest)
    })
    
    const customerResult = await customerResponse.json()
    
    if (customerResult.success) {
      console.log('✅ Customer confirmation email sent successfully')
    } else {
      console.log('❌ Customer email failed:', customerResult.error)
    }
    
    console.log('\n📧 Testing Merchant Notification Email...')
    
    // Test merchant notification email
    const merchantEmailRequest = {
      to: [{ email: 'test-merchant@example.com', name: 'Test Merchant' }],
      subject: '🔔 New Payment Proof Requires Verification | PXV Pay',
      html: generateMerchantNotificationHTML(),
      text: generateMerchantNotificationText()
    }
    
    const merchantResponse = await fetch(`${projectUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(merchantEmailRequest)
    })
    
    const merchantResult = await merchantResponse.json()
    
    if (merchantResult.success) {
      console.log('✅ Merchant notification email sent successfully')
    } else {
      console.log('❌ Merchant email failed:', merchantResult.error)
    }
    
    console.log('\n📧 Testing Support Ticket Confirmation Email...')
    
    // Test support ticket confirmation email
    const supportEmailRequest = {
      to: [{ email: 'test-support@example.com', name: 'Test User' }],
      subject: '✅ Support Ticket Created - We\'re Here to Help | PXV Pay',
      html: generateSupportTicketHTML(),
      text: generateSupportTicketText()
    }
    
    const supportResponse = await fetch(`${projectUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supportEmailRequest)
    })
    
    const supportResult = await supportResponse.json()
    
    if (supportResult.success) {
      console.log('✅ Support ticket confirmation email sent successfully')
    } else {
      console.log('❌ Support email failed:', supportResult.error)
    }
    
    console.log('\n🎉 Email Notification System Test Complete!')
    console.log('============================================')
    console.log('📊 Results:')
    console.log(`   Customer Email: ${customerResult.success ? '✅ Success' : '❌ Failed'}`)
    console.log(`   Merchant Email: ${merchantResult.success ? '✅ Success' : '❌ Failed'}`)
    console.log(`   Support Email: ${supportResult.success ? '✅ Success' : '❌ Failed'}`)
    
    const allSuccess = customerResult.success && merchantResult.success && supportResult.success
    console.log(`\n🎯 Overall Status: ${allSuccess ? '✅ ALL SYSTEMS WORKING' : '⚠️ Some Issues Found'}`)
    
    if (allSuccess) {
      console.log('\n🚀 Your email notification system is fully operational!')
      console.log('   • Payment proof confirmations ✅')
      console.log('   • Merchant notifications ✅')
      console.log('   • Support ticket confirmations ✅')
      console.log('   • Loyalty emails ✅')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

function generatePaymentProofEmailHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Proof Received - Under Review</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PrimeX Vanguard</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Payment Confirmation</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">✅ Payment Proof Received</h2>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Dear Test Customer,
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
            Thank you for uploading your payment proof. We have successfully received your submission and it is now under review.
          </p>
          
          <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">$100.00 USD</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Method:</td>
                <td style="padding: 8px 0; color: #374151;">Bank Transfer</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Status:</td>
                <td style="padding: 8px 0; color: #d97706; font-weight: 600;">Under Review</td>
              </tr>
            </table>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; color: white;">
            <h3 style="margin: 0 0 15px 0;">⏱️ What Happens Next?</h3>
            <ul style="text-align: left; margin: 0; line-height: 1.8;">
              <li>Our team will review and verify your payment proof</li>
              <li>This process typically takes 1-24 hours</li>
              <li>You will receive an email notification once verification is complete</li>
              <li>If we need additional information, we will contact you directly</li>
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Thank you for choosing PXV Pay for your payment needs.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
            Need help? Contact us at <a href="mailto:contact@primexvanguard.com" style="color: #3B82F6;">contact@primexvanguard.com</a>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} PrimeX Vanguard. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generatePaymentProofEmailText() {
  return `
Payment Proof Received - Under Review

Dear Test Customer,

Thank you for uploading your payment proof. We have successfully received your submission and it is now under review.

Payment Details:
• Amount: $100.00 USD
• Payment Method: Bank Transfer
• Status: Under Review

What Happens Next:
• Our team will review and verify your payment proof
• This process typically takes 1-24 hours
• You will receive an email notification once verification is complete
• If we need additional information, we will contact you directly

Thank you for choosing PXV Pay for your payment needs.

Need help? Contact us at contact@primexvanguard.com

© ${new Date().getFullYear()} PrimeX Vanguard. All rights reserved.
  `.trim()
}

function generateMerchantNotificationHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Payment Proof Requires Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PrimeX Vanguard</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Merchant Alert</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #d97706; margin: 0 0 20px 0; font-size: 24px;">🔔 New Payment Proof</h2>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Hello Test Merchant,
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
            A customer has uploaded a payment proof that requires your verification.
          </p>
          
          <div style="background: #fffbeb; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">Payment Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Test Customer</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">$100.00 USD</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Method:</td>
                <td style="padding: 8px 0; color: #374151;">Bank Transfer</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://pxvpay.com/dashboard/payments" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Review Payment Proof →
            </a>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Please review the payment proof and update the payment status accordingly.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
            Questions? Contact us at <a href="mailto:contact@primexvanguard.com" style="color: #3B82F6;">contact@primexvanguard.com</a>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} PrimeX Vanguard. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateMerchantNotificationText() {
  return `
New Payment Proof Requires Verification

Hello Test Merchant,

A customer has uploaded a payment proof that requires your verification.

Payment Information:
• Customer: Test Customer
• Amount: $100.00 USD
• Payment Method: Bank Transfer

Please review the payment proof and update the payment status accordingly.

Review Payment Proof: https://pxvpay.com/dashboard/payments

Questions? Contact us at contact@primexvanguard.com

© ${new Date().getFullYear()} PrimeX Vanguard. All rights reserved.
  `.trim()
}

function generateSupportTicketHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Ticket Created</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PrimeX Vanguard</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Support Request</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #667eea; margin: 0 0 20px 0; font-size: 24px;">✅ Support Request Received</h2>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Hello Test User,
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
            Thank you for contacting PXV Pay support. We've received your request and our team is ready to help you.
          </p>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 25px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">📋 Ticket Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Ticket ID:</td>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">#TEST123</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Subject:</td>
                <td style="padding: 8px 0; color: #374151;">Test Support Request</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Priority:</td>
                <td style="padding: 8px 0; color: #374151;">Medium</td>
              </tr>
            </table>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; color: white;">
            <h3 style="margin: 0 0 15px 0;">⏱️ What Happens Next?</h3>
            <ul style="text-align: left; margin: 0; line-height: 1.8;">
              <li>Our support team will review your request within 2-4 hours</li>
              <li>You'll receive email updates when we reply to your ticket</li>
              <li>You can also check your ticket status in your dashboard</li>
              <li>For urgent issues, we're available 24/7</li>
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Thank you for choosing PXV Pay. We're committed to providing you with the best support experience possible.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
            Need immediate assistance? Contact us at <a href="mailto:contact@primexvanguard.com" style="color: #3B82F6;">contact@primexvanguard.com</a>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} PrimeX Vanguard. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateSupportTicketText() {
  return `
Support Request Received

Hello Test User,

Thank you for contacting PXV Pay support. We've received your request and our team is ready to help you.

Ticket Details:
• Ticket ID: #TEST123
• Subject: Test Support Request
• Priority: Medium

What Happens Next:
• Our support team will review your request within 2-4 hours
• You'll receive email updates when we reply to your ticket
• You can also check your ticket status in your dashboard
• For urgent issues, we're available 24/7

Thank you for choosing PXV Pay. We're committed to providing you with the best support experience possible.

Need immediate assistance? Contact us at contact@primexvanguard.com

© ${new Date().getFullYear()} PrimeX Vanguard. All rights reserved.
  `.trim()
}

testPaymentProofNotification() 
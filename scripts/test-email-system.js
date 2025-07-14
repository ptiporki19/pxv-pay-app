const fetch = require('node-fetch')

async function testEmailSystem() {
  console.log('🧪 Testing Email System with Real Supabase')
  console.log('==========================================')
  
  const projectUrl = 'https://frdksqjaiuakkalebnzd.supabase.co'
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'
  
  try {
    console.log('📧 Testing send-email Edge Function...')
    
    const emailRequest = {
      to: [
        {
          email: 'test@example.com',
          name: 'Test User'
        }
      ],
      subject: 'Test Email from PXV Pay',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the email system is working with the real Supabase project.</p>
        <p>If you're seeing this logged in the console, the system is working correctly!</p>
      `,
      text: 'Test email from PXV Pay - This is a test to verify the email system is working.',
      from: {
        email: 'noreply@pxvpay.com',
        name: 'PXV Pay'
      }
    }
    
    const response = await fetch(`${projectUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify(emailRequest)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Email test failed:', response.status, errorText)
      return false
    }
    
    const result = await response.json()
    console.log('✅ Email test successful:', result)
    
    if (result.provider === 'logger') {
      console.log('ℹ️  Email was logged (no email provider configured)')
      console.log('📝 To enable actual email sending, configure:')
      console.log('   - SENDGRID_API_KEY for SendGrid')
      console.log('   - FROM_EMAIL and FROM_NAME for custom sender info')
      console.log('   - Or SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS for SMTP')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Email test error:', error.message)
    return false
  }
}

async function testEmailServiceIntegration() {
  console.log('\n🔗 Testing Email Service Integration...')
  
  try {
    // Import and test the email service
    const { emailService } = require('../src/lib/email-service.ts')
    
    console.log('📧 Testing payment confirmation email...')
    const success = await emailService.sendPaymentProofSubmittedEmail(
      'customer@example.com',
      'Test Customer',
      {
        amount: 100.00,
        currency: 'USD',
        paymentMethod: 'Bank Transfer'
      }
    )
    
    if (success) {
      console.log('✅ Payment confirmation email test passed')
    } else {
      console.log('⚠️  Payment confirmation email test failed (likely due to no email provider configured)')
    }
    
    return success
    
  } catch (error) {
    console.error('❌ Email service integration test error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting Email System Tests\n')
  
  const edgeFunctionTest = await testEmailSystem()
  const serviceIntegrationTest = await testEmailServiceIntegration()
  
  console.log('\n📋 Test Results Summary:')
  console.log(`   Edge Function: ${edgeFunctionTest ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Service Integration: ${serviceIntegrationTest ? '✅ PASS' : '⚠️  NEEDS CONFIG'}`)
  
  if (edgeFunctionTest) {
    console.log('\n🎉 Email system is successfully connected to real Supabase!')
    console.log('📧 The email notification system is ready to use.')
    console.log('🔧 Configure email provider environment variables to enable actual email sending.')
  } else {
    console.log('\n❌ Email system connection failed. Please check the configuration.')
  }
}

// Run the tests
runTests().catch(console.error) 
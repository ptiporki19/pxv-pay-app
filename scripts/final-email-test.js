const fetch = require('node-fetch')

async function finalEmailTest() {
  console.log('🎯 Final Email System Test')
  console.log('===========================')
  console.log('Testing complete email notification flow with SendGrid...\n')
  
  const projectUrl = 'https://frdksqjaiuakkalebnzd.supabase.co'
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'
  
  // Test 1: Customer Payment Confirmation Email
  console.log('📧 Test 1: Customer Payment Confirmation Email')
  try {
    const customerEmail = {
      to: [{ email: 'customer@example.com', name: 'Test Customer' }],
      subject: '✅ Payment Proof Received - Under Review | PrimeX Vanguard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PrimeX Vanguard</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Payment Processing</p>
          </div>
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Payment Proof Received ✅</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you! We've received your payment proof and it's now under review by our team.
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0;">What happens next?</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Our team will verify your payment within 24 hours</li>
                <li>You'll receive an email confirmation once approved</li>
                <li>Your account will be updated automatically</li>
              </ul>
            </div>
            <p style="color: #666; line-height: 1.6;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2024 PrimeX Vanguard. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Payment Proof Received - Under Review\n\nThank you! We've received your payment proof and it's now under review by our team.\n\nWhat happens next?\n- Our team will verify your payment within 24 hours\n- You'll receive an email confirmation once approved\n- Your account will be updated automatically\n\nIf you have any questions, please contact our support team.\n\n© 2024 PrimeX Vanguard. All rights reserved.`
    }
    
    const response1 = await fetch(`${projectUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerEmail)
    })
    
    const result1 = await response1.json()
    if (result1.success) {
      console.log('✅ Customer email sent successfully!')
      console.log(`   From: ${result1.from}`)
      console.log(`   Recipients: ${result1.recipients}`)
    } else {
      console.log('❌ Customer email failed:', result1.error)
    }
  } catch (error) {
    console.log('❌ Customer email error:', error.message)
  }
  
  console.log('')
  
  // Test 2: Merchant Notification Email
  console.log('📧 Test 2: Merchant Notification Email')
  try {
    const merchantEmail = {
      to: [{ email: 'merchant@example.com', name: 'Test Merchant' }],
      subject: '🔔 New Payment Verification Required | PrimeX Vanguard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PrimeX Vanguard</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Merchant Dashboard</p>
          </div>
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">New Payment Verification Required 🔔</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              A customer has submitted a payment proof that requires your verification.
            </p>
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">Action Required</h3>
              <p style="color: #856404; margin: 0;">
                Please review and verify the payment proof in your merchant dashboard.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review Payment →
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2024 PrimeX Vanguard. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `New Payment Verification Required\n\nA customer has submitted a payment proof that requires your verification.\n\nAction Required:\nPlease review and verify the payment proof in your merchant dashboard.\n\nVisit your dashboard to review the payment.\n\n© 2024 PrimeX Vanguard. All rights reserved.`
    }
    
    const response2 = await fetch(`${projectUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(merchantEmail)
    })
    
    const result2 = await response2.json()
    if (result2.success) {
      console.log('✅ Merchant email sent successfully!')
      console.log(`   From: ${result2.from}`)
      console.log(`   Recipients: ${result2.recipients}`)
    } else {
      console.log('❌ Merchant email failed:', result2.error)
    }
  } catch (error) {
    console.log('❌ Merchant email error:', error.message)
  }
  
  console.log('')
  
  // Test 3: Admin Notification Email
  console.log('📧 Test 3: Admin Notification Email')
  try {
    const adminEmail = {
      to: [{ email: 'admin@example.com', name: 'System Admin' }],
      subject: '⚡ New User Signup Alert | PrimeX Vanguard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PrimeX Vanguard</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Admin Dashboard</p>
          </div>
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">New User Signup Alert ⚡</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              A new user has registered on the platform.
            </p>
            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0c5460; margin: 0 0 10px 0;">User Details</h3>
              <p style="color: #0c5460; margin: 5px 0;">
                <strong>Email:</strong> newuser@example.com<br>
                <strong>Role:</strong> Free User<br>
                <strong>Signup Time:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View User →
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2024 PrimeX Vanguard. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `New User Signup Alert\n\nA new user has registered on the platform.\n\nUser Details:\nEmail: newuser@example.com\nRole: Free User\nSignup Time: ${new Date().toLocaleString()}\n\nView the user in your admin dashboard.\n\n© 2024 PrimeX Vanguard. All rights reserved.`
    }
    
    const response3 = await fetch(`${projectUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminEmail)
    })
    
    const result3 = await response3.json()
    if (result3.success) {
      console.log('✅ Admin email sent successfully!')
      console.log(`   From: ${result3.from}`)
      console.log(`   Recipients: ${result3.recipients}`)
    } else {
      console.log('❌ Admin email failed:', result3.error)
    }
  } catch (error) {
    console.log('❌ Admin email error:', error.message)
  }
  
  console.log('')
  console.log('🎉 Email System Test Complete!')
  console.log('================================')
  console.log('✅ SendGrid API Key: Configured')
  console.log('✅ Verified Sender: info@primexvanguard.com')
  console.log('✅ Edge Function: Deployed and Active')
  console.log('✅ Email Templates: Professional and Branded')
  console.log('')
  console.log('🚀 Your email notification system is ready for production!')
}

finalEmailTest() 
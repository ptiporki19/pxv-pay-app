const fetch = require('node-fetch')

async function sendBulkLoyaltyEmails() {
  console.log('🎯 Starting Bulk Loyalty Email Campaign')
  console.log('=====================================')
  
  const projectUrl = 'https://frdksqjaiuakkalebnzd.supabase.co'
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'
  
  try {
    // Get all users from the database
    console.log('📋 Fetching all users from database...')
    
    const usersResponse = await fetch(`${projectUrl}/rest/v1/users?select=email,role,created_at`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Content-Type': 'application/json',
      }
    })
    
    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.statusText}`)
    }
    
    const users = await usersResponse.json()
    console.log(`✅ Found ${users.length} users in database`)
    
    // Filter out test users and prepare user list
    const realUsers = users.filter(user => 
      !user.email.includes('test@example.com') && 
      !user.email.includes('admin-user-test') &&
      !user.email.includes('existing-user-test') &&
      !user.email.includes('regular-user-test') &&
      !user.email.includes('complete-test') &&
      !user.email.includes('production-test') &&
      !user.email.includes('checkout-form-test')
    )
    
    console.log(`📧 Sending loyalty emails to ${realUsers.length} real users (filtered out ${users.length - realUsers.length} test accounts)`)
    
    if (realUsers.length === 0) {
      console.log('⚠️  No real users found to send emails to.')
      return
    }
    
    // Show preview of users who will receive emails
    console.log('\n👥 Users who will receive emails:')
    realUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - joined ${new Date(user.created_at).toLocaleDateString()}`)
    })
    
    console.log('\n📧 Starting email sending process...')
    
    let successCount = 0
    let failedCount = 0
    const errors = []
    
    // Send emails in batches of 3 to avoid overwhelming SendGrid
    const batchSize = 3
    for (let i = 0; i < realUsers.length; i += batchSize) {
      const batch = realUsers.slice(i, i + batchSize)
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(realUsers.length/batchSize)} (${batch.length} users)`)
      
      const batchPromises = batch.map(async (user, batchIndex) => {
        try {
          // Extract name from email (before @)
          const userName = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
          const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)
          
          console.log(`   📧 Sending to ${user.email}...`)
          
          const emailRequest = {
            to: [{ email: user.email, name: displayName }],
            subject: '🙏 Thank You for Being Part of the PXV Pay Journey',
            html: generateLoyaltyEmailHTML(displayName, user.role),
            text: generateLoyaltyEmailText(displayName, user.role)
          }
          
          const response = await fetch(`${projectUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailRequest)
          })
          
          const result = await response.json()
          
          if (result.success) {
            successCount++
            console.log(`   ✅ Success: ${user.email}`)
          } else {
            failedCount++
            errors.push(`${user.email}: ${result.error || 'Unknown error'}`)
            console.log(`   ❌ Failed: ${user.email} - ${result.error || 'Unknown error'}`)
          }
        } catch (error) {
          failedCount++
          errors.push(`${user.email}: ${error.message}`)
          console.log(`   ❌ Error: ${user.email} - ${error.message}`)
        }
      })
      
      await Promise.all(batchPromises)
      
      // Small delay between batches
      if (i + batchSize < realUsers.length) {
        console.log('   ⏳ Waiting 2 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log('\n🎉 Bulk Email Campaign Complete!')
    console.log('=================================')
    console.log(`📊 Results Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${failedCount}`)
    console.log(`   📧 Total Attempted: ${realUsers.length}`)
    console.log(`   📈 Success Rate: ${((successCount / realUsers.length) * 100).toFixed(1)}%`)
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:')
      errors.forEach(error => console.log(`   • ${error}`))
    }
    
    console.log('\n🎯 Campaign completed successfully!')
    
  } catch (error) {
    console.error('❌ Campaign failed:', error.message)
  }
}

function generateLoyaltyEmailHTML(userName, userRole) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Being Part of the PXV Pay Journey</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PrimeX Vanguard</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Global Payment Solutions</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Thank You for Your Trust 🙏</h2>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Dear ${userName},
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
            As we continue to grow and evolve PXV Pay, we wanted to take a moment to express our heartfelt gratitude for your trust and support.
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">What PXV Pay Means to Us</h3>
            <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px; line-height: 1.6;">
              We're not just a payment platform – we're your partner in making global payments accessible, secure, and simple for everyone, everywhere.
            </p>
          </div>

          <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 18px;">🌍 What We've Built Together</h3>
          <ul style="color: #374151; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
            <li><strong>300+ Payment Methods</strong> across 180+ countries</li>
            <li><strong>Secure Payment Links</strong> that work with local payment systems</li>
            <li><strong>Real-time Payment Verification</strong> for instant peace of mind</li>
            <li><strong>Bank-grade Security</strong> protecting every transaction</li>
            <li><strong>24/7 Support</strong> whenever you need assistance</li>
          </ul>

          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 25px 0;">
            <h4 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">💡 Your Role Matters</h4>
            <p style="color: #374151; margin: 0; line-height: 1.6;">
              ${userRole === 'super_admin' ? 
                'As a super admin, you help shape the platform and ensure everything runs smoothly for our community.' :
                userRole === 'subscriber' ?
                'As a subscriber, you unlock advanced features and help us build better tools for global payments.' :
                'As a valued user, you\'re part of a community that\'s revolutionizing how payments work worldwide.'
              }
            </p>
          </div>

          <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 18px;">🚀 What's Coming Next</h3>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0;">
            We're constantly working to improve your experience:
          </p>
          <ul style="color: #374151; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
            <li>Enhanced payment verification with AI-powered fraud detection</li>
            <li>New payment methods in emerging markets</li>
            <li>Advanced analytics and reporting tools</li>
            <li>Mobile app for on-the-go payment management</li>
            <li>Integration with popular e-commerce platforms</li>
          </ul>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h4 style="color: white; margin: 0 0 15px 0;">💬 We Want to Hear From You</h4>
            <p style="color: rgba(255,255,255,0.95); margin: 0 0 20px 0; line-height: 1.6;">
              Your feedback drives our innovation. What features would make PXV Pay even better for you?
            </p>
            <a href="https://pxvpay.com/support" 
               style="display: inline-block; background: white; color: #059669; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Share Your Feedback →
            </a>
          </div>

          <p style="color: #374151; line-height: 1.6; margin: 25px 0 0 0;">
            Thank you for being part of the PXV Pay family. Together, we're making global payments accessible to everyone.
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin: 15px 0 0 0;">
            <strong>Warm regards,</strong><br>
            The PrimeX Vanguard Team
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://pxvpay.com/dashboard" 
               style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Access Your Dashboard →
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
            Questions? Reply to this email or contact us at 
            <a href="mailto:contact@primexvanguard.com" style="color: #3B82F6;">contact@primexvanguard.com</a>
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

function generateLoyaltyEmailText(userName, userRole) {
  return `
Thank You for Being Part of the PXV Pay Journey

Dear ${userName},

As we continue to grow and evolve PXV Pay, we wanted to take a moment to express our heartfelt gratitude for your trust and support.

What PXV Pay Means to Us:
We're not just a payment platform – we're your partner in making global payments accessible, secure, and simple for everyone, everywhere.

What We've Built Together:
• 300+ Payment Methods across 180+ countries
• Secure Payment Links that work with local payment systems
• Real-time Payment Verification for instant peace of mind
• Bank-grade Security protecting every transaction
• 24/7 Support whenever you need assistance

Your Role Matters:
${userRole === 'super_admin' ? 
  'As a super admin, you help shape the platform and ensure everything runs smoothly for our community.' :
  userRole === 'subscriber' ?
  'As a subscriber, you unlock advanced features and help us build better tools for global payments.' :
  'As a valued user, you\'re part of a community that\'s revolutionizing how payments work worldwide.'
}

What's Coming Next:
We're constantly working to improve your experience:
• Enhanced payment verification with AI-powered fraud detection
• New payment methods in emerging markets
• Advanced analytics and reporting tools
• Mobile app for on-the-go payment management
• Integration with popular e-commerce platforms

We Want to Hear From You:
Your feedback drives our innovation. What features would make PXV Pay even better for you?

Visit: https://pxvpay.com/support

Thank you for being part of the PXV Pay family. Together, we're making global payments accessible to everyone.

Warm regards,
The PrimeX Vanguard Team

Access Your Dashboard: https://pxvpay.com/dashboard

Questions? Reply to this email or contact us at contact@primexvanguard.com

© ${new Date().getFullYear()} PrimeX Vanguard. All rights reserved.
  `.trim()
}

sendBulkLoyaltyEmails() 
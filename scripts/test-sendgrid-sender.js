const fetch = require('node-fetch')

async function testSendGridSenders() {
  console.log('🔍 Testing SendGrid Sender Verification')
  console.log('=====================================')
  
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
  
  if (!SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY environment variable is required')
    process.exit(1)
  }
  
  try {
    // Get verified senders from SendGrid
    console.log('📋 Fetching verified senders from SendGrid...')
    
    const response = await fetch('https://api.sendgrid.com/v3/verified_senders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to fetch verified senders:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✅ Verified senders found:')
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((sender, index) => {
        console.log(`\n📧 Sender ${index + 1}:`)
        console.log(`   Email: ${sender.from_email}`)
        console.log(`   Name: ${sender.from_name}`)
        console.log(`   Verified: ${sender.verified ? '✅' : '❌'}`)
        console.log(`   ID: ${sender.id}`)
      })
      
      // Show the first verified sender as recommended
      const verifiedSender = data.results.find(s => s.verified)
      if (verifiedSender) {
        console.log(`\n🎯 Recommended configuration:`)
        console.log(`   FROM_EMAIL: ${verifiedSender.from_email}`)
        console.log(`   FROM_NAME: ${verifiedSender.from_name}`)
      }
    } else {
      console.log('⚠️  No verified senders found. Please verify a sender in SendGrid first.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testSendGridSenders() 
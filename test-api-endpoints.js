console.log('🧪 Testing new API endpoints...')

async function testAPIEndpoints() {
  try {
    // Dynamic import for node-fetch
    const fetch = (await import('node-fetch')).default

    console.log('\n1️⃣ Testing users list API...')
    
    const usersResponse = await fetch('http://localhost:3000/api/users/list')
    if (usersResponse.ok) {
      const usersData = await usersResponse.json()
      console.log('✅ Users API working:', usersData)
    } else {
      console.error('❌ Users API failed:', usersResponse.status)
    }

    console.log('\n2️⃣ Testing dashboard stats API...')
    
    const statsResponse = await fetch('http://localhost:3000/api/dashboard/stats')
    if (statsResponse.ok) {
      const statsData = await statsResponse.json()
      console.log('✅ Dashboard stats API working:', statsData)
    } else {
      console.error('❌ Dashboard stats API failed:', statsResponse.status)
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Wait a bit for the server to start
setTimeout(() => {
  testAPIEndpoints().then(() => {
    console.log('\n✅ API endpoint tests completed!')
    process.exit(0)
  })
}, 5000) 
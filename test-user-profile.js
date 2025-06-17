const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testUserProfile() {
  console.log('🧪 Testing User Profile Fetch...')
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    // First, fetch all users to see what we have
    console.log('📋 Fetching all users...')
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    console.log(`✅ Found ${allUsers.length} users:`)
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id} | Email: ${user.email} | Role: ${user.role}`)
    })
    
    if (allUsers.length === 0) {
      console.log('⚠️ No users found in database!')
      return
    }
    
    // Test fetching a specific user profile
    const testUserId = allUsers[0].id
    console.log(`\n🔍 Testing user profile fetch for ID: ${testUserId}`)
    
    // Test the same query that the component uses
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (userError) {
      console.error('❌ User fetch error:', userError)
      return
    }
    
    if (!userData) {
      console.error('❌ No user data returned')
      return
    }
    
    console.log('✅ User profile fetch successful!')
    console.log('User data:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      active: userData.active,
      created_at: userData.created_at
    })
    
    // Test payments fetch
    console.log('\n💳 Testing payments fetch...')
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', testUserId)
      .limit(3)
    
    console.log(`Payments for user ${testUserId}:`, payments?.length || 0, 'found')
    if (paymentsError) {
      console.log('Payments error:', paymentsError)
    }
    
    // Test merchant payments
    const { data: merchantPayments, error: merchantError } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', testUserId)
      .limit(3)
    
    console.log(`Merchant payments for user ${testUserId}:`, merchantPayments?.length || 0, 'found')
    if (merchantError) {
      console.log('Merchant payments error:', merchantError)
    }
    
    console.log('\n✅ User profile test completed successfully!')
    
  } catch (error) {
    console.error('💥 Test failed with exception:', error)
  }
}

testUserProfile() 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
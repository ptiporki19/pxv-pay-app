const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

async function testCheckoutCreation() {
  console.log('🧪 Testing Checkout Link Creation...\n')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // 1. Sign in as admin
    console.log('1. Signing in as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (authError) {
      console.log(`❌ Auth failed: ${authError.message || JSON.stringify(authError)}`)
      console.log('Full error:', authError)
      return
    }
    
    console.log(`✅ Signed in as: ${authData.user.email}`)
    
    // 2. Get user details
    const { data: { user } } = await supabase.auth.getUser()
    console.log(`✅ User ID: ${user.id}`)
    
    // 3. Check user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      console.log(`❌ User lookup failed: ${userError.message}`)
      return
    }
    
    console.log(`✅ User role: ${userData.role}`)
    
    // 4. Get available countries
    console.log('\n2. Getting available countries...')
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select(`
        *,
        currency:currency_id(
          id,
          name,
          code,
          symbol
        )
      `)
      .eq('status', 'active')
      .order('name')
    
    if (countriesError) {
      console.log(`❌ Countries fetch failed: ${countriesError.message}`)
      return
    }
    
    console.log(`✅ Found ${countries.length} countries`)
    
    // 5. Create test checkout link
    console.log('\n3. Creating test checkout link...')
    const testSlug = `test-checkout-${Date.now()}`
    const selectedCountry = countries.find(c => c.code === 'US')
    
    if (!selectedCountry?.currency) {
      console.log('❌ US country not found or missing currency')
      return
    }
    
    const checkoutLinkData = {
      merchant_id: user.id,
      slug: testSlug,
      title: 'Test Product Purchase',
      link_name: 'test-product',
      amount_type: 'fixed',
      amount: 99.99,
      min_amount: null,
      max_amount: null,
      currency: selectedCountry.currency.code,
      status: 'draft',
      active_country_codes: ['US', 'CA'],
      is_active: false,
      checkout_page_heading: 'Complete Your Purchase',
      payment_review_message: 'Thank you for your payment. We will review and confirm within 24 hours.',
    }
    
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .insert(checkoutLinkData)
      .select()
      .single()
    
    if (linkError) {
      console.log(`❌ Checkout link creation failed: ${linkError.message}`)
      console.log('Error details:', linkError)
      return
    }
    
    console.log(`✅ Checkout link created successfully!`)
    console.log(`   - ID: ${checkoutLink.id}`)
    console.log(`   - Slug: ${checkoutLink.slug}`)
    console.log(`   - Title: ${checkoutLink.title}`)
    console.log(`   - Amount: ${checkoutLink.currency} ${checkoutLink.amount}`)
    console.log(`   - Status: ${checkoutLink.status}`)
    
    // 6. Verify we can read it back
    console.log('\n4. Verifying checkout link can be read...')
    const { data: readLink, error: readError } = await supabase
      .from('checkout_links')
      .select('*')
      .eq('id', checkoutLink.id)
      .single()
    
    if (readError) {
      console.log(`❌ Read verification failed: ${readError.message}`)
    } else {
      console.log(`✅ Checkout link read successfully: ${readLink.title}`)
    }
    
    // 7. Clean up test link
    console.log('\n5. Cleaning up test link...')
    const { error: deleteError } = await supabase
      .from('checkout_links')
      .delete()
      .eq('id', checkoutLink.id)
    
    if (deleteError) {
      console.log(`⚠️  Cleanup failed: ${deleteError.message}`)
    } else {
      console.log(`✅ Test link cleaned up`)
    }
    
    console.log('\n🎉 Checkout link creation test completed successfully!')
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`)
    console.error(error)
  }
}

testCheckoutCreation() 
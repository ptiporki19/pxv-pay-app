const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testProductCheckout() {
  console.log('🔍 Looking for checkout links with product templates...')
  
  // Check for existing checkout links with product templates
  const { data: existingCheckouts, error: checkError } = await supabase
    .from('checkout_links')
    .select('id, slug, title, product_template_id')
    .not('product_template_id', 'is', null)
    .eq('is_active', true)
    .limit(1)
  
  if (checkError) {
    console.error('Error:', checkError)
    return
  }
  
  let testSlug = null
  
  if (existingCheckouts && existingCheckouts.length > 0) {
    console.log(`✅ Found existing checkout with product template: ${existingCheckouts[0].slug}`)
    testSlug = existingCheckouts[0].slug
  } else {
    console.log('📦 No checkout links with product templates found. Creating one...')
    
    // Get a product template
    const { data: products, error: productError } = await supabase
      .from('product_templates')
      .select('id, name, description, featured_image')
      .eq('is_active', true)
      .limit(1)
    
    if (productError || !products || products.length === 0) {
      console.log('❌ No product templates found. Please create a product first.')
      return
    }
    
    const product = products[0]
    console.log(`📋 Using product template: ${product.name}`)
    
    // Create a test checkout link with product template
    const checkoutData = {
      merchant_id: '00000000-0000-0000-0000-000000000001',
      slug: `test-product-${Date.now()}`,
      title: `Test ${product.name} Checkout`,
      link_name: `test-${Date.now()}`,
      checkout_type: 'product',
      product_template_id: product.id,
      custom_price: 49.99,
      currency: 'USD',
      active_country_codes: ['US'],
      status: 'active',
      is_active: true
    }
    
    const { data: newCheckout, error: createError } = await supabase
      .from('checkout_links')
      .insert(checkoutData)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Error creating checkout:', createError)
      return
    }
    
    console.log(`✅ Created test checkout: /${newCheckout.slug}`)
    testSlug = newCheckout.slug
  }
  
  if (testSlug) {
    console.log(`\n🌐 Test the checkout at: http://localhost:3000/c/${testSlug}`)
    console.log(`🔧 API validation URL: http://localhost:3000/api/checkout/${testSlug}/validate`)
    
    // Quick API test
    try {
      const response = await fetch(`http://localhost:3000/api/checkout/${testSlug}/validate`)
      const data = await response.json()
      
      if (data.valid && data.checkout_link.product_name) {
        console.log(`✅ Product name properly populated: ${data.checkout_link.product_name}`)
        console.log(`✅ Product description: ${data.checkout_link.product_description ? 'Set' : 'Not set'}`)
        console.log(`✅ Product image: ${data.checkout_link.product_image_url ? 'Set' : 'Not set'}`)
        console.log(`✅ Price: $${data.checkout_link.amount}`)
      } else {
        console.log('❌ Product information not properly populated')
      }
    } catch (apiError) {
      console.log('⚠️ API test failed, but checkout link created successfully')
    }
  }
}

testProductCheckout() 
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

class MerchantWorkflowTester {
  constructor() {
    this.testData = {
      merchant: null,
      paymentMethods: [],
      productTemplate: null,
      checkoutLinks: [],
      customerPayment: null
    }
    this.problems = []
  }

  logProblem(area, message, error = null) {
    const problem = {
      area,
      message,
      error: error?.message || null,
      timestamp: new Date().toISOString()
    }
    this.problems.push(problem)
    console.log(`🚨 PROBLEM NOTED - ${area}: ${message}`)
    if (error) console.log(`   Error details: ${error.message}`)
  }

  async runCompleteTest() {
    console.log('🚀 Starting Complete Merchant Workflow Test...\n')
    
    try {
      await this.testMerchantSignup()
      await this.testCreatePaymentMethods()
      await this.testCreateProductTemplate()
      await this.testCreateCheckoutLinks()
      await this.testCustomerCheckoutFlow()
      await this.verifyCompleteFlow()
      
      console.log('\n📊 Test Data Summary:')
      console.log(`- Merchant ID: ${this.testData.merchant?.id || 'FAILED'}`)
      console.log(`- Payment Methods Created: ${this.testData.paymentMethods.length}`)
      console.log(`- Product Template: ${this.testData.productTemplate?.id || 'FAILED'}`)
      console.log(`- Checkout Links: ${this.testData.checkoutLinks.length}`)
      console.log(`- Customer Payment: ${this.testData.customerPayment?.id || 'FAILED'}`)
      
    } catch (error) {
      this.logProblem('OVERALL_TEST', 'Complete test suite failed', error)
    }
    
    this.printProblemsReport()
  }

  async testMerchantSignup() {
    console.log('1️⃣ Testing Merchant Signup...')
    
    try {
      const merchantEmail = `merchant-test-${Date.now()}@example.com`
      const merchantPassword = 'TestPassword123!'
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: merchantEmail,
        password: merchantPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Test Merchant User',
          role: 'merchant'
        }
      })
      
      if (authError) {
        this.logProblem('MERCHANT_SIGNUP', 'Auth user creation failed', authError)
        return
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: merchantEmail,
          full_name: 'Test Merchant User',
          role: 'merchant',
          status: 'active'
        })
        .select()
        .single()
      
      if (profileError) {
        this.logProblem('MERCHANT_SIGNUP', 'Profile creation failed', profileError)
        return
      }
      
      this.testData.merchant = {
        id: authData.user.id,
        email: merchantEmail,
        profile: profileData
      }
      
      console.log(`✅ Merchant created: ${merchantEmail} (ID: ${authData.user.id})`)
    } catch (error) {
      this.logProblem('MERCHANT_SIGNUP', 'Unexpected error during merchant signup', error)
    }
  }

  async testCreatePaymentMethods() {
    console.log('\n2️⃣ Testing Payment Method Creation...')
    
    if (!this.testData.merchant) {
      this.logProblem('PAYMENT_METHODS', 'Cannot test payment methods - no merchant created')
      return
    }
    
    const paymentMethodsToCreate = [
      {
        name: 'Bank Transfer - USA',
        type: 'bank_transfer',
        countries: ['US'],
        currency: 'USD',
        instructions: 'Wire transfer to our US bank account',
        account_details: {
          bank_name: 'Test Bank USA',
          account_number: '1234567890',
          routing_number: '021000021'
        }
      },
      {
        name: 'PayPal - Global',
        type: 'paypal',
        countries: ['US', 'GB', 'CA', 'AU'],
        currency: 'USD',
        instructions: 'Send payment to our PayPal account',
        account_details: {
          paypal_email: 'payments@testmerchant.com'
        }
      }
    ]
    
    for (const pmData of paymentMethodsToCreate) {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: this.testData.merchant.id,
            name: pmData.name,
            type: pmData.type,
            countries: pmData.countries,
            currency: pmData.currency,
            instructions: pmData.instructions,
            account_details: pmData.account_details,
            status: 'active',
            instructions_for_checkout: `Step-by-step instructions for ${pmData.name}`
          })
          .select()
          .single()
        
        if (error) {
          this.logProblem('PAYMENT_METHODS', `Payment method creation failed for ${pmData.name}`, error)
          continue
        }
        
        this.testData.paymentMethods.push(data)
        console.log(`✅ Payment method created: ${pmData.name} (${pmData.countries.join(', ')})`)
      } catch (error) {
        this.logProblem('PAYMENT_METHODS', `Unexpected error creating payment method ${pmData.name}`, error)
      }
    }
  }

  async testCreateProductTemplate() {
    console.log('\n3️⃣ Testing Product Template Creation...')
    
    if (!this.testData.merchant) {
      this.logProblem('PRODUCT_TEMPLATES', 'Cannot test product template - no merchant created')
      return
    }
    
    try {
      const productData = {
        user_id: this.testData.merchant.id,
        name: 'Premium Digital Course',
        slug: `premium-course-${Date.now()}`,
        short_description: 'Learn advanced techniques in our comprehensive digital course',
        description: 'This premium digital course covers advanced topics with hands-on examples.',
        category: 'education',
        features: [
          'Lifetime access to course materials',
          'Downloadable resources and templates',
          'Community access',
          'Certificate of completion'
        ],
        is_active: true,
        is_featured: true,
        sort_order: 1
      }
      
      const { data, error } = await supabase
        .from('product_templates')
        .insert(productData)
        .select()
        .single()
      
      if (error) {
        this.logProblem('PRODUCT_TEMPLATES', 'Product template creation failed', error)
        return
      }
      
      this.testData.productTemplate = data
      console.log(`✅ Product template created: ${data.name} (ID: ${data.id})`)
    } catch (error) {
      this.logProblem('PRODUCT_TEMPLATES', 'Unexpected error during product template creation', error)
    }
  }

  async testCreateCheckoutLinks() {
    console.log('\n4️⃣ Testing Checkout Link Creation...')
    
    if (!this.testData.merchant) {
      this.logProblem('CHECKOUT_LINKS', 'Cannot test checkout links - no merchant created')
      return
    }
    
    // Test Simple Checkout Link
    try {
      const simpleCheckoutData = {
        merchant_id: this.testData.merchant.id,
        slug: `simple-payment-${Date.now()}`,
        title: 'Simple Payment Collection',
        link_name: 'simple-payment',
        checkout_type: 'simple',
        amount_type: 'fixed',
        amount: 99.99,
        currency: 'USD',
        active_country_codes: ['US', 'GB'],
        status: 'active',
        is_active: true,
        checkout_page_heading: 'Complete Your Payment',
        payment_review_message: 'Thank you! We will review your payment within 24 hours.'
      }
      
      const { data: simpleLink, error: simpleError } = await supabase
        .from('checkout_links')
        .insert(simpleCheckoutData)
        .select()
        .single()
    
      if (simpleError) {
        this.logProblem('CHECKOUT_LINKS', 'Simple checkout link creation failed', simpleError)
      } else {
        this.testData.checkoutLinks.push(simpleLink)
        console.log(`✅ Simple checkout link created: ${simpleLink.title} (/${simpleLink.slug})`)
      }
    } catch (error) {
      this.logProblem('CHECKOUT_LINKS', 'Unexpected error creating simple checkout link', error)
    }
    
    // Test Product Checkout Link
    if (this.testData.productTemplate) {
      try {
        const productCheckoutData = {
          merchant_id: this.testData.merchant.id,
          slug: `product-course-${Date.now()}`,
          title: 'Premium Course Purchase',
          link_name: 'premium-course',
          checkout_type: 'product',
          product_template_id: this.testData.productTemplate.id,
          custom_price: 149.99,
          currency: 'USD',
          active_country_codes: ['US', 'GB', 'CA'],
          status: 'active',
          is_active: true,
          checkout_page_heading: 'Get Your Premium Course',
          payment_review_message: 'Thank you for your purchase! We will process your order within 24 hours.'
        }
        
        const { data: productLink, error: productError } = await supabase
          .from('checkout_links')
          .insert(productCheckoutData)
          .select()
          .single()
        
        if (productError) {
          this.logProblem('CHECKOUT_LINKS', 'Product checkout link creation failed', productError)
        } else {
          this.testData.checkoutLinks.push(productLink)
          console.log(`✅ Product checkout link created: ${productLink.title} (/${productLink.slug})`)
        }
      } catch (error) {
        this.logProblem('CHECKOUT_LINKS', 'Unexpected error creating product checkout link', error)
      }
    } else {
      this.logProblem('CHECKOUT_LINKS', 'Cannot create product checkout link - no product template')
    }
  }

  async testCustomerCheckoutFlow() {
    console.log('\n5️⃣ Testing Customer Checkout Flow...')
    
    if (this.testData.checkoutLinks.length === 0) {
      this.logProblem('CUSTOMER_CHECKOUT', 'Cannot test customer checkout - no checkout links created')
      return
    }
    
    const checkoutLink = this.testData.checkoutLinks[0]
    
    try {
      const { data: availablePaymentMethods, error: pmError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', checkoutLink.merchant_id)
        .eq('status', 'active')
        .contains('countries', ['US'])
      
      if (pmError) {
        this.logProblem('CUSTOMER_CHECKOUT', 'Failed to fetch payment methods for checkout', pmError)
        return
      }
      
      if (!availablePaymentMethods.length) {
        this.logProblem('CUSTOMER_CHECKOUT', 'No payment methods available for US checkout')
        return
      }
      
      const selectedPaymentMethod = availablePaymentMethods[0]
      console.log(`💰 Using payment method: ${selectedPaymentMethod.name}`)
      
      const customerData = {
        checkout_link_id: checkoutLink.id,
        merchant_id: checkoutLink.merchant_id,
        payment_method_id: selectedPaymentMethod.id,
        customer_email: `customer-${Date.now()}@example.com`,
        customer_name: 'Test Customer',
        amount: checkoutLink.amount,
        currency: checkoutLink.currency,
        status: 'pending',
        payment_reference: `PAY-${Date.now()}`,
        customer_message: 'Test payment submission',
        payment_country: 'US'
      }
      
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(customerData)
        .select()
        .single()
      
      if (paymentError) {
        this.logProblem('CUSTOMER_CHECKOUT', 'Customer payment creation failed', paymentError)
        return
      }
      
      this.testData.customerPayment = payment
      console.log(`✅ Customer payment created: ${payment.payment_reference} (Status: ${payment.status})`)
      
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          proof_of_payment_url: `https://example.com/proof/${payment.id}`,
          notes: 'Proof uploaded successfully via test simulation'
        })
        .eq('id', payment.id)
      
      if (updateError) {
        this.logProblem('CUSTOMER_CHECKOUT', 'Proof upload simulation failed', updateError)
      } else {
        console.log(`✅ Proof upload simulated for payment: ${payment.payment_reference}`)
      }
    } catch (error) {
      this.logProblem('CUSTOMER_CHECKOUT', 'Unexpected error during customer checkout flow', error)
    }
  }

  async verifyCompleteFlow() {
    console.log('\n6️⃣ Verifying Complete Flow...')
    
    try {
      // Test UI button functionality
      await this.testButtonFunctionality()
      
      // Test existing dashboard data
      await this.testDashboardData()
      
      if (this.testData.customerPayment) {
        const { data: pendingPayment } = await supabase
          .from('payments')
      .select('*')
          .eq('id', this.testData.customerPayment.id)
          .single()
        
        if (!pendingPayment || pendingPayment.status !== 'pending') {
          this.logProblem('VERIFICATION', `Expected payment status 'pending', got '${pendingPayment?.status}'`)
        } else {
          console.log('✅ All components verified successfully!')
          console.log(`✅ Customer payment ${pendingPayment.payment_reference} is pending merchant review`)
        }
      }
    } catch (error) {
      this.logProblem('VERIFICATION', 'Unexpected error during verification', error)
    }
  }

  async testButtonFunctionality() {
    console.log('\n🔘 Testing Button Functionality (Country/Currency data)...')
    
    try {
      const { data: countries, error: countriesError } = await supabase
        .from('countries')
        .select('*')
        .eq('status', 'active')
        .limit(10)
      
      if (countriesError) {
        this.logProblem('BUTTON_FUNCTIONALITY', 'Countries endpoint failed', countriesError)
      } else {
        console.log(`✅ Countries endpoint working: ${countries.length} countries available`)
      }
      
      const { data: currencies, error: currenciesError } = await supabase
        .from('currencies')
        .select('*')
        .eq('status', 'active')
        .limit(10)
      
      if (currenciesError) {
        this.logProblem('BUTTON_FUNCTIONALITY', 'Currencies endpoint failed', currenciesError)
    } else {
        console.log(`✅ Currencies endpoint working: ${currencies.length} currencies available`)
      }
      
      // Test country-currency relationship
      for (const country of countries.slice(0, 3)) {
        if (country.currency_code) {
          const { data: currency, error: currencyError } = await supabase
            .from('currencies')
            .select('*')
            .eq('code', country.currency_code)
            .single()
          
          if (currencyError) {
            this.logProblem('BUTTON_FUNCTIONALITY', `Currency lookup failed for ${country.currency_code}`, currencyError)
          } else if (currency) {
            console.log(`✅ ${country.name} (${country.code}) → ${currency.name} (${currency.code})`)
          }
        }
      }
    } catch (error) {
      this.logProblem('BUTTON_FUNCTIONALITY', 'Unexpected error testing button functionality', error)
      }
    }
    
  async testDashboardData() {
    console.log('\n📊 Testing Dashboard Data Availability...')
    
    try {
      const { data: allPaymentMethods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('status', 'active')
      
      console.log(`✅ Payment Methods in database: ${allPaymentMethods?.length || 0}`)
      
      const { data: allCheckoutLinks } = await supabase
      .from('checkout_links')
      .select('*')
        .eq('status', 'active')
      
      console.log(`✅ Checkout Links in database: ${allCheckoutLinks?.length || 0}`)
      
      const { data: allProducts } = await supabase
        .from('product_templates')
        .select('*')
        .eq('is_active', true)
      
      console.log(`✅ Product Templates in database: ${allProducts?.length || 0}`)
      
      const { data: allPayments } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
      
      console.log(`✅ Pending Payments in database: ${allPayments?.length || 0}`)
    } catch (error) {
      this.logProblem('DASHBOARD_DATA', 'Error testing dashboard data availability', error)
    }
  }

  printProblemsReport() {
    console.log('\n' + '='.repeat(60))
    console.log('🚨 PROBLEMS REPORT')
    console.log('='.repeat(60))
    
    if (this.problems.length === 0) {
      console.log('✅ NO PROBLEMS FOUND! All systems working correctly.')
    } else {
      console.log(`❌ FOUND ${this.problems.length} PROBLEM(S) THAT NEED TO BE FIXED:\n`)
      
      this.problems.forEach((problem, index) => {
        console.log(`${index + 1}. [${problem.area}] ${problem.message}`)
        if (problem.error) {
          console.log(`   └─ Error: ${problem.error}`)
        }
        console.log(`   └─ Time: ${problem.timestamp}\n`)
      })
      
      console.log('SUMMARY BY AREA:')
      const problemsByArea = {}
      this.problems.forEach(p => {
        problemsByArea[p.area] = (problemsByArea[p.area] || 0) + 1
      })
      
      Object.entries(problemsByArea).forEach(([area, count]) => {
        console.log(`  - ${area}: ${count} problem(s)`)
      })
    }
    
    console.log('='.repeat(60))
  }
}

async function main() {
  console.log('🎯 COMPLETE MERCHANT WORKFLOW TEST')
  console.log('=====================================\n')
  
  try {
    console.log('📍 Testing database connection...')
    const { data: countries, error } = await supabase
      .from('countries')
      .select('*')
      .limit(3)
    
    if (error) throw error
    console.log(`✅ Database connected successfully (${countries.length} countries found)\n`)
    
    const tester = new MerchantWorkflowTester()
    await tester.runCompleteTest()
    
    console.log('\n📝 Next Steps Based on Test Results:')
    console.log('1. Fix all problems noted in the report above')
    console.log('2. Check the merchant dashboard UI functionality')
    console.log('3. Test the checkout links manually in browser')
    console.log('4. Verify payment method creation buttons work correctly')
    console.log('5. Test checkout link creation form functionality')
    
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED TO START:')
    console.error(error.message)
  }
}

main()
#!/usr/bin/env node

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
      
      console.log('\n✅ ALL TESTS PASSED! Merchant workflow is fully functional.')
      console.log('\n📊 Test Data Summary:')
      console.log(`- Merchant ID: ${this.testData.merchant.id}`)
      console.log(`- Payment Methods Created: ${this.testData.paymentMethods.length}`)
      console.log(`- Product Template: ${this.testData.productTemplate.id}`)
      console.log(`- Checkout Links: ${this.testData.checkoutLinks.length}`)
      console.log(`- Customer Payment: ${this.testData.customerPayment.id}`)
      
    } catch (error) {
      console.error('❌ Test Failed:', error.message)
      process.exit(1)
    }
  }

  async testMerchantSignup() {
    console.log('1️⃣ Testing Merchant Signup...')
    
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
    
    if (authError) throw new Error(`Auth signup failed: ${authError.message}`)
    
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
    
    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`)
    
    this.testData.merchant = {
      id: authData.user.id,
      email: merchantEmail,
      profile: profileData
    }
    
    console.log(`✅ Merchant created: ${merchantEmail} (ID: ${authData.user.id})`)
  }

  async testCreatePaymentMethods() {
    console.log('\n2️⃣ Testing Payment Method Creation...')
    
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
      
      if (error) throw new Error(`Payment method creation failed: ${error.message}`)
      
      this.testData.paymentMethods.push(data)
      console.log(`✅ Payment method created: ${pmData.name} (${pmData.countries.join(', ')})`)
    }
  }

  async testCreateProductTemplate() {
    console.log('\n3️⃣ Testing Product Template Creation...')
    
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
    
    if (error) throw new Error(`Product template creation failed: ${error.message}`)
    
    this.testData.productTemplate = data
    console.log(`✅ Product template created: ${data.name} (ID: ${data.id})`)
  }

  async testCreateCheckoutLinks() {
    console.log('\n4️⃣ Testing Checkout Link Creation...')
    
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
    
    const { data, error } = await supabase
      .from('checkout_links')
      .insert(simpleCheckoutData)
      .select()
      .single()
    
    if (error) throw new Error(`Checkout link creation failed: ${error.message}`)
    
    this.testData.checkoutLinks.push(data)
    console.log(`✅ Checkout link created: ${data.title} (/${data.slug})`)
  }

  async testCustomerCheckoutFlow() {
    console.log('\n5️⃣ Testing Customer Checkout Flow...')
    
    const checkoutLink = this.testData.checkoutLinks[0]
    
    const { data: availablePaymentMethods, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', checkoutLink.merchant_id)
      .eq('status', 'active')
      .contains('countries', ['US'])
    
    if (pmError || !availablePaymentMethods.length) {
      throw new Error(`No payment methods available for checkout link: ${checkoutLink.slug}`)
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
    
    if (paymentError) throw new Error(`Customer payment creation failed: ${paymentError.message}`)
    
    this.testData.customerPayment = payment
    console.log(`✅ Customer payment created: ${payment.payment_reference} (Status: ${payment.status})`)
    
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        proof_of_payment_url: `https://example.com/proof/${payment.id}`,
        notes: 'Proof uploaded successfully via test simulation'
      })
      .eq('id', payment.id)
    
    if (updateError) throw new Error(`Proof upload simulation failed: ${updateError.message}`)
    
    console.log(`✅ Proof upload simulated for payment: ${payment.payment_reference}`)
  }

  async verifyCompleteFlow() {
    console.log('\n6️⃣ Verifying Complete Flow...')
    
    const { data: merchantPMs } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', this.testData.merchant.id)
    
    if (!merchantPMs || merchantPMs.length === 0) {
      throw new Error('Merchant payment methods verification failed')
    }
    
    const { data: pendingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', this.testData.customerPayment.id)
      .single()
    
    if (!pendingPayment || pendingPayment.status !== 'pending') {
      throw new Error(`Expected payment status 'pending', got '${pendingPayment?.status}'`)
    }
    
    console.log('✅ All components verified successfully!')
    console.log(`✅ Customer payment ${pendingPayment.payment_reference} is pending merchant review`)
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
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!')
    console.log('\n📝 Next Steps:')
    console.log('1. Check the merchant dashboard to verify UI functionality')
    console.log('2. Test the checkout links manually in browser')
    console.log('3. Verify payment method buttons work correctly')
    
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:')
    console.error(error.message)
    process.exit(1)
  }
}

main() 
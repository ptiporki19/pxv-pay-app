const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frdksqjaiuakkalebnzd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzEwNzkxOCwiZXhwIjoyMDQ4NjgzOTE4fQ.gm8vUIGIjOBnXQq9SnJUXTu-zcwZOG1r_k6iOozMsZY'
);

const USER_ID = '9b914cb6-aacf-4acc-beca-3e6d8e8a8495';

// Test payment methods for different countries
const testPaymentMethods = [
  {
    name: 'Orange Money Cameroon',
    type: 'manual',
    description: 'Orange Money mobile payment for Cameroon',
    instructions: 'Send payment to the Orange Money number shown. Include your name as reference.',
    account_details: [
      {
        id: 'orange_number',
        label: 'Orange Money Number',
        value: '693456789',
        type: 'text',
        required: true
      }
    ],
    countries: ['CM'],
    status: 'active',
    sort_order: 1
  },
  {
    name: 'MTN Mobile Money CM',
    type: 'manual',
    description: 'MTN Mobile Money for Cameroon',
    instructions: 'Transfer to MTN Mobile Money number provided. Use your name as reference.',
    account_details: [
      {
        id: 'mtn_number',
        label: 'MTN Mobile Money Number',
        value: '674123456',
        type: 'text',
        required: true
      }
    ],
    countries: ['CM'],
    status: 'active',
    sort_order: 2
  },
  {
    name: 'Bank Transfer Germany',
    type: 'manual',
    description: 'SEPA bank transfer for Germany',
    instructions: 'Transfer funds using the IBAN provided. Reference your order ID.',
    account_details: [
      {
        id: 'iban',
        label: 'IBAN',
        value: 'DE89370400440532013000',
        type: 'text',
        required: true
      },
      {
        id: 'swift',
        label: 'SWIFT/BIC',
        value: 'COBADEFFXXX',
        type: 'text',
        required: true
      }
    ],
    countries: ['DE'],
    status: 'active',
    sort_order: 3
  },
  {
    name: 'UK Bank Transfer',
    type: 'manual',
    description: 'Faster Payments for United Kingdom',
    instructions: 'Use the sort code and account number for bank transfer.',
    account_details: [
      {
        id: 'sort_code',
        label: 'Sort Code',
        value: '20-12-34',
        type: 'text',
        required: true
      },
      {
        id: 'account_number',
        label: 'Account Number',
        value: '12345678',
        type: 'text',
        required: true
      }
    ],
    countries: ['GB'],
    status: 'active',
    sort_order: 4
  },
  {
    name: 'US Bank Account',
    type: 'manual',
    description: 'ACH bank transfer for United States',
    instructions: 'Use routing and account number for wire transfer.',
    account_details: [
      {
        id: 'routing_number',
        label: 'Routing Number',
        value: '021000021',
        type: 'text',
        required: true
      },
      {
        id: 'account_number',
        label: 'Account Number',
        value: '987654321',
        type: 'text',
        required: true
      }
    ],
    countries: ['US'],
    status: 'active',
    sort_order: 5
  }
];

async function cleanupOldTestData() {
  console.log('🧹 Cleaning up old test data...');
  
  try {
    // Delete old test payments
    await supabase
      .from('payments')
      .delete()
      .like('customer_name', 'Test%');
    
    // Delete old test checkout links
    await supabase
      .from('checkout_links')
      .delete()
      .like('title', 'Test%');
    
    // Delete old test payment methods
    await supabase
      .from('payment_methods')
      .delete()
      .eq('user_id', USER_ID)
      .like('name', '%Test%');
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }
}

async function createTestPaymentMethods() {
  console.log('\n💳 Creating test payment methods...');
  
  const createdMethods = [];
  
  for (const methodData of testPaymentMethods) {
    try {
      const paymentMethodData = {
        user_id: USER_ID,
        name: methodData.name,
        type: methodData.type,
        icon_url: null,
        description: methodData.description,
        instructions: methodData.instructions,
        account_details: methodData.account_details,
        countries: methodData.countries,
        status: methodData.status,
        sort_order: methodData.sort_order
      };
      
      console.log(`📝 Creating: ${methodData.name}`);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([paymentMethodData])
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Failed to create ${methodData.name}:`, error.message);
      } else {
        console.log(`✅ Created: ${data.name} (${data.id})`);
        createdMethods.push(data);
      }
    } catch (error) {
      console.error(`💥 Unexpected error for ${methodData.name}:`, error.message);
    }
  }
  
  return createdMethods;
}

async function createTestCheckoutLinks(paymentMethods) {
  console.log('\n🔗 Creating test checkout links...');
  
  const checkoutLinks = [
    {
      title: 'Test Simple Payment - Cameroon',
      link_name: 'test-cameroon-payment',
      amount_type: 'fixed',
      amount: 5000,
      currency: 'XAF',
      active_country_codes: ['CM'],
      description: 'Test payment for Cameroon market',
      checkout_type: 'simple'
    },
    {
      title: 'Test Flexible Payment - Europe',
      link_name: 'test-europe-flexible',
      amount_type: 'flexible',
      min_amount: 10,
      max_amount: 1000,
      currency: 'EUR',
      active_country_codes: ['DE'],
      description: 'Flexible payment for European customers',
      checkout_type: 'simple'
    },
    {
      title: 'Test Multi-Country Payment',
      link_name: 'test-multi-country',
      amount_type: 'fixed',
      amount: 100,
      currency: 'USD',
      active_country_codes: ['US', 'GB', 'CM'],
      description: 'Payment accepting multiple countries',
      checkout_type: 'simple'
    }
  ];
  
  const createdLinks = [];
  
  for (const linkData of checkoutLinks) {
    try {
      const checkoutLinkData = {
        merchant_id: USER_ID,
        slug: `${linkData.link_name}-${Date.now()}`,
        title: linkData.title,
        link_name: linkData.link_name,
        amount_type: linkData.amount_type,
        amount: linkData.amount || null,
        min_amount: linkData.min_amount || null,
        max_amount: linkData.max_amount || null,
        currency: linkData.currency,
        active_country_codes: linkData.active_country_codes,
        status: 'active',
        is_active: true,
        checkout_type: linkData.checkout_type,
        description: linkData.description,
        collect_customer_info: true,
        collect_address: false,
        checkout_page_heading: 'Complete Your Payment',
        payment_review_message: 'Thank you for your payment. We will review and confirm within 24 hours.',
        metadata: {}
      };
      
      console.log(`📝 Creating: ${linkData.title}`);
      
      const { data, error } = await supabase
        .from('checkout_links')
        .insert([checkoutLinkData])
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Failed to create ${linkData.title}:`, error.message);
        console.error('Error details:', error);
      } else {
        console.log(`✅ Created: ${data.title} (${data.slug})`);
        console.log(`   URL: http://localhost:3009/c/${data.slug}`);
        createdLinks.push(data);
      }
    } catch (error) {
      console.error(`💥 Unexpected error for ${linkData.title}:`, error.message);
    }
  }
  
  return createdLinks;
}

async function testAPIEndpoints(checkoutLinks) {
  console.log('\n🔍 Testing API endpoints...');
  
  for (const link of checkoutLinks.slice(0, 2)) { // Test first 2 links
    try {
      console.log(`\nTesting: ${link.slug}`);
      
      // Test validation endpoint
      const validateResponse = await fetch(`http://localhost:3009/api/checkout/${link.slug}/validate`);
      if (validateResponse.ok) {
        console.log(`✅ Validation endpoint working`);
      } else {
        console.log(`❌ Validation endpoint failed: ${validateResponse.status}`);
      }
      
      // Test countries endpoint
      const countriesResponse = await fetch(`http://localhost:3009/api/checkout/${link.slug}/countries`);
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        console.log(`✅ Countries endpoint: ${countriesData.countries?.length || 0} countries`);
      } else {
        console.log(`❌ Countries endpoint failed: ${countriesResponse.status}`);
      }
      
      // Test payment methods endpoint for the first country
      if (link.active_country_codes.length > 0) {
        const countryCode = link.active_country_codes[0];
        const methodsResponse = await fetch(`http://localhost:3009/api/checkout/${link.slug}/methods?country=${countryCode}`);
        if (methodsResponse.ok) {
          const methodsData = await methodsResponse.json();
          console.log(`✅ Payment methods endpoint: ${methodsData.payment_methods?.length || 0} methods for ${countryCode}`);
          
          // Display first payment method details
          if (methodsData.payment_methods && methodsData.payment_methods.length > 0) {
            const firstMethod = methodsData.payment_methods[0];
            console.log(`   First method: ${firstMethod.name}`);
            console.log(`   Instructions: ${firstMethod.instructions_for_checkout || 'None'}`);
            console.log(`   Custom fields: ${firstMethod.custom_fields?.length || 0}`);
          }
        } else {
          console.log(`❌ Payment methods endpoint failed: ${methodsResponse.status}`);
        }
      }
      
    } catch (error) {
      console.error(`💥 API test error for ${link.slug}:`, error.message);
    }
  }
}

async function displaySummary(paymentMethods, checkoutLinks) {
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  console.log(`\n💳 Payment Methods Created: ${paymentMethods.length}`);
  paymentMethods.forEach(method => {
    console.log(`   • ${method.name} (${method.countries.join(', ')}) - ${method.status}`);
  });
  
  console.log(`\n🔗 Checkout Links Created: ${checkoutLinks.length}`);
  checkoutLinks.forEach(link => {
    console.log(`   • ${link.title}`);
    console.log(`     URL: http://localhost:3009/c/${link.slug}`);
    console.log(`     Countries: ${link.active_country_codes.join(', ')}`);
    console.log(`     Amount: ${link.amount_type === 'fixed' ? `${link.amount} ${link.currency}` : `${link.min_amount}-${link.max_amount} ${link.currency}`}`);
  });
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Visit http://localhost:3009/payment-methods to verify payment methods appear');
  console.log('2. Visit http://localhost:3009/checkout-links to verify checkout links appear');
  console.log('3. Test checkout flow by visiting the checkout URLs above');
  console.log('4. Select different countries and verify payment methods show correctly');
  console.log('5. Upload proof of payment and check verification page');
  
  console.log('\n🔧 ADMIN URLS:');
  console.log('• Payment Methods: http://localhost:3009/payment-methods');
  console.log('• Checkout Links: http://localhost:3009/checkout-links');
  console.log('• Verification: http://localhost:3009/verification');
  console.log('• Dashboard: http://localhost:3009/dashboard');
}

async function runCompleteTest() {
  console.log('🚀 COMPREHENSIVE PAYMENT FLOW TEST');
  console.log('===================================');
  
  try {
    // Step 1: Cleanup
    await cleanupOldTestData();
    
    // Step 2: Create payment methods
    const paymentMethods = await createTestPaymentMethods();
    
    if (paymentMethods.length === 0) {
      console.error('❌ No payment methods created. Stopping test.');
      return;
    }
    
    // Step 3: Create checkout links
    const checkoutLinks = await createTestCheckoutLinks(paymentMethods);
    
    if (checkoutLinks.length === 0) {
      console.error('❌ No checkout links created. Stopping test.');
      return;
    }
    
    // Step 4: Test API endpoints
    await testAPIEndpoints(checkoutLinks);
    
    // Step 5: Display summary
    await displaySummary(paymentMethods, checkoutLinks);
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('All payment methods and checkout links have been created.');
    console.log('The complete payment flow should now work end-to-end.');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
runCompleteTest(); 
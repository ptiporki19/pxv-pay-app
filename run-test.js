#!/usr/bin/env node

console.log('🎯 COMPLETE MERCHANT WORKFLOW TEST')
console.log('=====================================\n')

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function quickTest() {
  try {
    console.log('📍 Testing database connection...')
    const { data: countries, error } = await supabase
      .from('countries')
      .select('*')
      .limit(3)
    
    if (error) throw error
    console.log('✅ Database connected successfully')
    console.log(`✅ Found ${countries.length} countries`)
    
    // Now run the full test
    console.log('\n🚀 Running complete workflow test...\n')
    require('./complete-merchant-workflow-test.js')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  }
}

quickTest() 
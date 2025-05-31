#!/usr/bin/env node

console.log('🎯 SIMPLE TEST START')

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

console.log('✅ Dependencies loaded')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('✅ Supabase client created')

async function simpleTest() {
  try {
    console.log('📍 Testing database connection...')
    
    const { data: countries, error } = await supabase
      .from('countries')
      .select('code, name')
      .limit(3)
    
    if (error) {
      console.error('❌ Database error:', error.message)
      return
    }
    
    console.log('✅ Database connected successfully')
    console.log(`✅ Found ${countries.length} countries:`)
    countries.forEach(country => {
      console.log(`  - ${country.name} (${country.code})`)
    })
    
    console.log('\n🎉 SIMPLE TEST COMPLETED!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

console.log('🚀 Running async test...')
simpleTest() 
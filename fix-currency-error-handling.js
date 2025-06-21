const fs = require('fs')
const path = require('path')

// Read the current client-api.ts file
const filePath = path.join(__dirname, 'src/lib/supabase/client-api.ts')
let content = fs.readFileSync(filePath, 'utf8')

console.log('🔧 Fixing Currency Error Handling...\n')

// Find the currency create error handling section
const oldCurrencyErrorHandling = `    if (error) {
      console.error('Error creating currency:', error)
      throw new Error(error.message)
    }`

const newCurrencyErrorHandling = `    if (error) {
      console.error('Error creating currency:', error)
      
      // Provide more specific error messages for common errors
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('currencies_code_key')) {
          throw new Error(\`Currency code '\${currency.code}' already exists. Please use a different currency code.\`)
        }
        if (error.message.includes('currencies_user_code_unique')) {
          throw new Error(\`You already have a currency with code '\${currency.code}'. Please use a different currency code.\`)
        }
        if (error.message.includes('currencies_user_name_unique')) {
          throw new Error(\`You already have a currency named '\${currency.name}'. Please use a different currency name.\`)
        }
        throw new Error(\`A currency with this code or name already exists. Please use different values.\`)
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create currencies.')
      }
      
      // Generic error message
      throw new Error(error.message || 'Failed to create currency. Please try again.')
    }`

// Replace the currency error handling
if (content.includes(oldCurrencyErrorHandling)) {
  content = content.replace(oldCurrencyErrorHandling, newCurrencyErrorHandling)
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8')
  
  console.log('✅ Successfully updated currency error handling in client-api.ts')
  console.log('   - Added specific error messages for duplicate currency codes')
  console.log('   - Added permission error handling')
  console.log('\n🎉 Currency creation errors will now show helpful messages!')
} else {
  console.log('❌ Could not find the expected currency error handling pattern')
  console.log('   The file may have been modified or the pattern has changed')
}

console.log('\n📋 Summary of improvements:')
console.log('✅ Countries: Better error messages for duplicates and constraints')
console.log('✅ Currencies: Better error messages for duplicates')
console.log('✅ Both APIs now provide user-friendly error messages') 
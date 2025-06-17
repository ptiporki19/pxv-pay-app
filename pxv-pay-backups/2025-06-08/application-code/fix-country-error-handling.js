const fs = require('fs')
const path = require('path')

// Read the current client-api.ts file
const filePath = path.join(__dirname, 'src/lib/supabase/client-api.ts')
let content = fs.readFileSync(filePath, 'utf8')

console.log('🔧 Fixing Country Error Handling...\n')

// Find the problematic error handling section
const oldErrorHandling = `    if (error) {
      console.error('Error creating country:', error)
      throw new Error(error.message)
    }`

const newErrorHandling = `    if (error) {
      console.error('Error creating country:', error)
      
      // Provide more specific error messages for common errors
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('countries_code_key')) {
          throw new Error(\`Country code '\${country.code}' already exists. Please use a different country code.\`)
        }
        if (error.message.includes('countries_user_code_unique')) {
          throw new Error(\`You already have a country with code '\${country.code}'. Please use a different country code.\`)
        }
        if (error.message.includes('countries_user_name_unique')) {
          throw new Error(\`You already have a country named '\${country.name}'. Please use a different country name.\`)
        }
        throw new Error(\`A country with this code or name already exists. Please use different values.\`)
      }
      
      if (error.code === '23503') {
        // Foreign key constraint violation
        if (error.message.includes('currency_id')) {
          throw new Error('The selected currency is invalid. Please select a valid currency.')
        }
        throw new Error('Invalid reference data. Please check your selections.')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create countries.')
      }
      
      // Generic error message
      throw new Error(error.message || 'Failed to create country. Please try again.')
    }`

// Replace the error handling
if (content.includes(oldErrorHandling)) {
  content = content.replace(oldErrorHandling, newErrorHandling)
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8')
  
  console.log('✅ Successfully updated error handling in client-api.ts')
  console.log('   - Added specific error messages for duplicate country codes')
  console.log('   - Added handling for foreign key constraint violations')
  console.log('   - Added permission error handling')
  console.log('\n🎉 Country creation errors will now show helpful messages!')
} else {
  console.log('❌ Could not find the expected error handling pattern')
  console.log('   The file may have been modified or the pattern has changed')
}

console.log('\n📋 Next steps:')
console.log('1. Try creating a country with a duplicate code - you should see a helpful error')
console.log('2. The error will tell you exactly what\'s wrong and how to fix it') 
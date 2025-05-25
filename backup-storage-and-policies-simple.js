const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const pool = new Pool({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
})

async function backupStorageAndPolicies() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backupDir = `storage_policies_backup_${timestamp}`
  
  console.log(`📦 Creating backup in: ${backupDir}\n`)
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir)
  }
  
  try {
    // 1. Backup Storage Buckets
    console.log('🪣 Backing up storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('⚠️  Error fetching buckets:', bucketsError.message)
    } else {
      // Save buckets data
      fs.writeFileSync(path.join(backupDir, 'buckets_data.json'), JSON.stringify(buckets, null, 2))
      console.log(`✅ Backed up ${buckets.length} storage buckets`)
    }
    
    // 2. Backup RLS Policies
    console.log('🔐 Backing up RLS policies...')
    
    const tables = ['users', 'payments', 'countries', 'currencies', 'payment_methods']
    const policiesData = {}
    
    for (const table of tables) {
      try {
        const result = await pool.query(`
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = $1 AND schemaname = 'public'
        `, [table])
        
        policiesData[table] = result.rows
        console.log(`📋 Found ${result.rows.length} policies for ${table}`)
      } catch (error) {
        console.log(`⚠️  Error fetching policies for ${table}: ${error.message}`)
      }
    }
    
    // Save policies data
    fs.writeFileSync(path.join(backupDir, 'policies_data.json'), JSON.stringify(policiesData, null, 2))
    
    const totalPolicies = Object.values(policiesData).reduce((sum, policies) => sum + policies.length, 0)
    console.log(`✅ Backed up ${totalPolicies} RLS policies`)
    
    // 3. Create README
    const readme = `# Storage Buckets and RLS Policies Backup

Generated: ${new Date().toISOString()}

## Contents

- buckets_data.json - Storage buckets configuration
- policies_data.json - RLS policies data

## Restore Instructions

Use the existing restore scripts:
- For buckets: node pxv_pay_backup_20250524_163521/restore_storage_buckets.js
- For policies: node apply-rls-policies.js

## Backup Summary

- Storage Buckets: ${buckets?.length || 0}
- RLS Policies: ${totalPolicies}
- Tables: ${tables.join(', ')}
`
    
    fs.writeFileSync(path.join(backupDir, 'README.md'), readme)
    
    console.log(`\n🎉 Backup Complete!`)
    console.log(`📁 Location: ${backupDir}`)
    console.log(`📦 Storage Buckets: ${buckets?.length || 0}`)
    console.log(`🔐 RLS Policies: ${totalPolicies}`)
    
  } catch (error) {
    console.error('💥 Backup error:', error)
  } finally {
    await pool.end()
  }
}

backupStorageAndPolicies()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 
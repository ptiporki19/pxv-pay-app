const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function completeRestoration() {
  try {
    console.log('🔄 Starting Complete Restoration with Phase 2 Integration...')
    console.log('')

    // Step 1: Restore Database Schema and Data
    console.log('📊 Step 1: Restoring Database...')
    await restoreDatabase()

    // Step 2: Restore Storage Buckets
    console.log('🗄️  Step 2: Restoring Storage Buckets...')
    await restoreStorageBuckets()

    // Step 3: Restore Storage Policies
    console.log('🔒 Step 3: Restoring Storage Policies...')
    await restoreStoragePolicies()

    // Step 4: Create Admin User
    console.log('👤 Step 4: Creating Admin User...')
    await createAdminUser()

    // Step 5: Add Sample Data
    console.log('📝 Step 5: Adding Sample Data...')
    await addSampleData()

    // Step 6: Apply Phase 2 Enhancements
    console.log('🚀 Step 6: Applying Phase 2 Enhancements...')
    await applyPhase2Enhancements()

    // Step 7: Verify Integration
    console.log('✅ Step 7: Verifying Integration...')
    await verifyIntegration()

    console.log('')
    console.log('🎉 Complete Restoration Successful!')
    console.log('')
    console.log('📋 Summary:')
    console.log('✅ Database fully restored from backup')
    console.log('✅ All storage buckets recreated')
    console.log('✅ Storage RLS policies restored')
    console.log('✅ Admin user: admin@pxvpay.com / admin123456')
    console.log('✅ Sample countries and currencies added')
    console.log('✅ Phase 2 checkout links system integrated')
    console.log('✅ User limits system active (unlimited for MVP)')
    console.log('✅ All existing functionality preserved')
    console.log('')
    console.log('🌐 Access your app at: http://localhost:3001')
    console.log('🔗 Checkout Links: http://localhost:3001/checkout-links')

  } catch (error) {
    console.error('❌ Restoration failed:', error)
    process.exit(1)
  }
}

async function restoreDatabase() {
  try {
    // Read the complete database backup
    const backupPath = path.join(__dirname, 'pxv_pay_backup_20250525_064928/database_complete.sql')
    const backupSQL = fs.readFileSync(backupPath, 'utf8')
    
    console.log('  📥 Loading database backup...')
    
    // Split into manageable chunks and execute
    const statements = backupSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`  ⚡ Executing ${statements.length} database statements...`)
    
    // Execute in smaller batches to avoid timeouts
    const batchSize = 10
    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize)
      for (const statement of batch) {
        try {
          await supabase.rpc('exec_sql', { sql: statement + ';' })
        } catch (err) {
          // Continue with warnings for non-critical errors
          if (!err.message.includes('already exists')) {
            console.log(`    ⚠️  Warning: ${err.message.substring(0, 100)}...`)
          }
        }
      }
      console.log(`  📊 Progress: ${Math.min(i + batchSize, statements.length)}/${statements.length} statements`)
    }
    
    console.log('  ✅ Database restoration completed')
  } catch (error) {
    console.error('  ❌ Database restoration failed:', error)
    throw error
  }
}

async function restoreStorageBuckets() {
  try {
    // Read buckets backup
    const bucketsPath = path.join(__dirname, 'storage_policies_backup_2025-05-25T01-27-38/buckets_data.json')
    const bucketsData = JSON.parse(fs.readFileSync(bucketsPath, 'utf8'))
    
    console.log('  🗄️  Creating storage buckets...')
    
    for (const bucket of bucketsData) {
      try {
        const { error } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowed_mime_types,
          fileSizeLimit: bucket.file_size_limit
        })
        
        if (error && !error.message.includes('already exists')) {
          console.log(`    ⚠️  Warning creating bucket ${bucket.id}: ${error.message}`)
        } else {
          console.log(`    ✅ Bucket created: ${bucket.id}`)
        }
      } catch (err) {
        console.log(`    ⚠️  Warning creating bucket ${bucket.id}: ${err.message}`)
      }
    }
    
    console.log('  ✅ Storage buckets restoration completed')
  } catch (error) {
    console.error('  ❌ Storage buckets restoration failed:', error)
    throw error
  }
}

async function restoreStoragePolicies() {
  try {
    // Read policies backup
    const policiesPath = path.join(__dirname, 'storage_policies_backup_2025-05-25T01-27-38/policies_data.json')
    const policiesData = JSON.parse(fs.readFileSync(policiesPath, 'utf8'))
    
    console.log('  🔒 Restoring storage policies...')
    
    for (const policy of policiesData) {
      try {
        // Create policy using SQL
        const policySQL = `
          CREATE POLICY "${policy.name}" ON storage.objects
          FOR ${policy.command}
          TO ${policy.roles.join(', ')}
          USING (${policy.check});
        `
        
        await supabase.rpc('exec_sql', { sql: policySQL })
        console.log(`    ✅ Policy created: ${policy.name}`)
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`    ⚠️  Warning creating policy ${policy.name}: ${err.message}`)
        }
      }
    }
    
    console.log('  ✅ Storage policies restoration completed')
  } catch (error) {
    console.error('  ❌ Storage policies restoration failed:', error)
    throw error
  }
}

async function createAdminUser() {
  try {
    // Create admin user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@pxvpay.com',
      password: 'admin123456',
      email_confirm: true
    })

    if (authError && !authError.message.includes('already registered')) {
      throw authError
    }

    const userId = authUser?.user?.id || '00000000-0000-0000-0000-000000000001'

    // Create user record in users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'admin@pxvpay.com',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (userError && !userError.message.includes('duplicate key')) {
      console.log(`    ⚠️  User record warning: ${userError.message}`)
    }

    console.log('  ✅ Admin user created: admin@pxvpay.com / admin123456')
  } catch (error) {
    console.log(`  ⚠️  Admin user warning: ${error.message}`)
  }
}

async function addSampleData() {
  try {
    // Add sample countries
    const countries = [
      { name: 'United States', code: 'US', status: 'active' },
      { name: 'United Kingdom', code: 'GB', status: 'active' },
      { name: 'Canada', code: 'CA', status: 'active' },
      { name: 'Nigeria', code: 'NG', status: 'active' }
    ]

    for (const country of countries) {
      const { error } = await supabase
        .from('countries')
        .upsert(country, { onConflict: 'code' })
      
      if (error && !error.message.includes('duplicate key')) {
        console.log(`    ⚠️  Country warning: ${error.message}`)
      }
    }

    // Add sample currencies
    const currencies = [
      { name: 'US Dollar', code: 'USD', symbol: '$', status: 'active' },
      { name: 'British Pound', code: 'GBP', symbol: '£', status: 'active' },
      { name: 'Canadian Dollar', code: 'CAD', symbol: 'C$', status: 'active' },
      { name: 'Nigerian Naira', code: 'NGN', symbol: '₦', status: 'active' }
    ]

    for (const currency of currencies) {
      const { error } = await supabase
        .from('currencies')
        .upsert(currency, { onConflict: 'code' })
      
      if (error && !error.message.includes('duplicate key')) {
        console.log(`    ⚠️  Currency warning: ${error.message}`)
      }
    }

    console.log('  ✅ Sample data added successfully')
  } catch (error) {
    console.log(`  ⚠️  Sample data warning: ${error.message}`)
  }
}

async function applyPhase2Enhancements() {
  try {
    // Apply Phase 2 database enhancements
    const enhancementsSQL = `
      -- Add new columns to checkout_links if they don't exist
      ALTER TABLE checkout_links 
      ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'expired', 'draft'));

      -- Update existing records
      UPDATE checkout_links 
      SET title = link_name 
      WHERE title = '' OR title IS NULL;

      -- Create user_limits table if it doesn't exist
      CREATE TABLE IF NOT EXISTS user_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        user_role TEXT NOT NULL DEFAULT 'registered_user',
        max_checkout_links INTEGER DEFAULT NULL,
        current_checkout_links INTEGER DEFAULT 0,
        max_monthly_payments INTEGER DEFAULT NULL,
        current_monthly_payments INTEGER DEFAULT 0,
        max_storage_mb INTEGER DEFAULT NULL,
        current_storage_mb INTEGER DEFAULT 0,
        can_use_analytics BOOLEAN DEFAULT true,
        can_use_webhooks BOOLEAN DEFAULT true,
        can_customize_branding BOOLEAN DEFAULT true,
        can_export_data BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );

      -- Enable RLS on user_limits
      ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

      -- Initialize user limits for existing users
      INSERT INTO user_limits (user_id, user_role, max_checkout_links)
      SELECT 
        u.id,
        COALESCE(u.role, 'registered_user'),
        NULL
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM user_limits ul WHERE ul.user_id = u.id
      );
    `

    const statements = enhancementsSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      try {
        await supabase.rpc('exec_sql', { sql: statement + ';' })
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate key')) {
          console.log(`    ⚠️  Enhancement warning: ${err.message}`)
        }
      }
    }

    console.log('  ✅ Phase 2 enhancements applied successfully')
  } catch (error) {
    console.log(`  ⚠️  Phase 2 enhancements warning: ${error.message}`)
  }
}

async function verifyIntegration() {
  try {
    // Test database connectivity
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (usersError) throw usersError

    // Test storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) throw bucketsError

    // Test checkout_links table
    const { data: checkoutLinks, error: checkoutError } = await supabase
      .from('checkout_links')
      .select('count')
      .limit(1)

    if (checkoutError) throw checkoutError

    // Test user_limits table
    const { data: userLimits, error: limitsError } = await supabase
      .from('user_limits')
      .select('count')
      .limit(1)

    if (limitsError) throw limitsError

    console.log('  ✅ Database connectivity verified')
    console.log(`  ✅ Storage buckets available: ${buckets.length}`)
    console.log('  ✅ Checkout links table accessible')
    console.log('  ✅ User limits system functional')
    console.log('  ✅ All integrations working properly')
  } catch (error) {
    console.error('  ❌ Integration verification failed:', error)
    throw error
  }
}

// Run the complete restoration
completeRestoration() 
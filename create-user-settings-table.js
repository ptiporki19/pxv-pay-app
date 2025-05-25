const { Pool } = require('pg')

const pool = new Pool({
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
})

async function createUserSettingsTable() {
  console.log('🗃️ Creating user_settings table if it\'s not exist...\n')
  
  try {
    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings'
      );
    `)
    
    if (tableExists.rows[0].exists) {
      console.log('✅ user_settings table already exists')
      return
    }
    
    // Create the table
    await pool.query(`
      CREATE TABLE public.user_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        theme TEXT DEFAULT 'system',
        notifications_enabled BOOLEAN DEFAULT true,
        email_notifications BOOLEAN DEFAULT true,
        system_alerts BOOLEAN DEFAULT true,
        language TEXT DEFAULT 'en',
        timezone TEXT,
        auto_backup BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `)
    
    console.log('✅ user_settings table created')
    
    // Enable RLS
    await pool.query(`ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;`)
    console.log('✅ RLS enabled on user_settings')
    
    // Create RLS policies
    await pool.query(`
      CREATE POLICY "authenticated_read_own_settings" ON public.user_settings
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
    `)
    
    await pool.query(`
      CREATE POLICY "authenticated_update_own_settings" ON public.user_settings
      FOR ALL TO authenticated
      USING (auth.uid() = user_id);
    `)
    
    console.log('✅ RLS policies created for user_settings')
    
    // Add some additional columns to users table for profile information
    try {
      await pool.query(`
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS first_name TEXT,
        ADD COLUMN IF NOT EXISTS last_name TEXT,
        ADD COLUMN IF NOT EXISTS phone TEXT,
        ADD COLUMN IF NOT EXISTS organization TEXT,
        ADD COLUMN IF NOT EXISTS timezone TEXT;
      `)
      console.log('✅ Additional profile columns added to users table')
    } catch (error) {
      console.log('⚠️ Could not add profile columns (they may already exist):', error.message)
    }
    
    console.log('\n🎉 User settings and profile setup complete!')
    
  } catch (error) {
    console.error('💥 Error creating user_settings table:', error.message)
  } finally {
    await pool.end()
  }
}

createUserSettingsTable()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 
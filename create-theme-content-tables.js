const { Client } = require('pg')

const pgClient = new Client({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
})

async function createThemeContentTables() {
  try {
    console.log('🎨 CREATING THEME AND CONTENT MANAGEMENT TABLES...\n')
    
    await pgClient.connect()
    console.log('✅ Connected to PostgreSQL\n')

    // 1. Create themes table for user-specific theme customization
    console.log('1. Creating themes table...')
    const createThemesTableSQL = `
      CREATE TABLE IF NOT EXISTS themes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        primary_color VARCHAR(7) DEFAULT '#3b82f6',
        secondary_color VARCHAR(7) DEFAULT '#64748b',
        accent_color VARCHAR(7) DEFAULT '#06b6d4',
        background_color VARCHAR(7) DEFAULT '#ffffff',
        text_color VARCHAR(7) DEFAULT '#0f172a',
        border_color VARCHAR(7) DEFAULT '#e2e8f0',
        success_color VARCHAR(7) DEFAULT '#22c55e',
        warning_color VARCHAR(7) DEFAULT '#f59e0b',
        error_color VARCHAR(7) DEFAULT '#ef4444',
        font_family VARCHAR(50) DEFAULT 'Inter',
        border_radius VARCHAR(10) DEFAULT 'medium',
        logo_url TEXT,
        favicon_url TEXT,
        custom_css TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for themes
      CREATE INDEX IF NOT EXISTS themes_user_id_idx ON themes(user_id);
      CREATE INDEX IF NOT EXISTS themes_user_active_idx ON themes(user_id, is_active);
      
      -- Add unique constraint for user themes
      ALTER TABLE themes ADD CONSTRAINT themes_user_name_unique UNIQUE (user_id, name);
    `
    
    await pgClient.query(createThemesTableSQL)
    console.log('✅ Themes table created with user-specific constraints')

    // 2. Create content_templates table for user-specific content management
    console.log('\n2. Creating content_templates table...')
    const createContentTemplatesTableSQL = `
      CREATE TABLE IF NOT EXISTS content_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        template_key VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        content_type VARCHAR(50) DEFAULT 'text',
        category VARCHAR(100) DEFAULT 'general',
        language VARCHAR(10) DEFAULT 'en',
        variables JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for content_templates
      CREATE INDEX IF NOT EXISTS content_templates_user_id_idx ON content_templates(user_id);
      CREATE INDEX IF NOT EXISTS content_templates_user_key_idx ON content_templates(user_id, template_key);
      CREATE INDEX IF NOT EXISTS content_templates_user_category_idx ON content_templates(user_id, category);
      CREATE INDEX IF NOT EXISTS content_templates_user_active_idx ON content_templates(user_id, is_active);
      
      -- Add unique constraint for user content templates
      ALTER TABLE content_templates ADD CONSTRAINT content_templates_user_key_unique UNIQUE (user_id, template_key);
    `
    
    await pgClient.query(createContentTemplatesTableSQL)
    console.log('✅ Content templates table created with user-specific constraints')

    // 3. Create theme_settings table for additional theme configurations
    console.log('\n3. Creating theme_settings table...')
    const createThemeSettingsTableSQL = `
      CREATE TABLE IF NOT EXISTS theme_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'string',
        description TEXT,
        is_advanced BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for theme_settings
      CREATE INDEX IF NOT EXISTS theme_settings_user_id_idx ON theme_settings(user_id);
      CREATE INDEX IF NOT EXISTS theme_settings_theme_id_idx ON theme_settings(theme_id);
      CREATE INDEX IF NOT EXISTS theme_settings_user_key_idx ON theme_settings(user_id, setting_key);
      
      -- Add unique constraint for user theme settings
      ALTER TABLE theme_settings ADD CONSTRAINT theme_settings_user_key_unique UNIQUE (user_id, theme_id, setting_key);
    `
    
    await pgClient.query(createThemeSettingsTableSQL)
    console.log('✅ Theme settings table created with user-specific constraints')

    // 4. Create RLS policies for all new tables
    console.log('\n4. Creating RLS policies...')
    const createRLSPoliciesSQL = `
      -- Enable RLS on all new tables
      ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
      ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies for themes table
      CREATE POLICY "Users can view their own themes"
        ON themes FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can create their own themes"
        ON themes FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
      
      CREATE POLICY "Users can update their own themes"
        ON themes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own themes"
        ON themes FOR DELETE USING (auth.uid() = user_id);

      -- Create RLS policies for content_templates table
      CREATE POLICY "Users can view their own content templates"
        ON content_templates FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can create their own content templates"
        ON content_templates FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
      
      CREATE POLICY "Users can update their own content templates"
        ON content_templates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own content templates"
        ON content_templates FOR DELETE USING (auth.uid() = user_id);

      -- Create RLS policies for theme_settings table
      CREATE POLICY "Users can view their own theme settings"
        ON theme_settings FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can create their own theme settings"
        ON theme_settings FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
      
      CREATE POLICY "Users can update their own theme settings"
        ON theme_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own theme settings"
        ON theme_settings FOR DELETE USING (auth.uid() = user_id);
    `
    
    await pgClient.query(createRLSPoliciesSQL)
    console.log('✅ RLS policies created for all theme and content tables')

    // 5. Create triggers for automatic user_id setting
    console.log('\n5. Creating triggers for automatic user_id setting...')
    const createTriggersSQL = `
      -- Create triggers for themes table
      DROP TRIGGER IF EXISTS set_user_id_themes ON themes;
      CREATE TRIGGER set_user_id_themes
        BEFORE INSERT ON themes
        FOR EACH ROW EXECUTE FUNCTION set_user_id();

      -- Create triggers for content_templates table
      DROP TRIGGER IF EXISTS set_user_id_content_templates ON content_templates;
      CREATE TRIGGER set_user_id_content_templates
        BEFORE INSERT ON content_templates
        FOR EACH ROW EXECUTE FUNCTION set_user_id();

      -- Create triggers for theme_settings table
      DROP TRIGGER IF EXISTS set_user_id_theme_settings ON theme_settings;
      CREATE TRIGGER set_user_id_theme_settings
        BEFORE INSERT ON theme_settings
        FOR EACH ROW EXECUTE FUNCTION set_user_id();

      -- Create triggers for updated_at timestamps
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
      CREATE TRIGGER update_themes_updated_at
        BEFORE UPDATE ON themes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_content_templates_updated_at ON content_templates;
      CREATE TRIGGER update_content_templates_updated_at
        BEFORE UPDATE ON content_templates
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_theme_settings_updated_at ON theme_settings;
      CREATE TRIGGER update_theme_settings_updated_at
        BEFORE UPDATE ON theme_settings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
    
    await pgClient.query(createTriggersSQL)
    console.log('✅ Triggers created for automatic user_id and timestamp management')

    // 6. Create default themes and content for existing users
    console.log('\n6. Creating default themes and content for existing users...')
    
    // Get all existing users
    const usersResult = await pgClient.query(`
      SELECT id, email FROM auth.users WHERE role = 'super_admin'
    `)
    
    for (const user of usersResult.rows) {
      console.log(`Creating default theme and content for ${user.email}...`)
      
      // Create default theme
      const defaultThemeSQL = `
        INSERT INTO themes (
          user_id, name, primary_color, secondary_color, accent_color,
          background_color, text_color, border_color, success_color,
          warning_color, error_color, font_family, border_radius
        ) VALUES (
          $1, 'Default Theme', '#3b82f6', '#64748b', '#06b6d4',
          '#ffffff', '#0f172a', '#e2e8f0', '#22c55e',
          '#f59e0b', '#ef4444', 'Inter', 'medium'
        ) ON CONFLICT (user_id, name) DO NOTHING;
      `
      
      await pgClient.query(defaultThemeSQL, [user.id])
      
      // Create default content templates
      const defaultContentTemplates = [
        {
          template_key: 'welcome_message',
          title: 'Welcome Message',
          content: `Welcome to ${user.email.split('@')[0]} payment portal. Please complete your payment securely.`,
          category: 'checkout'
        },
        {
          template_key: 'payment_instructions',
          title: 'Payment Instructions',
          content: 'Please follow the instructions below to complete your payment.',
          category: 'checkout'
        },
        {
          template_key: 'success_message',
          title: 'Success Message',
          content: 'Your payment has been processed successfully. Thank you!',
          category: 'checkout'
        },
        {
          template_key: 'footer_text',
          title: 'Footer Text',
          content: 'Secure payments powered by PXV Pay',
          category: 'general'
        },
        {
          template_key: 'support_contact',
          title: 'Support Contact',
          content: 'For support, please contact us at support@example.com',
          category: 'general'
        }
      ]
      
      for (const template of defaultContentTemplates) {
        const contentSQL = `
          INSERT INTO content_templates (
            user_id, template_key, title, content, category
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, template_key) DO NOTHING;
        `
        
        await pgClient.query(contentSQL, [
          user.id,
          template.template_key,
          template.title,
          template.content,
          template.category
        ])
      }
    }
    
    console.log('✅ Default themes and content created for all existing users')

    console.log('\n🎉 THEME AND CONTENT MANAGEMENT TABLES CREATED SUCCESSFULLY!')
    console.log('\n📋 SUMMARY:')
    console.log('✅ Created themes table with user-specific isolation')
    console.log('✅ Created content_templates table with user-specific isolation')
    console.log('✅ Created theme_settings table for advanced configurations')
    console.log('✅ Applied RLS policies for complete data isolation')
    console.log('✅ Added triggers for automatic user_id and timestamp management')
    console.log('✅ Created default themes and content for existing users')
    console.log('\nMerchants can now customize their themes and content independently!')

  } catch (error) {
    console.error('❌ Error creating theme and content tables:', error)
  } finally {
    await pgClient.end()
    console.log('🔌 Database connection closed')
  }
}

createThemeContentTables() 
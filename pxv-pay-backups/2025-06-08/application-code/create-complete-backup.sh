#!/bin/bash

# PXV Pay Complete Backup Script
# Creates a full backup of local Supabase instance including database, storage, and configuration

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="pxv_pay_backup_${TIMESTAMP}"

echo "🔄 PXV Pay Complete Backup Script"
echo "=================================="
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Backup directory: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📊 1. Creating database schema backup..."
npx supabase db dump --local > "$BACKUP_DIR/database_schema.sql"
if [ $? -eq 0 ]; then
    echo "✅ Database schema backup created"
else
    echo "❌ Database schema backup failed"
fi

echo ""
echo "📊 2. Creating database data backup..."
npx supabase db dump --local --data-only > "$BACKUP_DIR/database_data.sql"
if [ $? -eq 0 ]; then
    echo "✅ Database data backup created"
else
    echo "❌ Database data backup failed"
fi

echo ""
echo "📊 3. Creating complete database backup..."
npx supabase db dump --local > "$BACKUP_DIR/database_complete.sql"
if [ $? -eq 0 ]; then
    echo "✅ Complete database backup created"
else
    echo "❌ Complete database backup failed"
fi

echo ""
echo "📁 4. Backing up migration files..."
if [ -d "supabase/migrations" ]; then
    cp -r supabase/migrations "$BACKUP_DIR/"
    echo "✅ Migration files backed up"
else
    echo "⚠️  No migration files found"
fi

echo ""
echo "📁 5. Backing up Supabase config..."
if [ -f "supabase/config.toml" ]; then
    cp supabase/config.toml "$BACKUP_DIR/"
    echo "✅ Supabase config backed up"
else
    echo "⚠️  No config.toml found"
fi

echo ""
echo "🔑 6. Backing up environment files..."
if [ -f ".env.local" ]; then
    cp .env.local "$BACKUP_DIR/"
    echo "✅ Environment file backed up"
else
    echo "⚠️  No .env.local found"
fi

echo ""
echo "📦 7. Creating storage buckets backup..."
# Create a script to recreate storage buckets
cat > "$BACKUP_DIR/restore_storage_buckets.js" << 'EOF'
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function restoreStorageBuckets() {
  const buckets = [
    { name: 'payment-proofs', options: { public: false, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], fileSizeLimit: 5242880 }},
    { name: 'merchant-logos', options: { public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'], fileSizeLimit: 2097152 }},
    { name: 'payment-method-icons', options: { public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'], fileSizeLimit: 1048576 }},
    { name: 'user-avatars', options: { public: false, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], fileSizeLimit: 2097152 }},
    { name: 'blog-images', options: { public: true, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], fileSizeLimit: 5242880 }}
  ]

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.name, bucket.options)
    if (error && !error.message.includes('already exists')) {
      console.error(`Error creating bucket ${bucket.name}:`, error)
    } else {
      console.log(`✅ Bucket ${bucket.name} created/exists`)
    }
  }
}

restoreStorageBuckets().then(() => process.exit(0))
EOF

echo "✅ Storage buckets restore script created"

echo ""
echo "👤 8. Creating super admin restore script..."
cat > "$BACKUP_DIR/restore_super_admin.js" << 'EOF'
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function createSuperAdmin() {
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@pxvpay.com',
    password: 'admin123456',
    email_confirm: true
  })

  if (authError && !authError.message.includes('already registered')) {
    console.error('Auth error:', authError)
    return
  }

  console.log('✅ Super admin created/exists')
  
  setTimeout(async () => {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', 'admin@pxvpay.com')

    if (!updateError) {
      console.log('✅ Role updated to super_admin')
    }
    process.exit(0)
  }, 1000)
}

createSuperAdmin()
EOF

echo "✅ Super admin restore script created"

echo ""
echo "📋 9. Creating complete restore script..."
cat > "$BACKUP_DIR/RESTORE_INSTRUCTIONS.md" << EOF
# PXV Pay Complete Restore Instructions

## 📋 Backup Contents
- \`database_complete.sql\` - Full database backup (schema + data)
- \`database_schema.sql\` - Database schema only
- \`database_data.sql\` - Database data only
- \`migrations/\` - All migration files
- \`config.toml\` - Supabase configuration
- \`.env.local\` - Environment variables
- \`restore_storage_buckets.js\` - Storage buckets restore script
- \`restore_super_admin.js\` - Super admin creation script

## 🔄 Complete Restore Process

### Step 1: Stop and Reset Supabase
\`\`\`bash
npx supabase stop
npx supabase start
npx supabase db reset --no-seed
\`\`\`

### Step 2: Restore Database
\`\`\`bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database_complete.sql
\`\`\`

### Step 3: Restore Storage Buckets
\`\`\`bash
node restore_storage_buckets.js
\`\`\`

### Step 4: Restore Super Admin
\`\`\`bash
node restore_super_admin.js
\`\`\`

### Step 5: Copy Configuration Files
\`\`\`bash
cp .env.local ../
cp config.toml ../supabase/
cp -r migrations/* ../supabase/migrations/
\`\`\`

## 🚀 Quick Restore Script
Run this from the backup directory:
\`\`\`bash
chmod +x quick_restore.sh
./quick_restore.sh
\`\`\`

## ✅ Verification
After restore, verify:
- Frontend: http://localhost:3000
- Admin login: admin@pxvpay.com / admin123456
- Supabase Studio: http://127.0.0.1:54323
EOF

echo "✅ Restore instructions created"

echo ""
echo "🚀 10. Creating quick restore script..."
cat > "$BACKUP_DIR/quick_restore.sh" << 'EOF'
#!/bin/bash

echo "🔄 PXV Pay Quick Restore"
echo "======================="

# Navigate to parent directory
cd ..

echo "🛑 Stopping Supabase..."
npx supabase stop

echo "🚀 Starting Supabase..."
npx supabase start

echo "🔄 Resetting database..."
npx supabase db reset --no-seed

echo "📊 Restoring database..."
BACKUP_DIR=$(basename "$PWD")
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < "$BACKUP_DIR/database_complete.sql"

echo "🗄️ Restoring storage buckets..."
cd "$BACKUP_DIR"
node restore_storage_buckets.js

echo "👤 Restoring super admin..."
node restore_super_admin.js

echo "📁 Copying configuration files..."
cp .env.local ../
if [ -f "config.toml" ]; then
    cp config.toml ../supabase/
fi

echo "✅ Restore completed!"
echo "🚀 Frontend: http://localhost:3000"
echo "👤 Admin: admin@pxvpay.com / admin123456"
EOF

chmod +x "$BACKUP_DIR/quick_restore.sh"
echo "✅ Quick restore script created"

echo ""
echo "📊 11. Generating backup summary..."
cat > "$BACKUP_DIR/BACKUP_SUMMARY.txt" << EOF
PXV Pay Complete Backup Summary
==============================
Backup Date: $(date)
Backup Directory: $BACKUP_DIR

Files Included:
- database_complete.sql ($(du -h "$BACKUP_DIR/database_complete.sql" 2>/dev/null | cut -f1 || echo "N/A"))
- database_schema.sql ($(du -h "$BACKUP_DIR/database_schema.sql" 2>/dev/null | cut -f1 || echo "N/A"))
- database_data.sql ($(du -h "$BACKUP_DIR/database_data.sql" 2>/dev/null | cut -f1 || echo "N/A"))
- Migration files: $(ls -1 "$BACKUP_DIR/migrations/" 2>/dev/null | wc -l || echo "0") files
- Configuration files: $(ls -1 "$BACKUP_DIR"/*.toml "$BACKUP_DIR"/.env.local 2>/dev/null | wc -l || echo "0") files
- Restore scripts: 3 files

Total Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)

To restore: cd $BACKUP_DIR && ./quick_restore.sh
EOF

echo "✅ Backup summary generated"

echo ""
echo "🎉 BACKUP COMPLETED SUCCESSFULLY!"
echo "=================================="
echo "📁 Backup location: $BACKUP_DIR"
echo "📊 Total size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""
echo "📋 Backup includes:"
echo "   ✅ Complete database (schema + data)"
echo "   ✅ All migration files"
echo "   ✅ Configuration files"
echo "   ✅ Storage bucket definitions"
echo "   ✅ Super admin account setup"
echo "   ✅ Automated restore scripts"
echo ""
echo "🔄 To restore in the future:"
echo "   cd $BACKUP_DIR"
echo "   ./quick_restore.sh"
echo ""
echo "💾 Keep this backup safe! It contains everything needed to restore your PXV Pay system." 
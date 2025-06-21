# PXV Pay Complete Restore Instructions

## 📋 Backup Contents
- `database_complete.sql` - Full database backup (schema + data)
- `database_schema.sql` - Database schema only
- `database_data.sql` - Database data only
- `migrations/` - All migration files
- `config.toml` - Supabase configuration
- `.env.local` - Environment variables
- `restore_storage_buckets.js` - Storage buckets restore script
- `restore_super_admin.js` - Super admin creation script

## 🔄 Complete Restore Process

### Step 1: Stop and Reset Supabase
```bash
npx supabase stop
npx supabase start
npx supabase db reset --no-seed
```

### Step 2: Restore Database
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database_complete.sql
```

### Step 3: Restore Storage Buckets
```bash
node restore_storage_buckets.js
```

### Step 4: Restore Super Admin
```bash
node restore_super_admin.js
```

### Step 5: Copy Configuration Files
```bash
cp .env.local ../
cp config.toml ../supabase/
cp -r migrations/* ../supabase/migrations/
```

## 🚀 Quick Restore Script
Run this from the backup directory:
```bash
chmod +x quick_restore.sh
./quick_restore.sh
```

## ✅ Verification
After restore, verify:
- Frontend: http://localhost:3000
- Admin login: admin@pxvpay.com / admin123456
- Supabase Studio: http://127.0.0.1:54323

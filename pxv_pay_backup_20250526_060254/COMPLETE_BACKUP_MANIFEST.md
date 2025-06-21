# PXV Pay Complete Backup Manifest
**Backup Date:** May 26, 2025 06:02:57 PDT  
**Backup ID:** pxv_pay_backup_20250526_060254  
**Total Size:** ~300KB

## 🗄️ Database Backups

### Core Database Files
- **`database_complete.sql`** (56KB) - Full database dump with schema and data
- **`database_schema.sql`** (56KB) - Database structure only
- **`database_data.sql`** (28KB) - Data only (for selective restoration)

### Migration Files (21 files)
- `00000000000000_initial.sql` - Initial database setup
- `01_initial_schema.sql` - Core schema definition
- `02_add_payment_method_fields.sql` - Payment method enhancements
- `03_basic_payment_methods.sql` - Basic payment methods setup
- `04_blog_posts.sql` - Blog system tables
- `05_user_specific_data.sql` - User data structures
- `20250101000001_checkout_system_foundation.sql` - Checkout system base
- `20250101000002_checkout_enhancements.sql` - Checkout improvements
- `20250101000003_public_checkout_access.sql` - Public checkout access
- `20250101000004_checkout_links_enhancements.sql` - Checkout links features
- `20250101000005_user_limits_system.sql` - User limits and restrictions
- `20250523120000_fix_notifications_and_auth.sql` - Auth system fixes
- `20250523230000_emergency_restoration.sql` - Emergency restoration
- `20250523240000_create_theme_tables.sql` - Theme system tables
- `20250523250000_add_custom_fields_column.sql` - Custom fields support
- `20250524_fix_users_rls.sql` - User RLS fixes
- `20250525000000_add_super_admin_policies.sql` - Super admin policies
- `20250525120000_fix_rls_infinite_recursion.sql` - RLS recursion fixes
- `20250526000000_add_currency_id_to_countries.sql` - Currency relationships
- `20250527000000_remove_global_constraints.sql` - Constraint optimization
- `1748039386918_fix_rls_recursion.sql` - Additional RLS fixes

## ⚙️ Configuration Files

### Supabase Configuration
- **`config.toml`** (11KB) - Complete Supabase local configuration
- **`.env.local`** - Environment variables and secrets

### Application Configuration
- **`package.json`** - Node.js dependencies and scripts
- **`package-lock.json`** - Exact dependency versions

## 🔧 Restoration Scripts

### Automated Restoration
- **`quick_restore.sh`** - One-command complete restoration
- **`RESTORE_INSTRUCTIONS.md`** - Detailed manual restoration guide

### Component Restoration
- **`restore_storage_buckets.js`** - Recreates all storage buckets:
  - `payment-proofs` (private, 5MB limit)
  - `merchant-logos` (public, 2MB limit)
  - `payment-method-icons` (public, 1MB limit)
  - `user-avatars` (private, 2MB limit)
  - `blog-images` (public, 5MB limit)

- **`restore_super_admin.js`** - Recreates super admin account:
  - Email: admin@pxvpay.com
  - Role: super_admin
  - Auto-confirms email

## 📁 Additional Backups

### Code Libraries
- **`supabase_lib_backup/`** - Supabase client libraries and utilities
  - Database client configurations
  - Authentication helpers
  - API utilities
  - Public client setup

### Type Definitions
- **`types_backup/`** - TypeScript type definitions
  - Database table types
  - API response types
  - Component prop types
  - Checkout system types

## 🔐 Security Notes

### Included Sensitive Data
- Database with all user data and configurations
- Environment variables (review before sharing)
- Admin account credentials
- Storage bucket policies

### RLS Policies Backed Up
- User data access controls
- Admin-only table restrictions
- Public checkout access rules
- Storage bucket security policies

## 🚀 Quick Restoration Commands

```bash
# Complete restoration (from backup directory)
./quick_restore.sh

# Manual step-by-step restoration
npx supabase stop
npx supabase start
npx supabase db reset --no-seed
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database_complete.sql
node restore_storage_buckets.js
node restore_super_admin.js
```

## 📊 Database Tables Included

### Core Tables
- `users` - User accounts and profiles
- `countries` - Supported countries
- `currencies` - Supported currencies
- `payment_methods` - Payment method configurations
- `checkout_links` - Checkout link management
- `checkout_sessions` - Checkout session tracking

### Admin Tables
- `blog_posts` - Blog content management
- `themes` - Theme configurations
- `audit_logs` - System audit trail
- `notifications` - User notifications

### Storage Tables
- Storage bucket configurations
- File upload policies
- Access control rules

## ✅ Verification Checklist

- [x] Database schema completely backed up
- [x] All user data preserved
- [x] Migration history maintained
- [x] Configuration files saved
- [x] Storage bucket definitions included
- [x] Admin account restoration script ready
- [x] Type definitions preserved
- [x] Supabase client libraries backed up
- [x] Automated restoration scripts tested
- [x] Manual restoration instructions provided

---

**⚠️ Important:** This backup contains sensitive data including user information and system credentials. Store securely and limit access appropriately.

**🔄 Restoration Support:** If you encounter issues during restoration, refer to `RESTORE_INSTRUCTIONS.md` for detailed troubleshooting steps. 
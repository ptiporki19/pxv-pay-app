# PXV Pay - Complete Deployment Guide

This guide contains everything needed to deploy PXV Pay on a new computer with **exactly the same state** as the current system.

## 📋 Prerequisites

Before starting, ensure you have these installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase CLI**
- **pnpm** (recommended for this project)

### Install Prerequisites

```bash
# Install Node.js (if not installed)
# Download from https://nodejs.org/

# Install Supabase CLI
npm install -g supabase

# Install pnpm
npm install -g pnpm
```

## 🚀 Step-by-Step Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/ptiporki19/combo-1.git
cd combo-1
```

### 2. Initialize Submodules

```bash
git submodule init
git submodule update
```

### 3. Set Up Main Project

```bash
# Install dependencies
npm install

# Copy environment file template
cp .env.example .env.local
```

### 4. Set Up PXV Pay Application

```bash
cd pxv-pay

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env.local
cp .env.example .env
```

### 5. Configure Environment Variables

Edit both `.env` and `.env.local` files in the `pxv-pay` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_postgresql_connection_string

# NextAuth (if using)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Other configuration
NODE_ENV=development
```

### 6. Restore Database and Application State

The most recent backup is: `pxv_pay_backup_20250604_073412`

```bash
# Navigate to the backup directory
cd pxv_pay_backup_20250604_073412

# Run the quick restore script
./quick_restore.sh
```

This will:
- ✅ Set up the complete database schema
- ✅ Restore all data exactly as it was
- ✅ Create storage buckets
- ✅ Set up RLS policies
- ✅ Create the super admin account
- ✅ Import all migration history

### 7. Start the Application

```bash
# Go back to pxv-pay directory
cd ../

# Start Supabase local development
supabase start

# In a new terminal, start the Next.js application
pnpm dev
```

The application will be available at: `http://localhost:3000`

## 🔐 Access Information

### Super Admin Account
- **Email**: admin@pxvpay.com
- **Password**: admin123!
- **Role**: super_admin

### Test Accounts
The backup includes various user accounts with different roles for testing.

## 📁 File Structure Overview

```
combo-1/
├── pxv-pay/                    # Main application (submodule)
│   ├── src/                    # Source code
│   ├── supabase/              # Database migrations & config
│   ├── pxv_pay_backup_**/     # Database backups
│   └── components/            # UI components
├── src/                       # Additional components
├── .cursor/                   # Cursor IDE rules & config
├── test files (*.js)          # Testing scripts
└── Documentation files
```

## 🎯 Key Features Included

- **Complete Admin Dashboard** with platform management
- **User Management System** with RBAC
- **Payment Processing** with multiple payment methods
- **Blog Management System** with file uploads
- **Theme Customization** (dark/light mode)
- **Content Management** with templates
- **Audit Logging** system
- **Real-time Notifications**
- **Responsive UI** with Shadcn components

## 🔧 Configuration Details

### Database Schema
- Users with role-based access control
- Payment methods and transactions
- Countries and currencies
- Blog posts and content
- Audit logs and system tracking
- Theme and customization settings

### Security Features
- Row Level Security (RLS) enabled
- JWT-based authentication
- Role-based permissions
- Secure file upload handling

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   ```bash
   # Check if Supabase is running
   supabase status
   
   # Restart if needed
   supabase stop
   supabase start
   ```

2. **Environment Variables Not Set**
   - Ensure `.env` and `.env.local` are properly configured
   - Verify all required variables are set

3. **Database Migration Issues**
   ```bash
   # Reset and restore from backup
   supabase db reset
   cd pxv_pay_backup_20250604_073412
   ./quick_restore.sh
   ```

4. **Permission Issues**
   ```bash
   # Make scripts executable
   chmod +x *.sh
   ```

## 📊 Verification Checklist

After deployment, verify these work:

- [ ] Login with super admin account
- [ ] Access all admin dashboard sections
- [ ] User management functionality
- [ ] Payment methods configuration
- [ ] Blog post creation and editing
- [ ] Theme switching (dark/light)
- [ ] File upload functionality
- [ ] Audit logs display correctly
- [ ] All navigation links work
- [ ] Responsive design on different screen sizes

## 🔄 Updating the Application

To get the latest changes:

```bash
# Update main repository
git pull origin main

# Update submodule
git submodule update --remote

# Reinstall dependencies if needed
cd pxv-pay
pnpm install
```

## 📞 Support

If you encounter issues:

1. Check the backup verification script: `verify_backup.sh`
2. Review the restore logs for errors
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set

## 🎉 Success!

Once completed, you'll have a **pixel-perfect replica** of the original PXV Pay application with:
- All database records preserved
- User accounts and permissions intact
- All customizations and themes
- Complete audit trail
- All uploaded files and configurations

The application state will be **exactly identical** to the original system. 
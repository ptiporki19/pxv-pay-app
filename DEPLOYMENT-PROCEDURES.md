# PXV Pay - Complete Deployment & Development Procedures

## 📋 **Quick Reference Guide**

This document consolidates all procedures for development, deployment, backup, and maintenance of PXV Pay v1.0.

---

## 🚀 **Production Deployment Procedure**

### **Pre-Deployment Checklist**
```bash
# 1. Run deployment verification
node deployment-checklist.js

# 2. Ensure you're on main branch
git checkout main
git pull origin main

# 3. Verify build works
npm run build

# 4. Create backup before deployment
node backup-system/comprehensive-backup.js
```

### **Deployment Steps**

#### **Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_SITE_URL
```

#### **Option B: Netlify**
```bash
# Build for production
npm run build

# Deploy to Netlify
# 1. Connect GitHub repository
# 2. Set build command: npm run build
# 3. Set publish directory: .next
# 4. Configure environment variables
```

#### **Option C: Railway/Render**
```bash
# Connect GitHub repository
# Configure auto-deploy from main branch
# Set environment variables in platform dashboard
```

### **Post-Deployment Verification**
```bash
# Check application health
curl https://your-domain.com/api/ping
curl https://your-domain.com/api/status

# Test authentication flow
# Test payment creation
# Test admin dashboard access
# Verify super admin functionality
```

---

## 🌿 **Development Workflow**

### **Starting New Feature**
```bash
# Switch to development branch
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/feature-name
git push origin feature/feature-name

# Work on feature...
git add .
git commit -m "feat: add new functionality"
git push origin feature/feature-name
```

### **Feature Completion**
```bash
# Create Pull Request: feature/feature-name → development
# After review and testing in development:

# Merge to development
git checkout development
git merge feature/feature-name
git push origin development

# When ready for production:
# Create Pull Request: development → main
```

### **Hotfix Procedure**
```bash
# For critical production issues
git checkout main
git pull origin main
git checkout -b hotfix/issue-description

# Fix the issue
git add .
git commit -m "hotfix: resolve critical issue"
git push origin hotfix/issue-description

# Create PR directly to main
# After merge, sync back to development
git checkout development
git merge main
git push origin development
```

---

## 💾 **Backup Procedures**

### **Create Comprehensive Backup**
```bash
# Run backup system
node backup-system/comprehensive-backup.js

# Backup location: ../pxv-pay-backups/YYYY-MM-DD/
# Contains:
# - Complete application code
# - Configuration files
# - Environment templates
# - Restoration scripts
```

### **Restore from Backup**
```bash
# Navigate to backup restoration scripts
cd ../pxv-pay-backups/YYYY-MM-DD/restoration-scripts/

# Run restoration
node restore-app.js [target-directory]

# Follow post-restoration steps:
# 1. Configure .env.local
# 2. Install dependencies: npm install
# 3. Start application: npm run dev
```

### **Database Backup (Manual)**
```bash
# Export Supabase data (using Supabase CLI)
supabase db dump --file backup.sql

# Import to new project
supabase db reset --file backup.sql
```

---

## 🗃️ **Database Management**

### **Production Database Setup**
```sql
-- 1. Create Supabase production project
-- 2. Run initial migration
-- File: supabase/seed.sql

-- 3. Create super admin user
-- File: make-user-super-admin.sql
-- Update email to your production admin email

-- 4. Verify RLS policies are active
-- 5. Test authentication flows
```

### **Database Migrations**
```bash
# For schema changes, use Supabase dashboard or:
# Create migration file in supabase/migrations/
# Apply via Supabase CLI or dashboard

# For data changes, create script and run via API
```

---

## 🔧 **Environment Management**

### **Development Environment**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_dev_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### **Production Environment**
```env
# Platform environment variables
NEXT_PUBLIC_SUPABASE_URL=your_prod_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

### **Staging Environment** (Optional)
```env
# For testing before production
NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_key
NEXT_PUBLIC_SITE_URL=https://staging.your-domain.com
NODE_ENV=staging
```

---

## 🛠️ **Development Commands**

### **Daily Development**
```bash
# Start development server
npm run dev

# Run build test
npm run build

# Install new dependencies
npm install package-name

# Update dependencies
npm update

# Check for vulnerabilities
npm audit
npm audit fix
```

### **Code Quality**
```bash
# Format code (if prettier configured)
npm run format

# Lint code (if eslint configured)
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🔍 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit
```

#### **Database Connection Issues**
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test connection
curl -H "apikey: YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/users?select=id"

# Check Supabase project status in dashboard
```

#### **Authentication Problems**
```bash
# Clear browser storage
# Check RLS policies in Supabase
# Verify JWT secret configuration
# Test with different user accounts
```

#### **Deployment Failures**
```bash
# Check deployment logs
# Verify environment variables
# Test build locally first
# Check platform-specific requirements
```

---

## 📊 **Monitoring & Maintenance**

### **Production Monitoring**
```bash
# Application health checks
curl https://your-domain.com/api/ping
curl https://your-domain.com/api/status

# Database monitoring via Supabase dashboard
# Error tracking via platform logs
# Performance monitoring via analytics
```

### **Regular Maintenance**
```bash
# Weekly: Update dependencies
npm update

# Monthly: Security audit
npm audit

# Monthly: Create backup
node backup-system/comprehensive-backup.js

# Quarterly: Review and cleanup branches
git branch -d feature/old-feature
git push origin --delete feature/old-feature
```

---

## 🚨 **Emergency Procedures**

### **Production Issue Response**
```bash
# 1. Identify the issue
# 2. Check application logs
# 3. Verify database status
# 4. Create hotfix branch
git checkout main
git checkout -b hotfix/emergency-fix

# 5. Implement fix
# 6. Test locally
# 7. Create PR to main
# 8. Deploy immediately after review
```

### **Rollback Procedure**
```bash
# Option 1: Revert last commit
git checkout main
git revert HEAD
git push origin main

# Option 2: Deploy previous version
git checkout main
git reset --hard PREVIOUS_COMMIT_HASH
git push origin main --force-with-lease

# Option 3: Restore from backup
cd ../pxv-pay-backups/YYYY-MM-DD/restoration-scripts/
node restore-app.js ../emergency-restore
# Deploy emergency-restore
```

---

## 📞 **Support & Contacts**

### **Technical Issues**
- **Repository**: https://github.com/ptiporki19/combo-1
- **Documentation**: Check GIT-WORKFLOW.md
- **Backup Location**: ../pxv-pay-backups/

### **Production Environment**
- **Hosting Platform**: [Your chosen platform]
- **Database**: Supabase Production Project
- **Domain**: [Your production domain]
- **Monitoring**: [Your monitoring solution]

---

## 📚 **Additional Resources**

### **Documentation Files**
- `README.md` - Basic setup instructions
- `GIT-WORKFLOW.md` - Detailed Git workflow
- `DEPLOYMENT-PROCEDURES.md` - This file
- `ENVIRONMENT-RULES.md` - Environment identification rules

### **Scripts & Tools**
- `deployment-checklist.js` - Pre-deployment verification
- `backup-system/comprehensive-backup.js` - Backup creation
- `restoration-scripts/restore-app.js` - Application restoration

### **External Resources**
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

**Last Updated**: Production v1.0 - Ready for deployment  
**Next Review**: After first production deployment  
**Emergency Contact**: [Your contact information] 
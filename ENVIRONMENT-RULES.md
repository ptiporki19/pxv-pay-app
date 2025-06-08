# PXV Pay - Environment Rules & Guidelines

## 🌍 **Environment Identification System**

This document helps identify which environment you're working in and provides environment-specific rules and guidelines.

---

## 🏷️ **Environment Types**

### **📍 Development Environment**
**Indicators:**
- `NODE_ENV=development` in `.env.local`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- Git branch: `development`, `feature/*`
- Supabase URL contains: `dev`, `staging`, or test project
- Running on: `localhost:3000` or `localhost:3009`

**Rules:**
- ✅ Experimental features allowed
- ✅ Database changes permitted
- ✅ Direct commits to feature branches
- ✅ Console logs acceptable
- ✅ Test data manipulation allowed
- ❌ No user data privacy concerns
- ❌ No performance optimization required

### **🎭 Staging Environment** (Optional)
**Indicators:**
- `NODE_ENV=staging` or `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://staging.your-domain.com`
- Git branch: `development`
- Separate Supabase staging project
- Running on staging server

**Rules:**
- ✅ Feature testing before production
- ✅ Production-like data testing
- ✅ Performance testing
- ❌ No experimental features
- ❌ No console logs
- ❌ No direct database manipulation
- ❌ No test data in production format

### **🚀 Production Environment**
**Indicators:**
- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- Git branch: `main` only
- Production Supabase project
- Running on production server (Vercel, Netlify, etc.)

**Rules:**
- ✅ Only tested, reviewed code
- ✅ Monitoring and logging essential
- ✅ Backup before any changes
- ❌ No direct code changes
- ❌ No experimental features
- ❌ No console logs or debug code
- ❌ No direct database access
- ❌ No test data or accounts

---

## 🔍 **Environment Detection Script**

Create this file to automatically detect your current environment:

### **environment-detector.js**
```javascript
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

class EnvironmentDetector {
  constructor() {
    this.indicators = {
      environment: 'unknown',
      branch: this.getCurrentBranch(),
      nodeEnv: process.env.NODE_ENV || 'not-set',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not-set',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not-set',
      port: process.env.PORT || '3000'
    };
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  detectEnvironment() {
    const { branch, nodeEnv, siteUrl, supabaseUrl } = this.indicators;

    // Production Environment
    if (
      nodeEnv === 'production' &&
      siteUrl.includes('https://') &&
      !siteUrl.includes('localhost') &&
      !siteUrl.includes('staging') &&
      branch === 'main'
    ) {
      this.indicators.environment = 'production';
      return 'production';
    }

    // Staging Environment
    if (
      (nodeEnv === 'staging' || nodeEnv === 'production') &&
      (siteUrl.includes('staging') || supabaseUrl.includes('staging'))
    ) {
      this.indicators.environment = 'staging';
      return 'staging';
    }

    // Development Environment
    if (
      nodeEnv === 'development' ||
      siteUrl.includes('localhost') ||
      branch.startsWith('feature/') ||
      branch === 'development'
    ) {
      this.indicators.environment = 'development';
      return 'development';
    }

    return 'unknown';
  }

  showEnvironmentInfo() {
    const env = this.detectEnvironment();
    
    console.log('🌍 PXV Pay Environment Detection');
    console.log('================================');
    console.log(`🏷️  Environment: ${env.toUpperCase()}`);
    console.log(`🌿 Git Branch: ${this.indicators.branch}`);
    console.log(`⚙️  NODE_ENV: ${this.indicators.nodeEnv}`);
    console.log(`🌐 Site URL: ${this.indicators.siteUrl}`);
    console.log(`🗃️  Supabase: ${this.indicators.supabaseUrl.substring(0, 50)}...`);
    console.log('');

    this.showEnvironmentRules(env);
    this.showEnvironmentWarnings(env);
  }

  showEnvironmentRules(env) {
    console.log(`📋 ${env.toUpperCase()} Environment Rules:`);
    console.log('----------------------------');

    switch (env) {
      case 'development':
        console.log('✅ Experimental features allowed');
        console.log('✅ Database changes permitted');
        console.log('✅ Direct commits to feature branches');
        console.log('✅ Console logs acceptable');
        console.log('✅ Test data manipulation allowed');
        break;

      case 'staging':
        console.log('✅ Feature testing before production');
        console.log('✅ Production-like data testing');
        console.log('❌ No experimental features');
        console.log('❌ No console logs');
        console.log('❌ No direct database manipulation');
        break;

      case 'production':
        console.log('✅ Only tested, reviewed code');
        console.log('✅ Monitoring and logging essential');
        console.log('✅ Backup before any changes');
        console.log('❌ No direct code changes');
        console.log('❌ No experimental features');
        console.log('❌ No console logs or debug code');
        break;

      default:
        console.log('⚠️ Environment not properly configured');
        console.log('📖 Check ENVIRONMENT-RULES.md for setup');
    }
    console.log('');
  }

  showEnvironmentWarnings(env) {
    console.log('⚠️  Important Warnings:');
    console.log('---------------------');

    if (env === 'production') {
      console.log('🚨 PRODUCTION ENVIRONMENT DETECTED!');
      console.log('   - All changes must go through proper Git workflow');
      console.log('   - Create backup before any deployments');
      console.log('   - Test changes in development first');
      console.log('   - Monitor application after changes');
    } else if (env === 'staging') {
      console.log('🎭 STAGING ENVIRONMENT DETECTED');
      console.log('   - Test thoroughly before promoting to production');
      console.log('   - Use production-like data');
      console.log('   - Performance test all features');
    } else if (env === 'development') {
      console.log('🔧 DEVELOPMENT ENVIRONMENT');
      console.log('   - Remember to test builds before committing');
      console.log('   - Follow Git workflow for feature development');
      console.log('   - Don\'t commit sensitive data');
    } else {
      console.log('❓ UNKNOWN ENVIRONMENT');
      console.log('   - Configure environment variables properly');
      console.log('   - Check .env.local file');
      console.log('   - Verify Git branch');
    }
  }
}

// Run detector
new EnvironmentDetector().showEnvironmentInfo();
```

---

## 🛡️ **Environment-Specific Security Rules**

### **Development Security**
```bash
# Allowed in development:
- Test user accounts with fake data
- Console.log statements for debugging
- Direct database queries for testing
- Experimental API endpoints
- Mock payment data

# Still not allowed:
- Real user personal data
- Production API keys in code
- Hardcoded passwords
- Committing .env files
```

### **Staging Security**
```bash
# Required in staging:
- Production-like security measures
- Real SSL certificates
- Proper environment variables
- No debug information in responses
- Sanitized test data only

# Extra precautions:
- Monitor for data leaks
- Test authentication thoroughly
- Verify all security headers
- Check CORS configuration
```

### **Production Security**
```bash
# Mandatory in production:
- HTTPS only
- Secure environment variables
- No debug information exposed
- Proper error handling
- Comprehensive logging
- Regular security audits
- Backup and recovery procedures

# Zero tolerance for:
- Debug code in production
- Test accounts in production
- Insecure configurations
- Unencrypted data transmission
```

---

## 📋 **Environment Checklist**

### **Before Working in Any Environment**
```bash
# 1. Detect current environment
node environment-detector.js

# 2. Verify you're on correct branch
git branch --show-current

# 3. Check environment variables
cat .env.local

# 4. Verify database connection
npm run dev
# Test basic functionality

# 5. Confirm backup exists (for staging/production)
ls ../pxv-pay-backups/
```

### **Development Environment Setup**
```bash
# 1. Create .env.local with development settings
# 2. Install dependencies: npm install
# 3. Start dev server: npm run dev
# 4. Create/switch to feature branch
# 5. Begin development work
```

### **Production Environment Access**
```bash
# 1. Ensure on main branch
git checkout main
git pull origin main

# 2. Create backup first
node backup-system/comprehensive-backup.js

# 3. Run deployment checklist
node deployment-checklist.js

# 4. Proceed with caution
```

---

## 🔄 **Environment Transition Rules**

### **Development → Staging**
```bash
# Requirements:
✅ All tests pass
✅ Code review completed
✅ Build works without errors
✅ No console.log statements
✅ Environment variables updated
✅ Feature branch merged to development

# Process:
1. git checkout development
2. git pull origin development
3. Deploy to staging environment
4. Run full test suite
5. Performance testing
```

### **Staging → Production**
```bash
# Requirements:
✅ Staging tests pass completely
✅ Performance benchmarks met
✅ Security scan completed
✅ Backup created
✅ Rollback plan prepared
✅ Monitoring configured

# Process:
1. Create PR: development → main
2. Code review and approval
3. Merge to main
4. Deploy to production
5. Monitor closely
```

### **Emergency Production Access**
```bash
# Only for critical issues:
1. Create hotfix branch from main
2. Implement minimal fix
3. Test locally
4. Create PR for review
5. Deploy after approval
6. Monitor immediately
7. Sync changes back to development
```

---

## 📊 **Environment Monitoring**

### **Development Monitoring**
- Local error logs
- Browser console
- Network tab debugging
- Database queries in Supabase dashboard

### **Staging Monitoring**
- Application logs
- Performance metrics
- Error tracking
- User flow testing
- Load testing results

### **Production Monitoring**
- Real-time error tracking
- Performance monitoring
- User analytics
- Server health checks
- Database performance
- Security monitoring
- Uptime monitoring

---

## 🚨 **Emergency Environment Procedures**

### **Development Issues**
```bash
# Safe to experiment with fixes
1. Try different approaches
2. Reset database if needed
3. Restore from backup if necessary
4. Ask for help without hesitation
```

### **Staging Issues**
```bash
# Controlled problem solving
1. Document the issue
2. Test fixes in development first
3. Apply minimal fixes to staging
4. Verify fix works
5. Document solution for production
```

### **Production Issues**
```bash
# Critical response protocol
1. Assess impact immediately
2. Notify team/stakeholders
3. Create hotfix branch
4. Implement minimal fix
5. Test fix thoroughly
6. Deploy with monitoring
7. Verify fix works
8. Document incident
9. Plan long-term solution
```

---

**Usage Instructions:**
```bash
# Add to package.json scripts:
"scripts": {
  "env:check": "node environment-detector.js",
  "env:rules": "cat ENVIRONMENT-RULES.md"
}

# Quick environment check:
npm run env:check

# View environment rules:
npm run env:rules
```

---

**Last Updated**: Production v1.0  
**Review Schedule**: Monthly environment rule updates  
**Contact**: [Your technical lead contact] 
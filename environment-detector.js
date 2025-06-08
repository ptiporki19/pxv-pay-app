#!/usr/bin/env node

const { execSync } = require('child_process');

class EnvironmentDetector {
  constructor() {
    this.branch = this.getCurrentBranch();
    this.nodeEnv = process.env.NODE_ENV || 'not-set';
    this.siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'not-set';
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  detectEnvironment() {
    if (this.nodeEnv === 'production' && this.branch === 'main') {
      return 'production';
    }
    if (this.nodeEnv === 'development' || this.siteUrl.includes('localhost')) {
      return 'development';
    }
    return 'unknown';
  }

  showInfo() {
    const env = this.detectEnvironment();
    console.log('🌍 PXV Pay Environment Detection');
    console.log('================================');
    console.log(`Environment: ${env.toUpperCase()}`);
    console.log(`Git Branch: ${this.branch}`);
    console.log(`NODE_ENV: ${this.nodeEnv}`);
    console.log(`Site URL: ${this.siteUrl}`);
    console.log('');
    
    if (env === 'production') {
      console.log('🚨 PRODUCTION ENVIRONMENT!');
      console.log('- Create backup before changes');
      console.log('- NO DIRECT CHANGES TO CODE!');
      console.log('- Use hotfix branch for emergencies');
    } else if (env === 'development') {
      console.log('🔧 DEVELOPMENT ENVIRONMENT');
      console.log('- Safe to experiment');
      console.log('- Test builds before committing');
      console.log('- Follow Git workflow');
    } else {
      console.log('❓ UNKNOWN ENVIRONMENT');
      console.log('- Configure environment variables');
      console.log('- Check .env.local file');
    }
    
    console.log('');
    console.log('📚 Quick Commands:');
    if (env === 'production') {
      console.log('node backup-system/comprehensive-backup.js');
      console.log('node deployment-checklist.js');
    } else {
      console.log('npm run dev');
      console.log('npm run build');
      console.log('node deployment-checklist.js');
    }
  }
}

new EnvironmentDetector().showInfo(); 
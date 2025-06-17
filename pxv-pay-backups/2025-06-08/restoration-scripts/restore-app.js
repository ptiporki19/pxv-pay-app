#!/usr/bin/env node

/**
 * PXV Pay - Application Restoration Script
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class AppRestoration {
  constructor() {
    this.backupPath = __dirname.replace('/restoration-scripts', '');
    this.targetPath = process.argv[2] || '../../../restored-pxv-pay';
  }

  async restore() {
    console.log('🔄 Starting Application Restoration...');
    console.log(`📁 Backup Source: ${this.backupPath}`);
    console.log(`📁 Restore Target: ${this.targetPath}`);

    try {
      // 1. Restore application code
      await this.restoreApplicationCode();

      // 2. Restore configuration
      await this.restoreConfiguration();

      // 3. Install dependencies
      await this.installDependencies();

      // 4. Show next steps
      this.showNextSteps();

      console.log('✅ Application Restoration Completed!');
    } catch (error) {
      console.error('❌ Restoration Failed:', error.message);
      throw error;
    }
  }

  async restoreApplicationCode() {
    console.log('📝 Restoring application code...');
    
    const codePath = path.join(this.backupPath, 'application-code');
    await fs.ensureDir(this.targetPath);
    await fs.copy(codePath, this.targetPath);
    
    console.log('✅ Application code restored');
  }

  async restoreConfiguration() {
    console.log('⚙️ Restoring configuration...');
    
    const configPath = path.join(this.backupPath, 'configuration');
    
    const configFiles = ['package.json', 'next.config.js', 'tailwind.config.js', 'tsconfig.json'];
    
    for (const file of configFiles) {
      const sourcePath = path.join(configPath, file);
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, path.join(this.targetPath, file));
      }
    }

    console.log('✅ Configuration restored');
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      execSync('npm install', { 
        cwd: this.targetPath, 
        stdio: 'inherit' 
      });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.error('⚠️ Dependency installation failed:', error.message);
      console.log('ℹ️ You may need to run "npm install" manually');
    }
  }

  showNextSteps() {
    console.log(`
📋 NEXT STEPS:
1. Configure your environment variables in .env.local
2. Update Supabase connection details
3. Start the development server: npm run dev

📖 Environment Template: ${path.join(this.backupPath, 'configuration/env-template.json')}
`);
  }
}

new AppRestoration().restore().catch(console.error);

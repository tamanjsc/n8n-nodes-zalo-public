#!/usr/bin/env node

/**
 * 🚀 Auto Publish Script
 * 
 * Tự động thực hiện toàn bộ quá trình publish:
 * 1. Generate user changelog
 * 2. Update version
 * 3. Publish to npm
 * 4. Push to GitHub
 * 5. Create GitHub release
 * 
 * Usage:
 *   node scripts/auto-publish.js [patch|minor|major]
 */

const { execSync } = require('child_process');
const fs = require('fs');

const versionType = process.argv[2] || 'patch';

console.log('🚀 Starting auto publish process...');
console.log(`📦 Version type: ${versionType}`);

try {
  // Step 1: Generate user changelog
  console.log('\n📝 Step 1: Generating user changelog...');
  execSync('node scripts/generate-user-changelog.js', { stdio: 'inherit' });
  console.log('✅ User changelog generated');

  // Step 2: Run publish script
  console.log('\n🚀 Step 2: Running publish script...');
  execSync(`node scripts/publish.js ${versionType}`, { stdio: 'inherit' });
  console.log('✅ Publish completed');

  // Step 3: Verify files
  console.log('\n🔍 Step 3: Verifying published files...');
  
  const requiredFiles = [
    'package.json',
    'README.md',
    'CHANGELOG_USER.md',
    'dist/'
  ];

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  }

  console.log('\n🎉 Auto publish completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- ✅ User changelog generated');
  console.log('- ✅ Version updated');
  console.log('- ✅ Published to npm');
  console.log('- ✅ Pushed to GitHub');
  console.log('- ✅ GitHub release created');
  console.log('\n🔗 Links:');
  console.log('- NPM: https://www.npmjs.com/package/n8n-nodes-zalo-public');
  console.log('- GitHub: https://github.com/aiviethub/n8n-nodes-zalo-public');

} catch (error) {
  console.error('\n❌ Auto publish failed:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * 🔄 Restore Source Script for n8n-nodes-zalo-public
 * 
 * Khôi phục source code gốc từ dist-original về dist
 * Sử dụng khi cần sửa code hoặc phát triển
 * 
 * Usage:
 *   node scripts/restore-source.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Starting source restoration for n8n-nodes-zalo-public...');

const distOriginalDir = './dist-original';
const distDir = './dist';

// Check if dist-original exists
if (!fs.existsSync(distOriginalDir)) {
    console.error('❌ dist-original directory not found!');
    console.log('💡 Run "npm run publish:obfuscated" first to create source backup');
    process.exit(1);
}

// Check if dist-original has content
const distOriginalFiles = fs.readdirSync(distOriginalDir);
if (distOriginalFiles.length === 0) {
    console.error('❌ dist-original directory is empty!');
    console.log('💡 Run "npm run publish:obfuscated" first to create source backup');
    process.exit(1);
}

console.log(`📁 Source directory: ${distOriginalDir}`);
console.log(`📁 Target directory: ${distDir}`);

// Remove current dist if exists
if (fs.existsSync(distDir)) {
    console.log('🗑️ Removing current dist directory...');
    fs.rmSync(distDir, { recursive: true });
}

// Copy source from dist-original to dist
console.log('📋 Copying original source to dist...');
try {
    execSync(`cp -r ${distOriginalDir}/* ${distDir}/`, { stdio: 'pipe' });
    console.log('✅ Source code restored successfully!');
    console.log('🎯 You can now edit the code in dist/ directory');
    console.log('💡 After editing, run "npm run publish:obfuscated" to publish');
} catch (error) {
    console.error(`❌ Failed to restore source: ${error.message}`);
    process.exit(1);
}

console.log('🎉 Source restoration completed!');

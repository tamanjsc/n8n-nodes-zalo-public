const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting obfuscated publish process for n8n-nodes-zalo-public...');

// Step 1: Preserve original source code
console.log('💾 Preserving original source code...');
const distOriginalDir = './dist-original';

if (!fs.existsSync(distOriginalDir)) {
    fs.mkdirSync(distOriginalDir, { recursive: true });
}

// Copy current dist to dist-original if it exists
if (fs.existsSync('./dist')) {
    try {
        execSync(`cp -r dist/* ${distOriginalDir}/`, { stdio: 'pipe' });
        console.log('✅ Original source code preserved in dist-original/');
    } catch (error) {
        console.warn(`⚠️ Failed to preserve source: ${error.message}`);
    }
} else {
    console.log('⚠️ No dist directory found, skipping source preservation');
}

// Step 2: Build the project (if source exists)
console.log('📦 Building project...');
try {
    // Check if source TypeScript files exist
    const srcExists = fs.existsSync('./src');
    const tsFiles = findTsFiles('./');
    
    if (!srcExists && tsFiles.length === 0) {
        console.log('⏭️ No TypeScript source files found, using pre-built dist');
    } else {
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Project built successfully');
        
        // After building, preserve the new source code
        if (fs.existsSync('./dist')) {
            try {
                execSync(`cp -r dist/* ${distOriginalDir}/`, { stdio: 'pipe' });
                console.log('✅ Updated source code preserved in dist-original/');
            } catch (error) {
                console.warn(`⚠️ Failed to preserve updated source: ${error.message}`);
            }
        }
    }
} catch (error) {
    console.warn(`⚠️ Build failed: ${error.message}`);
    console.log('⏭️ Continuing with pre-built dist files...');
}

// Step 3: Copy original source to dist for obfuscation
console.log('📋 Copying original source to dist for obfuscation...');
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
}

// Create dist directory
fs.mkdirSync('dist', { recursive: true });

if (fs.existsSync(distOriginalDir)) {
    try {
        execSync(`cp -r ${distOriginalDir}/* dist/`, { stdio: 'pipe' });
        console.log('✅ Original source copied to dist/');
    } catch (error) {
        console.error(`❌ Failed to copy source: ${error.message}`);
        process.exit(1);
    }
} else {
    console.error('❌ No original source found in dist-original/');
    process.exit(1);
}

// Step 4: Obfuscate the code
console.log('🔒 Obfuscating code...');
try {
    execSync('node scripts/obfuscate.js', { stdio: 'inherit' });
    console.log('✅ Code obfuscated successfully');
} catch (error) {
    console.error(`❌ Obfuscation failed: ${error.message}`);
    process.exit(1);
}

// Step 5: Replace dist with obfuscated version
console.log('🔄 Replacing dist with obfuscated version...');
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
}
fs.renameSync('dist-obfuscated', 'dist');

// Step 6: Clean up package.json to only include dist
console.log('🧹 Cleaning package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Update files array to only include dist
packageJson.files = ['dist'];

// Update scripts to remove build commands (since we're publishing pre-built)
packageJson.scripts = {
    ...packageJson.scripts,
    'prepublishOnly': 'echo "Using pre-built obfuscated dist files"'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Step 7: Create final backup of obfuscated version
console.log('💾 Creating obfuscated backup...');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const obfuscatedBackupName = `obfuscated-backup-${timestamp}`;
const backupDir = './backups';
const obfuscatedBackupPath = path.join(backupDir, `${obfuscatedBackupName}.tar.gz`);

try {
    execSync(`tar -czf "${obfuscatedBackupPath}" dist/ package.json README.md *.md`, { stdio: 'pipe' });
    console.log(`✅ Obfuscated backup created: ${obfuscatedBackupPath}`);
} catch (error) {
    console.warn(`⚠️ Obfuscated backup failed: ${error.message}`);
}

// Step 8: Publish
console.log('📤 Publishing to npm...');
try {
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log('✅ Obfuscated package published successfully!');
} catch (error) {
    console.error(`❌ Publish failed: ${error.message}`);
    process.exit(1);
}

// Helper function to find TypeScript files
function findTsFiles(dir) {
    const files = [];
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory() && !['node_modules', 'dist', '.git', 'backups'].includes(item)) {
                files.push(...findTsFiles(fullPath));
            } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Ignore errors
    }
    return files;
}

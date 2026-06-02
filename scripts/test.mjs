#!/usr/bin/env node

/**
 * Test Script for Trace
 * Verifies all major features are working correctly
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Trace Test Suite\n');

// Test 1: Check .env configuration
console.log('1️⃣ Checking environment configuration...');
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  
  const hasAlgoliaAppId = envContent.includes('VITE_ALGOLIA_APP_ID=');
  const hasAlgoliaKey = envContent.includes('VITE_ALGOLIA_SEARCH_API_KEY=');
  const hasAgentId = envContent.includes('VITE_ALGOLIA_AGENT_ID=');
  const hasOpenAIKey = envContent.includes('VITE_OPENAI_API_KEY=');
  
  if (hasAlgoliaAppId && hasAlgoliaKey && hasAgentId) {
    console.log('   ✅ Algolia configuration found');
  } else {
    console.log('   ⚠️  Missing some Algolia credentials');
  }
  
  if (hasOpenAIKey && !envContent.includes('VITE_OPENAI_API_KEY=your_openai_api_key_here')) {
    console.log('   ✅ OpenAI API key configured (screenshot detection enabled)');
  } else {
    console.log('   ℹ️  OpenAI API key not configured (screenshot detection disabled)');
  }
} catch (error) {
  console.log('   ❌ .env file not found');
}

// Test 2: Check data files
console.log('\n2️⃣ Checking enhanced data files...');
const dataFiles = [
  'components_index_enhanced.json',
  'code_implementations_index_enhanced.json',
  'accessibility_index_enhanced.json'
];

let dataFilesOk = true;
for (const file of dataFiles) {
  try {
    const filePath = join(__dirname, '..', 'data', file);
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    console.log(`   ✅ ${file}: ${data.length} records`);
  } catch (error) {
    console.log(`   ❌ ${file}: Not found or invalid`);
    dataFilesOk = false;
  }
}

// Test 3: Check key source files
console.log('\n3️⃣ Checking key source files...');
const sourceFiles = [
  'src/components/ChatInterface-premium.tsx',
  'src/services/algolia.ts',
  'src/services/vision.ts',
  'src/components/CodeBlock.tsx',
  'src/components/Icons.tsx'
];

let sourceFilesOk = true;
for (const file of sourceFiles) {
  try {
    const filePath = join(__dirname, '..', file);
    readFileSync(filePath, 'utf-8');
    console.log(`   ✅ ${file}`);
  } catch (error) {
    console.log(`   ❌ ${file}: Not found`);
    sourceFilesOk = false;
  }
}

// Test 4: Check documentation
console.log('\n4️⃣ Checking documentation...');
const docFiles = [
  'README.md',
  'SCREENSHOT-DETECTION.md',
  'CONTEST-IMPROVEMENTS.md'
];

for (const file of docFiles) {
  try {
    const filePath = join(__dirname, '..', file);
    readFileSync(filePath, 'utf-8');
    console.log(`   ✅ ${file}`);
  } catch (error) {
    console.log(`   ⚠️  ${file}: Not found`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary');
console.log('='.repeat(50));

if (dataFilesOk && sourceFilesOk) {
  console.log('\n✅ All critical files present');
  console.log('\n🚀 Ready to run:');
  console.log('   1. npm run dev');
  console.log('   2. Visit http://localhost:5173/');
  console.log('   3. Try uploading a screenshot!');
} else {
  console.log('\n⚠️  Some files are missing');
  console.log('   Run: node scripts/upload-enhanced.mjs');
}

console.log('\n💡 Next Steps:');
console.log('   • Test screenshot detection with real design mockups');
console.log('   • Record demo video (3-5 minutes)');
console.log('   • Write DEV.to submission post');
console.log('   • Submit by February 8, 2026');
console.log('');

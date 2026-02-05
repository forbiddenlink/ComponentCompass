import { algoliasearch } from 'algoliasearch';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ID = '2LAKFJBN4J';
const WRITE_API_KEY = 'fbfca0e5c05fbee58b839a49f9401074';

const client = algoliasearch(APP_ID, WRITE_API_KEY);

const indices = [
  'components_index',
  'code_implementations_index',
  'design_tokens_index',
  'design_files_index',
  'accessibility_index',
  'usage_analytics_index',
  'team_knowledge_index',
];

async function seedData() {
  console.log('🌱 Starting data seeding to Algolia...\n');

  for (const indexName of indices) {
    const filePath = path.join(__dirname, '..', 'data', `${indexName}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${indexName} - file not found`);
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`📤 Uploading ${data.length} records to ${indexName}...`);
      
      const result = await client.saveObjects({
        indexName,
        objects: data,
      });

      console.log(`✅ Successfully uploaded to ${indexName}`);
      console.log(`   Task ID: ${JSON.stringify(result).substring(0, 100)}...\n`);
    } catch (error) {
      console.error(`❌ Error uploading to ${indexName}:`, error);
    }
  }

  console.log('🎉 Data seeding complete!');
}

seedData().catch(console.error);

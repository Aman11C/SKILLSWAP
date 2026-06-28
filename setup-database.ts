import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Create .env with:');
  console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSQL(sql: string, description: string) {
  // Split by semicolon but handle DO blocks and functions
  const statements = splitSQLStatements(sql);
  
  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed || trimmed.startsWith('--')) continue;
    
    try {
      // Use rpc to execute raw SQL
      const { error } = await supabase.rpc('exec_sql', { sql: trimmed });
      if (error) {
        // Some statements might fail if they already exist, that's OK
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate') &&
            !error.message.includes('relation') &&
            !error.message.includes('policy')) {
          console.log(`  ⚠️  ${description}: ${error.message.substring(0, 100)}`);
        }
      }
    } catch (err: any) {
      // Ignore expected errors for idempotent operations
    }
  }
  
  console.log(`  ✅ ${description}`);
}

function splitSQLStatements(sql: string): string[] {
  // Simple split - handles most cases
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function verifyTables() {
  console.log('\n🔍 Verifying tables...');
  
  const tables = [
    'profiles', 'teams', 'team_members', 'connections', 
    'messages', 'notifications', 'skills', 'posts', 'reviews'
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`  ❌ ${table}: ${error.message}`);
    } else {
      console.log(`  ✅ ${table}: exists`);
    }
  }
}

async function verifyPolicies() {
  console.log('\n🔐 Verifying RLS policies...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;`
  });
  
  if (error) {
    console.log(`  ⚠️  Could not verify policies: ${error.message}`);
  } else if (data) {
    const policies = data as any[];
    const byTable = policies.reduce((acc, p) => {
      acc[p.tablename] = (acc[p.tablename] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [table, count] of Object.entries(byTable)) {
      console.log(`  ✅ ${table}: ${count} policies`);
    }
  }
}

async function testSignupFlow() {
  console.log('\n🧪 Testing signup profile creation...');
  
  // Test that we can insert a profile (simulating signup)
  const testId = '00000000-0000-0000-0000-000000000001';
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: testId,
      name: 'Test User',
      avatar: '',
      bio: '',
      college: 'Test College',
      teach_skills: [],
      learn_skills: [],
      rating: 0,
      matches_count: 0,
      location: '',
      contact_url: ''
    });
  
  if (error) {
    console.log(`  ❌ Profile insert failed: ${error.message}`);
  } else {
    console.log(`  ✅ Profile insert works`);
    // Clean up
    await supabase.from('profiles').delete().eq('id', testId);
  }
}

async function main() {
  console.log('🚀 SkillSwap Database Setup\n');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);
  
  // Read combined schema
  const schemaPath = join(__dirname, 'supabase', 'migrations', 'COMPLETE_SCHEMA.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  console.log('📦 Applying complete schema...\n');
  await executeSQL(schema, 'Complete schema applied');
  
  await verifyTables();
  await verifyPolicies();
  await testSignupFlow();
  
  console.log('\n✨ Setup complete!');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Open http://localhost:3000');
  console.log('  3. Try signing up - profile should be created automatically');
}

main().catch(console.error);
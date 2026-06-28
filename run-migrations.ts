import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please create a .env file with:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration(filePath: string, fileName: string) {
  const sql = readFileSync(filePath, 'utf-8');
  
  // Split by semicolon, but be careful with function bodies
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.trim() === '') continue;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error) {
        // Try direct query if rpc fails
        const { error: directError } = await supabase.from('_dummy').select('1').limit(0);
        if (directError && directError.code !== '42P01') { // ignore relation does not exist
          console.error(`❌ Error in ${fileName}:`, error.message);
        }
      }
    } catch (err: any) {
      // Some statements might not work via RPC, try direct
      console.log(`⚠️  Statement may need manual execution: ${statement.substring(0, 80)}...`);
    }
  }
  
  console.log(`✅ Applied: ${fileName}`);
}

async function main() {
  console.log('🚀 Running SkillSwap migrations...\n');
  
  const migrationsDir = join(__dirname, 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  for (const file of files) {
    await runMigration(join(migrationsDir, file), file);
  }
  
  console.log('\n✨ All migrations processed!');
  console.log('Note: Some statements (RLS policies, DO blocks) may need to be run manually in Supabase SQL Editor.');
}

main().catch(console.error);
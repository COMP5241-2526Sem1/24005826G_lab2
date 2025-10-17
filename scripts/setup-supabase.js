#!/usr/bin/env node
/**
 * Setup script for Supabase + Vercel configuration
 * Run this to verify your Supabase connection and environment setup
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ukgfziwsrvmwayeovigk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZ2Z6aXdzcnZtd2F5ZW92aWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjAwMzMsImV4cCI6MjA3NjIzNjAzM30.w4hda2BrUAwgKG8a99_hFvyFUGOY-PC39WIyOn-9jUM';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('Note')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      
      if (error.message.includes('relation "Note" does not exist')) {
        console.log('💡 The Note table doesn\'t exist yet. Run: npm run db:push');
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Note table is accessible');
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Setup Verification');
  console.log('==============================');
  console.log();
  
  console.log('📋 Your Supabase Configuration:');
  console.log('URL:', SUPABASE_URL);
  console.log('Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  console.log();
  
  const isConnected = await testSupabaseConnection();
  
  console.log();
  console.log('📝 Next Steps:');
  console.log('==============');
  
  if (!isConnected) {
    console.log('1. ❌ Fix DATABASE_URL in your environment');
    console.log('   - Get the pooled connection string from Supabase Dashboard');
    console.log('   - Update DATABASE_URL in Vercel and .env.local');
    console.log('   - Make sure to use port 6543 and add ?sslmode=require');
    console.log();
  }
  
  console.log('2. 🔧 Set Environment Variables:');
  console.log('   Local (.env.local):');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`);
  console.log();
  console.log('   Vercel (Settings → Environment Variables):');
  console.log('   - Add the same variables for Production/Preview/Development');
  console.log();
  
  console.log('3. 🗄️ Initialize Database:');
  console.log('   npm run db:push     # Create tables from Prisma schema');
  console.log('   npm run db:seed     # Add sample data');
  console.log();
  
  console.log('4. 🧪 Test Your Setup:');
  console.log('   npm run dev         # Start local development');
  console.log('   # Visit: http://localhost:3000/api/health');
  console.log();
  
  console.log('5. 🚀 Deploy to Vercel:');
  console.log('   - Push your changes to GitHub');
  console.log('   - Vercel will auto-deploy');
  console.log('   - Check: https://your-app.vercel.app/api/health');
}

main().catch(console.error);
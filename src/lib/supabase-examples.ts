// Example usage of Supabase in your app
// This file shows different ways to use Supabase alongside your existing Prisma setup

import { supabase } from "./supabase-client";
import { getSupabaseAdmin } from "./supabase-server";

// Example 1: Client-side usage (in React components)
export async function exampleClientSideAuth() {
  if (!supabase) {
    console.warn("Supabase client not configured");
    return null;
  }

  // Sign up a new user
  const { data, error } = await supabase.auth.signUp({
    email: "user@example.com",
    password: "password123",
  });

  if (error) {
    console.error("Auth error:", error);
    return null;
  }

  return data;
}

// Example 2: Real-time subscriptions (client-side)
export function subscribeToNoteChanges(callback: (payload: any) => void) {
  if (!supabase) {
    console.warn("Supabase client not configured");
    return null;
  }

  // Subscribe to changes in the Note table
  const subscription = supabase
    .channel("note_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Note" },
      callback
    )
    .subscribe();

  return subscription;
}

// Example 3: Server-side admin operations (API routes only)
export async function exampleServerSideAdmin() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Example: List all users (admin only)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("Admin error:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Supabase admin not configured:", error);
    return null;
  }
}

// Example 4: File upload (client-side)
export async function uploadFile(file: File, bucket: string = "uploads") {
  if (!supabase) {
    console.warn("Supabase client not configured");
    return null;
  }

  const fileName = `${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}

// Example 5: Using Supabase alongside Prisma
// Your Prisma handles the Note CRUD, but you can use Supabase for:
// - Authentication (users, sessions)
// - Real-time features (live updates)
// - File storage
// - Edge functions
// - Row Level Security (RLS)
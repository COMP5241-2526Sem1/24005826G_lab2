"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Non-fatal: app can run without client-side Supabase
  console.warn("Supabase client env vars are missing; client features disabled.");
}

export const supabase = url && anon ? createClient(url, anon) : undefined;

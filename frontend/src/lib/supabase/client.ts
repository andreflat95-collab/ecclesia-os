"use client";

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Retorna null em dev local sem Supabase configurado. */
function isConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function createClient() {
  if (!isConfigured()) {
    return null;
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

/** Obtém o token de acesso de forma segura (null em dev local). */
export async function getAccessToken(): Promise<string | undefined> {
  const client = createClient();
  if (!client) return undefined;
  const { data } = await client.auth.getSession();
  return data.session?.access_token;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Projeto oficial do Luma no Supabase.
 * A URL e a publishable key são credenciais públicas próprias para uso no frontend.
 * Variáveis de ambiente, quando presentes, continuam tendo prioridade.
 */
const DEFAULT_SUPABASE_URL = "https://xfughooomgaxnxusqrgk.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nsjqdd04Wd51JiFdW4ajpg_Mk_D-Yec";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = true;

/** Só o host (público) — usado na página /diagnostico para mostrar a qual projeto o app está ligado. */
export const supabaseHost = new URL(url).host;

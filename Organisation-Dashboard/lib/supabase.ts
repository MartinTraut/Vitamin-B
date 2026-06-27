// Supabase-Client — nur aktiv, wenn die Env-Variablen gesetzt sind.
// Ohne Konfiguration läuft das Dashboard im lokalen Demo-Modus (localStorage).
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Geteilter Team-Account: alle melden sich mit demselben Passwort an.
// Die E-Mail ist fix; das Passwort vergebt ihr beim Anlegen des Users in Supabase.
export const TEAM_EMAIL = process.env.NEXT_PUBLIC_TEAM_EMAIL ?? "team@vitaminb-os.de"

export const isSupabaseEnabled = Boolean(url && anon)

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anon as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

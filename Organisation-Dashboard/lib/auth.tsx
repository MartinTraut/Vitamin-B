"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { supabase, isSupabaseEnabled, TEAM_EMAIL } from "./supabase"

interface AuthValue {
  enabled: boolean
  authed: boolean
  loading: boolean
  signIn: (password: string) => Promise<string | null> // gibt Fehlertext zurück oder null bei Erfolg
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  // Im lokalen Modus (kein Supabase) gibt es keinen Ladezustand.
  const [loading, setLoading] = useState(isSupabaseEnabled)

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setAuthed(Boolean(data.session))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session))
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signIn(password: string): Promise<string | null> {
    if (!supabase) return "Kein Backend konfiguriert."
    const { error } = await supabase.auth.signInWithPassword({ email: TEAM_EMAIL, password })
    if (error) return "Passwort falsch. Bitte erneut versuchen."
    return null
  }

  async function signOut() {
    await supabase?.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ enabled: isSupabaseEnabled, authed, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

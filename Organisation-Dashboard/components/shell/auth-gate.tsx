"use client"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { LoginScreen } from "./login-screen"

// Schützt das gesamte Dashboard. Ohne Supabase-Konfiguration (lokaler Demo-Modus)
// wird direkt durchgereicht — kein Login nötig.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { enabled, authed, loading } = useAuth()

  if (!enabled) return <>{children}</>

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!authed) return <LoginScreen />

  return <>{children}</>
}

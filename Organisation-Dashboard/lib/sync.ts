"use client"

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { supabase, isSupabaseEnabled } from "./supabase"
import type { Database } from "./types"

// Eine Zeile pro Top-Level-Collection in der Tabelle `app_state` (key, data jsonb).
// So überschreibt ein Edit nur die betroffene Collection statt der ganzen DB.
const KEYS: (keyof Database)[] = [
  "tasks",
  "lists",
  "appointments",
  "appointmentCategories",
  "finance",
  "cashflow",
  "customers",
  "projects",
  "deals",
  "quotes",
  "invoices",
  "transactions",
  "debts",
  "templates",
  "company",
  "whiteboards",
]

/**
 * Hält den lokalen Store mit Supabase synchron, sobald angemeldet.
 * - Erstabgleich: leere DB → lokale Daten hochladen; sonst Remote-Daten übernehmen.
 * - Schreiben: nur geänderte Collections, gebündelt (debounced).
 * - Echtzeit: Änderungen anderer Geräte werden eingespielt (Echo wird gefiltert).
 */
export function useSupabaseSync(
  db: Database,
  setDb: Dispatch<SetStateAction<Database>>,
) {
  // Letzter mit Supabase abgeglichener JSON-Stand je Collection (Echo-/Diff-Erkennung).
  const lastSynced = useRef<Partial<Record<keyof Database, string>>>({})
  const loaded = useRef(false)
  // db immer aktuell halten, ohne den Lade-Effekt neu zu starten.
  const dbRef = useRef(db)
  dbRef.current = db

  // Initiales Laden + Realtime-Abo
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return
    let cancelled = false

    async function bootstrap() {
      const client = supabase!
      const { data, error } = await client.from("app_state").select("key, data")
      if (cancelled) return

      if (error) {
        // Backend nicht erreichbar → lokaler Stand bleibt aktiv.
        loaded.current = true
        return
      }

      if (!data || data.length === 0) {
        // Frischer Projektstand: aktuellen lokalen Stand als Startdaten hochladen.
        const current = dbRef.current
        const rows = KEYS.map((k) => ({ key: k, data: current[k] }))
        await client.from("app_state").upsert(rows)
        for (const k of KEYS) lastSynced.current[k] = JSON.stringify(current[k])
      } else {
        const incoming: Partial<Database> = {}
        for (const row of data as { key: keyof Database; data: unknown }[]) {
          incoming[row.key] = row.data as never
          lastSynced.current[row.key] = JSON.stringify(row.data)
        }
        setDb((prev) => ({ ...prev, ...incoming }))
      }
      loaded.current = true
    }

    bootstrap()

    const channel = supabase
      .channel("app_state-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_state" },
        (payload) => {
          const row = payload.new as { key?: keyof Database; data?: unknown }
          if (!row?.key) return
          const json = JSON.stringify(row.data)
          // Eigener Schreibvorgang? Stand stimmt überein → ignorieren.
          if (lastSynced.current[row.key] === json) return
          lastSynced.current[row.key] = json
          setDb((prev) => ({ ...prev, [row.key as keyof Database]: row.data as never }))
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase?.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Geänderte Collections zurückschreiben (gebündelt)
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !loaded.current) return

    const changed: { key: keyof Database; data: unknown; json: string }[] = []
    for (const k of KEYS) {
      const json = JSON.stringify(db[k])
      if (lastSynced.current[k] !== json) changed.push({ key: k, data: db[k], json })
    }
    if (changed.length === 0) return

    const timer = setTimeout(() => {
      // Vor dem Schreiben markieren, damit das eigene Realtime-Echo gefiltert wird.
      for (const c of changed) lastSynced.current[c.key] = c.json
      supabase!
        .from("app_state")
        .upsert(changed.map((c) => ({ key: c.key, data: c.data })))
        .then(({ error }) => {
          // Bei Fehler erneuten Versuch zulassen.
          if (error) for (const c of changed) lastSynced.current[c.key] = "__retry__"
        })
    }, 500)

    return () => clearTimeout(timer)
  }, [db])
}

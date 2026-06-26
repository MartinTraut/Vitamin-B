"use client"

import { Building2, User, Database, RotateCcw } from "lucide-react"
import { useStore } from "@/lib/store"
import { PEOPLE, type CompanySettings } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SettingsView() {
  const { db, updateCompany } = useStore()
  const c = db.company

  const set = (k: keyof CompanySettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateCompany({ [k]: e.target.value })

  function resetDemo() {
    if (!confirm("Alle lokalen Daten zurücksetzen und frische Demo-Daten laden?")) return
    try {
      localStorage.removeItem("vitaminb-os-db-v2")
    } catch {
      /* ignore */
    }
    location.reload()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Firmendaten */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Firmendaten</h3>
            <p className="text-xs text-muted-foreground">Erscheinen auf Angeboten & Rechnungen</p>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Firmenname" value={c.name} onChange={set("name")} full />
          <Field label="Inhaber" value={c.owner} onChange={set("owner")} />
          <Field label="USt-IdNr." value={c.taxId} onChange={set("taxId")} />
          <Field label="Adresse" value={c.address} onChange={set("address")} full />
          <Field label="E-Mail" value={c.email} onChange={set("email")} />
          <Field label="Telefon" value={c.phone} onChange={set("phone")} />
          <Field label="Bank" value={c.bank} onChange={set("bank")} />
          <Field label="IBAN" value={c.iban} onChange={set("iban")} />
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Änderungen werden automatisch gespeichert.
        </div>
      </Card>

      {/* Team */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Team</h3>
            <p className="text-xs text-muted-foreground">Personen-Switcher oben links</p>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {PEOPLE.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl font-heading text-sm font-bold" style={{ backgroundColor: `${p.color}1f`, color: p.color, border: `1px solid ${p.color}33` }}>
                {p.initials}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">{p.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Daten */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-heading text-lg font-bold">Daten</h3>
            <p className="text-xs text-muted-foreground">Demo-Modus · lokale Speicherung im Browser</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="max-w-md text-sm text-muted-foreground">
            Aktuell laufen alle Daten lokal im Browser (kein Server). Zurücksetzen lädt die frischen Demo-Daten neu — eigene Einträge gehen dabei verloren.
          </p>
          <Button variant="secondary" onClick={resetDemo}>
            <RotateCcw className="h-4 w-4" /> Demo-Daten zurücksetzen
          </Button>
        </div>
      </Card>
    </div>
  )
}

function Field({ label, value, onChange, full }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; full?: boolean }) {
  return (
    <label className={full ? "sm:col-span-2" : undefined}>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50"
      />
    </label>
  )
}

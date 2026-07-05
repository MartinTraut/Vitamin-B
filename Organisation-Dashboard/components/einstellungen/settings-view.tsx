"use client"

import { useRef } from "react"
import { Building2, User, Database, RotateCcw, SlidersHorizontal, Download, Upload, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { useToast } from "@/lib/toast"
import { useDialog } from "@/lib/dialog"
import { PEOPLE, ACCENTS, type CompanySettings, type Person } from "@/lib/types"
import { todayISO } from "@/lib/recurrence"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SettingsView() {
  const { db, updateCompany, exportDb, importDb } = useStore()
  const toast = useToast()
  const dialog = useDialog()
  const fileRef = useRef<HTMLInputElement>(null)
  const c = db.company

  const set = (k: keyof CompanySettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateCompany({ [k]: e.target.value })

  async function resetDemo() {
    const ok = await dialog.confirm({
      title: "Demo-Daten zurücksetzen?",
      message: "Alle eigenen Einträge gehen verloren und die frischen Demo-Daten werden geladen.",
      confirmLabel: "Zurücksetzen",
      danger: true,
    })
    if (!ok) return
    try {
      localStorage.removeItem("vitaminb-os-db-v2")
    } catch {
      /* ignore */
    }
    location.reload()
  }

  function backupExport() {
    try {
      const blob = new Blob([exportDb()], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vitaminb-backup-${todayISO()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Backup heruntergeladen")
    } catch {
      toast.error("Export fehlgeschlagen")
    }
  }

  function backupImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importDb(String(reader.result))
      if (ok) toast.success("Backup eingespielt")
      else toast.error("Ungültige Backup-Datei")
    }
    reader.onerror = () => toast.error("Datei konnte nicht gelesen werden")
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Firmendaten */}
      <Card className="overflow-hidden">
        <SectionHeader icon={Building2} title="Firmendaten" subtitle="Erscheinen auf Angeboten & Rechnungen" />
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Firmenname" value={c.name} onChange={set("name")} full />
          <Field label="Inhaber" value={c.owner} onChange={set("owner")} />
          <Field label="USt-IdNr." value={c.taxId} onChange={set("taxId")} />
          <Field label="Adresse" value={c.address} onChange={set("address")} full />
          <Field label="E-Mail" value={c.email} onChange={set("email")} />
          <Field label="Telefon" value={c.phone} onChange={set("phone")} />
          <Field label="Bank" value={c.bank} onChange={set("bank")} />
          <Field label="IBAN" value={c.iban} onChange={set("iban")} />
          <Field label="BIC / SWIFT" value={c.bic ?? ""} onChange={set("bic")} />
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Änderungen werden automatisch gespeichert.
        </div>
      </Card>

      {/* Geschäfts-Defaults */}
      <Card className="overflow-hidden">
        <SectionHeader icon={SlidersHorizontal} title="Standardwerte" subtitle="Vorgaben für neue Belege & die Startansicht" />
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <label>
            <span className="mb-1.5 block text-xs text-muted-foreground">Standard-USt-Satz</span>
            <select
              value={c.defaultTaxRate}
              onChange={(e) => updateCompany({ defaultTaxRate: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
            >
              <option value={19}>19 %</option>
              <option value={7}>7 %</option>
              <option value={0}>0 %</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs text-muted-foreground">Zahlungsziel (Tage)</span>
            <input
              type="number" min={0} max={120}
              value={c.paymentTermDays}
              onChange={(e) => updateCompany({ paymentTermDays: Math.max(0, Number(e.target.value) || 0) })}
              className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs text-muted-foreground">Startansicht (Person)</span>
            <select
              value={c.defaultPerson}
              onChange={(e) => updateCompany({ defaultPerson: e.target.value as Person })}
              className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
            >
              {PEOPLE.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
        <div className="border-t border-border p-4">
          <span className="mb-2.5 block text-xs text-muted-foreground">Akzentfarbe</span>
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((a) => {
              const active = c.accent.toLowerCase() === a.value.toLowerCase()
              return (
                <button
                  key={a.value}
                  onClick={() => updateCompany({ accent: a.value })}
                  aria-label={a.name}
                  title={a.name}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110",
                    active && "ring-2 ring-offset-2 ring-offset-card",
                  )}
                  style={{ backgroundColor: a.value, boxShadow: active ? `0 0 0 2px ${a.value}` : undefined, ...(active ? { ["--tw-ring-color" as string]: a.value } : {}) }}
                >
                  {active && <Check className="h-4 w-4" style={{ color: "#0a0a0a" }} />}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Team */}
      <Card className="overflow-hidden">
        <SectionHeader icon={User} title="Team" subtitle="Personen-Switcher oben links" />
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

      {/* Daten / Backup */}
      <Card className="overflow-hidden">
        <SectionHeader icon={Database} title="Daten & Backup" subtitle="Demo-Modus · lokale Speicherung im Browser" />
        <div className="space-y-4 p-4">
          <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-3.5">
            <Download className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Regelmäßig sichern</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Alle Daten liegen nur lokal im Browser. Ein gelöschter Cache löscht alles unwiederbringlich — exportiere daher regelmäßig ein Backup.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={backupExport}>
              <Download className="h-4 w-4" /> Backup exportieren
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Backup importieren
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) backupImport(f)
                e.target.value = ""
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="max-w-md text-sm text-muted-foreground">
              Zurücksetzen lädt die frischen Demo-Daten neu — eigene Einträge gehen dabei verloren.
            </p>
            <Button variant="ghost" onClick={resetDemo} className="text-destructive hover:bg-destructive/10">
              <RotateCcw className="h-4 w-4" /> Demo-Daten zurücksetzen
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Building2; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
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

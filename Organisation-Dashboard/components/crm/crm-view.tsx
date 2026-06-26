"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Building2,
  FolderKanban,
  X,
  TrendingUp,
} from "lucide-react"
import { useStore } from "@/lib/store"
import {
  HEALTH_LABEL,
  HEALTH_COLOR,
  DEAL_STAGE_LABEL,
  DEAL_STAGE_COLOR,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_COLOR,
  type CustomerHealth,
  type Customer,
  type ProjectStatus,
} from "@/lib/types"
import { eur0 } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const HEALTHS: CustomerHealth[] = ["lead", "active", "churned"]

export function CrmView() {
  const { db, addCustomer, removeCustomer, addProject, removeProject } = useStore()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(db.customers[0]?.id ?? null)
  const [adding, setAdding] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return db.customers
    return db.customers.filter(
      (c) =>
        c.company.toLowerCase().includes(q) ||
        c.contactName?.toLowerCase().includes(q) ||
        c.source?.toLowerCase().includes(q),
    )
  }, [db.customers, query])

  const selected = db.customers.find((c) => c.id === selectedId) ?? null

  return (
    <div className="space-y-4">
      {/* Kopf */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kunde, Kontakt oder Herkunft suchen…"
            className="h-11 w-full rounded-xl border border-border bg-white/[0.03] pl-9 pr-3 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{db.customers.length} Kunden</span>
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Neuer Kunde
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Liste */}
        <div className="space-y-2.5 lg:col-span-1">
          {filtered.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">Keine Kunden gefunden.</Card>
          )}
          {filtered.map((c) => {
            const active = c.id === selectedId
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setAdding(false) }}
                className={cn(
                  "w-full rounded-2xl border bg-card/80 p-4 text-left transition-all hover:border-white/15",
                  active ? "border-primary/50 ring-1 ring-inset ring-primary/30" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold"
                      style={{ backgroundColor: `${HEALTH_COLOR[c.health]}1f`, color: HEALTH_COLOR[c.health] }}
                    >
                      {initials(c.company)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{c.company}</div>
                      {c.contactName && <div className="truncate text-xs text-muted-foreground">{c.contactName}</div>}
                    </div>
                  </div>
                  <Badge color={HEALTH_COLOR[c.health]}>{HEALTH_LABEL[c.health]}</Badge>
                </div>
                {c.source && (
                  <div className="mt-2 text-[11px] text-muted-foreground">Herkunft: {c.source}</div>
                )}
              </button>
            )
          })}
        </div>

        {/* Detail / Anlegen */}
        <div className="lg:col-span-2">
          {adding ? (
            <AddCustomer
              onCancel={() => setAdding(false)}
              onSave={(input) => {
                addCustomer(input)
                setAdding(false)
              }}
            />
          ) : selected ? (
            <CustomerDetail
              customer={selected}
              projects={db.projects.filter((p) => p.customerId === selected.id)}
              deals={db.deals.filter((d) => d.customerId === selected.id)}
              onRemove={() => {
                removeCustomer(selected.id)
                setSelectedId(db.customers.find((c) => c.id !== selected.id)?.id ?? null)
              }}
              onAddProject={(name, status) =>
                addProject({ customerId: selected.id, name, status })
              }
              onRemoveProject={removeProject}
            />
          ) : (
            <Card className="flex h-full items-center justify-center p-12 text-sm text-muted-foreground">
              Kunde auswählen oder neu anlegen.
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function CustomerDetail({
  customer,
  projects,
  deals,
  onRemove,
  onAddProject,
  onRemoveProject,
}: {
  customer: Customer
  projects: { id: string; name: string; status: ProjectStatus; description?: string }[]
  deals: { id: string; title: string; stage: keyof typeof DEAL_STAGE_LABEL; value: number }[]
  onRemove: () => void
  onAddProject: (name: string, status: ProjectStatus) => void
  onRemoveProject: (id: string) => void
}) {
  const [projName, setProjName] = useState("")
  const dealsOpen = deals.filter((d) => d.stage !== "gewonnen").reduce((s, d) => s + d.value, 0)
  const dealsWon = deals.filter((d) => d.stage === "gewonnen").reduce((s, d) => s + d.value, 0)

  return (
    <Card className="overflow-hidden">
      {/* Kopf */}
      <div className="flex items-start justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl font-heading text-lg font-bold"
            style={{ backgroundColor: `${HEALTH_COLOR[customer.health]}1f`, color: HEALTH_COLOR[customer.health] }}
          >
            {initials(customer.company)}
          </span>
          <div>
            <h3 className="font-heading text-xl font-bold tracking-tight">{customer.company}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge color={HEALTH_COLOR[customer.health]}>{HEALTH_LABEL[customer.health]}</Badge>
              {customer.source && <span className="text-xs text-muted-foreground">via {customer.source}</span>}
            </div>
          </div>
        </div>
        <button onClick={onRemove} title="Kunde löschen" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        {/* Kontakt */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kontakt</div>
          {customer.contactName && <InfoRow icon={<Building2 className="h-4 w-4" />} value={customer.contactName} />}
          {customer.email && <InfoRow icon={<Mail className="h-4 w-4" />} value={customer.email} href={`mailto:${customer.email}`} />}
          {customer.phone && <InfoRow icon={<Phone className="h-4 w-4" />} value={customer.phone} href={`tel:${customer.phone}`} />}
          {customer.address && <InfoRow icon={<MapPin className="h-4 w-4" />} value={customer.address} />}
        </div>

        {/* Zahlen */}
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Offene Deals" value={eur0(dealsOpen)} accent="#E39832" />
          <MiniStat label="Gewonnen" value={eur0(dealsWon)} accent="#34d399" />
          <MiniStat label="Projekte" value={String(projects.length)} accent="#3b82f6" />
          <MiniStat label="Deals gesamt" value={String(deals.length)} accent="#a855f7" />
        </div>
      </div>

      {/* Deals */}
      {deals.length > 0 && (
        <div className="border-t border-border p-5 pt-4">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Deals
          </div>
          <div className="space-y-2">
            {deals.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-3">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: DEAL_STAGE_COLOR[d.stage] }} />
                <span className="flex-1 truncate text-sm">{d.title}</span>
                <Badge color={DEAL_STAGE_COLOR[d.stage]}>{DEAL_STAGE_LABEL[d.stage]}</Badge>
                <span className="text-sm font-semibold">{eur0(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projekte */}
      <div className="border-t border-border p-5 pt-4">
        <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <FolderKanban className="h-4 w-4" /> Projekte
        </div>
        <div className="space-y-2">
          {projects.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Projekte.</p>}
          {projects.map((p) => (
            <div key={p.id} className="group flex items-start gap-3 rounded-xl border border-border bg-white/[0.02] p-3">
              <div className="mt-0.5 h-8 w-1 rounded-full" style={{ backgroundColor: PROJECT_STATUS_COLOR[p.status] }} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{p.name}</div>
                {p.description && <div className="truncate text-xs text-muted-foreground">{p.description}</div>}
              </div>
              <Badge color={PROJECT_STATUS_COLOR[p.status]}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
              <button onClick={() => onRemoveProject(p.id)} className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && projName.trim()) {
                onAddProject(projName.trim(), "geplant")
                setProjName("")
              }
            }}
            placeholder="Neues Projekt…"
            className="h-10 flex-1 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (!projName.trim()) return
              onAddProject(projName.trim(), "geplant")
              setProjName("")
            }}
          >
            <Plus className="h-4 w-4" /> Anlegen
          </Button>
        </div>
      </div>

      {customer.notes && (
        <div className="border-t border-border p-5 pt-4">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notizen</div>
          <p className="text-sm text-muted-foreground">{customer.notes}</p>
        </div>
      )}
    </Card>
  )
}

function AddCustomer({
  onSave,
  onCancel,
}: {
  onSave: (input: Omit<Customer, "id" | "createdAt">) => void
  onCancel: () => void
}) {
  const [f, setF] = useState({
    company: "", contactName: "", email: "", phone: "", address: "", source: "", notes: "",
  })
  const [health, setHealth] = useState<CustomerHealth>("lead")
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }))

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h3 className="font-heading text-lg font-bold">Neuer Kunde</h3>
        <button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.06]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <Field label="Firma *" value={f.company} onChange={set("company")} full />
        <Field label="Ansprechpartner" value={f.contactName} onChange={set("contactName")} />
        <Field label="Herkunft" value={f.source} onChange={set("source")} placeholder="Empfehlung, Google, Messe…" />
        <Field label="E-Mail" value={f.email} onChange={set("email")} />
        <Field label="Telefon" value={f.phone} onChange={set("phone")} />
        <Field label="Adresse" value={f.address} onChange={set("address")} full />
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs text-muted-foreground">Status</span>
          <div className="flex gap-2">
            {HEALTHS.map((h) => (
              <button
                key={h}
                onClick={() => setHealth(h)}
                className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors", health === h ? "border-transparent" : "border-border text-muted-foreground")}
                style={health === h ? { backgroundColor: `${HEALTH_COLOR[h]}26`, color: HEALTH_COLOR[h] } : undefined}
              >
                {HEALTH_LABEL[h]}
              </button>
            ))}
          </div>
        </div>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs text-muted-foreground">Notizen</span>
          <textarea
            value={f.notes}
            onChange={set("notes")}
            rows={2}
            className="w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>
      </div>
      <div className="flex gap-2 border-t border-border p-5">
        <Button
          className="flex-1"
          onClick={() => {
            if (!f.company.trim()) return
            onSave({
              company: f.company.trim(),
              contactName: f.contactName.trim() || undefined,
              email: f.email.trim() || undefined,
              phone: f.phone.trim() || undefined,
              address: f.address.trim() || undefined,
              source: f.source.trim() || undefined,
              notes: f.notes.trim() || undefined,
              health,
            })
          }}
        >
          Kunde speichern
        </Button>
        <Button variant="ghost" onClick={onCancel}>Abbrechen</Button>
      </div>
    </Card>
  )
}

function Field({ label, value, onChange, placeholder, full }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; full?: boolean }) {
  return (
    <label className={cn(full && "sm:col-span-2")}>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50"
      />
    </label>
  )
}

function InfoRow({ icon, value, href }: { icon: React.ReactNode; value: string; href?: string }) {
  const content = (
    <span className="flex items-center gap-2.5 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="truncate">{value}</span>
    </span>
  )
  return href ? <a href={href} className="block hover:text-primary">{content}</a> : <div>{content}</div>
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-heading text-lg font-bold" style={{ color: accent }}>{value}</div>
    </div>
  )
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

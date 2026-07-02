"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  ChevronRight,
  Paperclip,
  Download,
  FileText,
} from "lucide-react"
import { nanoid } from "nanoid"
import { useStore } from "@/lib/store"
import { useDialog } from "@/lib/dialog"
import { useToast } from "@/lib/toast"
import {
  PEOPLE,
  HEALTH_LABEL,
  HEALTH_COLOR,
  DEAL_STAGE_LABEL,
  DEAL_STAGE_COLOR,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_COLOR,
  type CustomerHealth,
  type Customer,
  type ProjectStatus,
  type ProjectFile,
  type Task,
  type Note,
} from "@/lib/types"
import { eur0, formatMinutes } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiTile } from "@/components/ui/kpi-tile"
import { ORANGE, INCOME, BLUE, PURPLE } from "@/lib/theme-colors"
import { cn } from "@/lib/utils"

const HEALTHS: CustomerHealth[] = ["lead", "active", "churned"]

export function CrmView() {
  const { db, activePerson, addCustomer, removeCustomer, addProject, updateProject, removeProject, addNote, removeNote } = useStore()
  const dialog = useDialog()
  const toast = useToast()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(db.customers[0]?.id ?? null)
  const [adding, setAdding] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  // Mobile/Tablet: Liste und Detail stapeln. Nach Auswahl sanft zum Detail scrollen.
  function selectCustomer(id: string) {
    setSelectedId(id)
    setAdding(false)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }
  }

  // Aus der ⌘K-Suche vorselektieren (?sel=<id>).
  useEffect(() => {
    const sel = new URLSearchParams(window.location.search).get("sel")
    if (sel && db.customers.some((c) => c.id === sel)) setSelectedId(sel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                onClick={() => selectCustomer(c.id)}
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
        <div className="scroll-mt-24 lg:col-span-2" ref={detailRef}>
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
              tasks={db.tasks}
              notes={db.notes.filter((n) => n.customerId === selected.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
              onAddNote={(text) => addNote({ customerId: selected.id, person: activePerson, text })}
              onRemoveNote={removeNote}
              onRemove={async () => {
                const nDeals = db.deals.filter((d) => d.customerId === selected.id).length
                const nProjects = db.projects.filter((p) => p.customerId === selected.id).length
                const extras = [
                  nDeals ? `${nDeals} Deal${nDeals > 1 ? "s" : ""}` : null,
                  nProjects ? `${nProjects} Projekt${nProjects > 1 ? "e" : ""}` : null,
                ].filter(Boolean)
                const ok = await dialog.confirm({
                  title: `„${selected.company}" löschen?`,
                  message: extras.length
                    ? `Dabei werden auch ${extras.join(" und ")} unwiderruflich entfernt.`
                    : "Der Kunde wird unwiderruflich entfernt.",
                  confirmLabel: "Löschen",
                  danger: true,
                })
                if (!ok) return
                removeCustomer(selected.id)
                setSelectedId(db.customers.find((c) => c.id !== selected.id)?.id ?? null)
                toast.success("Kunde gelöscht")
              }}
              onAddProject={(name, status) =>
                addProject({ customerId: selected.id, name, status })
              }
              onUpdateProject={updateProject}
              onRemoveProject={removeProject}
            />
          ) : (
            <Card className="flex h-full flex-col items-center justify-center gap-4 p-12 text-sm text-muted-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-vitaminb-white.png" alt="" className="h-8 w-auto opacity-15" />
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
  tasks,
  notes,
  onRemove,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  onAddNote,
  onRemoveNote,
}: {
  customer: Customer
  projects: { id: string; name: string; status: ProjectStatus; description?: string; attachments?: ProjectFile[] }[]
  deals: { id: string; title: string; stage: keyof typeof DEAL_STAGE_LABEL; value: number }[]
  tasks: Task[]
  notes: Note[]
  onRemove: () => void
  onAddProject: (name: string, status: ProjectStatus) => void
  onUpdateProject: (id: string, patch: { name?: string; status?: ProjectStatus; description?: string; attachments?: ProjectFile[] }) => void
  onRemoveProject: (id: string) => void
  onAddNote: (text: string) => void
  onRemoveNote: (id: string) => void
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
            <h3 className="font-heading text-[clamp(1.15rem,4vw+0.3rem,1.25rem)] font-bold tracking-tight">{customer.company}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge color={HEALTH_COLOR[customer.health]}>{HEALTH_LABEL[customer.health]}</Badge>
              {customer.source && <span className="text-xs text-muted-foreground">via {customer.source}</span>}
            </div>
          </div>
        </div>
        <button onClick={onRemove} aria-label="Kunde löschen" title="Kunde löschen" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
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
          <KpiTile label="Offene Deals" value={eur0(dealsOpen)} accent={ORANGE} />
          <KpiTile label="Gewonnen" value={eur0(dealsWon)} accent={INCOME} />
          <KpiTile label="Projekte" value={String(projects.length)} accent={BLUE} />
          <KpiTile label="Deals gesamt" value={String(deals.length)} accent={PURPLE} />
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
            <ProjectRow
              key={p.id}
              project={p}
              tasks={tasks.filter((t) => t.projectId === p.id)}
              onUpdate={(patch) => onUpdateProject(p.id, patch)}
              onRemove={() => onRemoveProject(p.id)}
            />
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

      <NotesTimeline legacyNote={customer.notes} notes={notes} onAdd={onAddNote} onRemove={onRemoveNote} />
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


// Chronologische Notizen-Timeline (ersetzt das frühere statische Freitext-Feld).
function NotesTimeline({
  legacyNote,
  notes,
  onAdd,
  onRemove,
}: {
  legacyNote?: string
  notes: Note[]
  onAdd: (text: string) => void
  onRemove: (id: string) => void
}) {
  const [text, setText] = useState("")

  function submit() {
    const v = text.trim()
    if (!v) return
    onAdd(v)
    setText("")
  }

  return (
    <div className="border-t border-border p-5 pt-4">
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notizen</div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Notiz hinzufügen — Anruf, Termin, Entscheidung…"
          className="h-10 flex-1 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50"
        />
        <Button size="sm" variant="secondary" onClick={submit}>
          <Plus className="h-4 w-4" /> Notiz
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {legacyNote && (
          <div className="rounded-lg border border-dashed border-border bg-white/[0.02] p-2.5 text-sm text-muted-foreground">
            {legacyNote}
          </div>
        )}
        {notes.length === 0 && !legacyNote && (
          <p className="text-sm text-muted-foreground">Noch keine Notizen.</p>
        )}
        {notes.map((n) => {
          const person = PEOPLE.find((p) => p.id === n.person)
          return (
            <div key={n.id} className="group flex items-start gap-2.5 rounded-lg border border-border bg-white/[0.02] p-2.5">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ backgroundColor: `${person?.color ?? "#9ca3af"}26`, color: person?.color ?? "#9ca3af" }}
              >
                {person?.initials ?? "?"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                <div className="mt-1 text-xs text-muted-foreground">
                  {person?.name ?? "—"} · {new Date(n.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
              <button
                onClick={() => onRemove(n.id)}
                title="Notiz löschen"
                className="action-reveal rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const PROJECT_STATUSES: ProjectStatus[] = ["geplant", "laufend", "fertig"]

// Klickbare, aufklappbare Projekt-Zeile mit Inline-Bearbeitung (Name, Status, Beschreibung).
function ProjectRow({
  project,
  tasks,
  onUpdate,
  onRemove,
}: {
  project: { id: string; name: string; status: ProjectStatus; description?: string; attachments?: ProjectFile[] }
  tasks: Task[]
  onUpdate: (patch: { name?: string; status?: ProjectStatus; description?: string; attachments?: ProjectFile[] }) => void
  onRemove: () => void
}) {
  const trackedMinutes = tasks.reduce((s, t) => s + (t.trackedMinutes ?? 0), 0)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(project.name)
  const [desc, setDesc] = useState(project.description ?? "")
  const color = PROJECT_STATUS_COLOR[project.status]
  const attachments = project.attachments ?? []

  function commitName() {
    const v = name.trim()
    if (v && v !== project.name) onUpdate({ name: v })
    else setName(project.name)
  }
  function commitDesc() {
    const v = desc.trim()
    if (v !== (project.description ?? "")) onUpdate({ description: v || undefined })
  }

  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const MAX_BYTES = 4 * 1024 * 1024 // 4 MB pro Datei (Data-URL-Speicherung)

  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.onerror = () => reject(r.error)
      r.readAsDataURL(file)
    })
  }

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const added: ProjectFile[] = []
    for (const file of Array.from(list)) {
      if (file.size > MAX_BYTES) {
        toast.error(`„${file.name}" ist zu groß (max. 4 MB).`)
        continue
      }
      try {
        const dataUrl = await readAsDataUrl(file)
        added.push({
          id: nanoid(8),
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl,
          createdAt: new Date().toISOString(),
        })
      } catch {
        toast.error(`„${file.name}" konnte nicht gelesen werden.`)
      }
    }
    if (added.length) {
      onUpdate({ attachments: [...attachments, ...added] })
      toast.success(added.length === 1 ? "Datei angehängt" : `${added.length} Dateien angehängt`)
    }
    if (fileInput.current) fileInput.current.value = ""
  }

  function removeAttachment(id: string) {
    onUpdate({ attachments: attachments.filter((a) => a.id !== id) })
  }

  return (
    <div
      className="overflow-hidden rounded-xl border transition-colors"
      style={{
        borderColor: open ? `${color}66` : `${color}2e`,
        background: open ? `linear-gradient(180deg, ${color}1f, ${color}08)` : `${color}0f`,
        boxShadow: open ? `inset 4px 0 0 0 ${color}, 0 0 22px -8px ${color}` : `inset 4px 0 0 0 ${color}`,
      }}
    >
      {/* Kopfzeile (klickbar) */}
      <div className="group flex items-center gap-3 p-3">
        <button onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} style={{ color }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{project.name}</span>
            {!open && project.description && <span className="block truncate text-xs text-muted-foreground">{project.description}</span>}
          </span>
        </button>
        {tasks.length > 0 && (
          <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
            {tasks.length} Aufgabe{tasks.length === 1 ? "" : "n"}
            {trackedMinutes > 0 && ` · ${formatMinutes(trackedMinutes)}`}
          </span>
        )}
        <Badge color={color}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
        <button onClick={onRemove} aria-label="Projekt entfernen" title="Projekt entfernen" className="action-reveal rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor (aufgeklappt) */}
      {open && (
        <div className="space-y-3 border-t px-3 pb-3 pt-3" style={{ borderColor: `${color}26` }}>
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted-foreground">Projektname</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
              className="h-9 w-full rounded-lg border border-border bg-white/[0.04] px-2.5 text-sm outline-none focus:border-primary/50"
            />
          </label>
          <div>
            <span className="mb-1 block text-[11px] text-muted-foreground">Status</span>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_STATUSES.map((s) => {
                const sc = PROJECT_STATUS_COLOR[s]
                const sel = project.status === s
                return (
                  <button
                    key={s}
                    onClick={() => onUpdate({ status: s })}
                    className="rounded-lg border px-2.5 py-1 text-xs font-medium transition-all"
                    style={
                      sel
                        ? { backgroundColor: `${sc}26`, color: sc, borderColor: sc, boxShadow: `0 0 0 1px ${sc}, 0 0 12px ${sc}66` }
                        : { borderColor: "rgba(255,255,255,0.12)", color: "var(--muted-foreground)" }
                    }
                  >
                    {PROJECT_STATUS_LABEL[s]}
                  </button>
                )
              })}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted-foreground">Beschreibung</span>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={commitDesc}
              rows={2}
              placeholder="Was umfasst das Projekt?"
              className="w-full rounded-lg border border-border bg-white/[0.04] px-2.5 py-2 text-sm outline-none focus:border-primary/50"
            />
          </label>

          {/* Anhänge: Bilder & Dateien */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Anhänge{attachments.length > 0 && ` · ${attachments.length}`}
              </span>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors hover:brightness-110"
                style={{ borderColor: `${color}66`, color, backgroundColor: `${color}1a` }}
              >
                <Paperclip className="h-3.5 w-3.5" /> Datei / Bild
              </button>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {attachments.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed py-5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                style={{ borderColor: `${color}3a` }}
              >
                <Paperclip className="h-4 w-4" />
                Bilder oder Dateien hierher – klicken zum Auswählen
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {attachments.map((a) => (
                  <Attachment key={a.id} file={a} accent={color} onRemove={() => removeAttachment(a.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Einzelner Anhang: Bild-Vorschau oder Datei-Kachel, mit Download & Entfernen.
function Attachment({ file, accent, onRemove }: { file: ProjectFile; accent: string; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/")
  const kb = file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`

  return (
    <div className="group relative overflow-hidden rounded-xl border" style={{ borderColor: `${accent}33`, background: `${accent}0d` }}>
      <a href={file.dataUrl} download={file.name} target="_blank" rel="noreferrer" className="block" title={file.name}>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.dataUrl} alt={file.name} className="h-24 w-full object-cover" />
        ) : (
          <div className="flex h-24 w-full flex-col items-center justify-center gap-1 px-2 text-center" style={{ color: accent }}>
            <FileText className="h-7 w-7" />
            <span className="line-clamp-2 break-all text-[11px] font-medium text-foreground">{file.name}</span>
          </div>
        )}
      </a>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">{isImage ? file.name : kb}</span>
        <a href={file.dataUrl} download={file.name} target="_blank" rel="noreferrer" aria-label="Herunterladen" title="Herunterladen" className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground">
          <Download className="h-3.5 w-3.5" />
        </a>
        <button onClick={onRemove} aria-label="Entfernen" title="Entfernen" className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

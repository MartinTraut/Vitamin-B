"use client"

import { useEffect, useState, type CSSProperties } from "react"
import {
  Plus,
  Trash2,
  Printer,
  FileText,
  ArrowRight,
  LayoutTemplate,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/lib/toast"
import { PersonBadge } from "@/components/ui/person-badge"
import { SegmentedControl } from "@/components/ui/segmented-control"
import {
  UNITS,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_COLOR,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
  DUNNING_LABEL,
  type LineItem,
  type Quote,
  type Invoice,
  type QuoteStatus,
  type InvoiceStatus,
  type RecurrenceFreq,
} from "@/lib/types"
import { computeTotals, lineNet } from "@/lib/totals"
import { eur, dateDE, dateLong } from "@/lib/format"
import type { Customer, CompanySettings } from "@/lib/types"
import { todayISO, addDaysISO, nthOccurrenceOf } from "@/lib/recurrence"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { nanoid } from "nanoid"

type Kind = "quote" | "invoice"
type Doc = Quote | Invoice

function newId() {
  return nanoid(6)
}
// Zahlenfeld robust parsen: leere oder ungültige Eingabe → 0 (nie NaN in Beträge).
function num0(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function DocumentsView({ kind }: { kind: Kind }) {
  const store = useStore()
  const { db, activePerson } = store
  const docs: Doc[] = kind === "quote" ? db.quotes : db.invoices
  const isQuote = kind === "quote"

  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(docs[0]?.id ?? null)
  const [pendingNew, setPendingNew] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sort, setSort] = useState<"date" | "amount" | "number">("date")
  // "Meine" = nur von der aktiven Person erstellte Belege — der Nummernkreis bleibt gemeinsam.
  const [who, setWho] = useState<"all" | "mine">("all")

  const statusLabels = isQuote ? QUOTE_STATUS_LABEL : INVOICE_STATUS_LABEL

  useEffect(() => {
    if (pendingNew && docs.length) {
      setSelectedId(docs[0].id)
      setPendingNew(false)
    }
  }, [docs, pendingNew])

  // Aus der ⌘K-Suche vorselektieren (?sel=<id>).
  useEffect(() => {
    const sel = new URLSearchParams(window.location.search).get("sel")
    if (sel && docs.some((d) => d.id === sel)) setSelectedId(sel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = docs.find((d) => d.id === selectedId) ?? null
  const customerName = (id: string) => db.customers.find((c) => c.id === id)?.company ?? "—"

  const visible = (() => {
    const q = search.trim().toLowerCase()
    const list = docs.filter((d) => {
      const matchQ = !q || d.number.toLowerCase().includes(q) || customerName(d.customerId).toLowerCase().includes(q)
      const matchS = statusFilter === "all" || (d as Quote | Invoice).status === statusFilter
      const matchW = who === "all" || d.person === activePerson
      return matchQ && matchS && matchW
    })
    return [...list].sort((a, b) => {
      if (sort === "amount") return computeTotals(b.items).gross - computeTotals(a.items).gross
      if (sort === "number") return b.number.localeCompare(a.number)
      return b.createdAt.localeCompare(a.createdAt)
    })
  })()

  function patchDoc(patch: Partial<Doc>) {
    if (!selected) return
    if (isQuote) store.updateQuote(selected.id, patch as Partial<Quote>)
    else store.updateInvoice(selected.id, patch as Partial<Invoice>)
  }
  function removeDoc(id: string) {
    if (isQuote) store.removeQuote(id)
    else store.removeInvoice(id)
    setSelectedId(docs.find((d) => d.id !== id)?.id ?? null)
  }
  function voidDoc(id: string) {
    store.voidInvoice(id)
    toast.success("Rechnung storniert — Stornorechnung wurde angelegt")
  }
  function createNew() {
    const cid = db.customers[0]?.id ?? ""
    const term = db.company.paymentTermDays
    if (isQuote) {
      store.addQuote({ customerId: cid, status: "entwurf", items: [], validUntil: addDaysISO(todayISO(), term), person: activePerson })
    } else {
      store.addInvoice({ customerId: cid, status: "entwurf", items: [], issueDate: todayISO(), dueDate: addDaysISO(todayISO(), term), person: activePerson })
    }
    setPendingNew(true)
  }

  const templates = db.templates.filter((t) => t.kind === kind)

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-2 p-4">
        <div className="relative w-full min-w-[160px] sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nummer oder Kunde…"
            className="h-10 w-full rounded-lg border border-border bg-white/[0.03] pl-9 pr-3 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Status filtern"
          className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
        >
          <option value="all">Alle Status</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sortieren"
          className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
        >
          <option value="date">Neueste zuerst</option>
          <option value="amount">Betrag</option>
          <option value="number">Nummer</option>
        </select>
        <SegmentedControl
          value={who}
          onChange={(v) => setWho(v as typeof who)}
          options={[{ v: "all", l: "Alle" }, { v: "mine", l: "Meine" }]}
        />
        <Button onClick={createNew} className="sm:ml-auto">
          <Plus className="h-4 w-4" /> {isQuote ? "Neues Angebot" : "Neue Rechnung"}
        </Button>
      </Card>

      <div className="space-y-4">
        {/* Liste — volle Breite, horizontale Zeilen */}
        <div className="space-y-2.5">
          {docs.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">Noch keine Belege.</Card>}
          {docs.length > 0 && visible.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">Keine Treffer für diese Filter.</Card>}
          {visible.map((d) => {
            const t = computeTotals(d.items)
            const active = d.id === selectedId
            const color = isQuote ? QUOTE_STATUS_COLOR[(d as Quote).status] : INVOICE_STATUS_COLOR[(d as Invoice).status]
            const label = isQuote ? QUOTE_STATUS_LABEL[(d as Quote).status] : INVOICE_STATUS_LABEL[(d as Invoice).status]
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className="flex w-full items-center gap-3 rounded-2xl border py-4 pl-4 pr-4 text-left transition-all hover:brightness-110 sm:gap-4 sm:pl-6 sm:pr-5"
                style={{
                  background: active ? `linear-gradient(90deg, ${color}38, ${color}12 70%)` : `linear-gradient(90deg, ${color}1c, ${color}08 70%)`,
                  borderColor: active ? color : `${color}3a`,
                  boxShadow: active
                    ? `inset 7px 0 0 0 ${color}, 0 0 0 1px ${color}, 0 0 28px -6px ${color}`
                    : `inset 5px 0 0 0 ${color}`,
                }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-shadow"
                  style={{ backgroundColor: `${color}33`, color, boxShadow: active ? `0 0 16px -2px ${color}` : "none" }}
                >
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-lg font-bold leading-tight">{isQuote ? "AN" : "RE"} {d.number}</div>
                  <div className="mt-1 truncate text-sm text-muted-foreground">
                    {customerName(d.customerId)} · {d.items.length} Position{d.items.length === 1 ? "" : "en"}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-5">
                  <PersonBadge person={d.person} className="hidden sm:flex" />
                  <Badge color={color}>{label}</Badge>
                  <span className="num text-right font-heading text-[clamp(1rem,1vw+0.75rem,1.25rem)] font-bold sm:w-32" style={{ color }}>{eur(t.gross)}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Editor — volle Breite darunter */}
        <div>
          {selected ? (
            <Editor
              kind={kind}
              doc={selected}
              customers={db.customers.map((c) => ({ id: c.id, company: c.company }))}
              customer={db.customers.find((c) => c.id === selected.customerId)}
              company={db.company}
              templates={templates.map((t) => ({ id: t.id, name: t.name, items: t.items }))}
              defaultTaxRate={db.company.defaultTaxRate}
              onPatch={patchDoc}
              onRemove={() => removeDoc(selected.id)}
              onVoid={!isQuote && (selected as Invoice).status !== "entwurf" && !(selected as Invoice).voided && !(selected as Invoice).creditNoteFor ? () => voidDoc(selected.id) : undefined}
              onSendDunning={() => { store.sendDunning(selected.id); toast.success("Mahnung erfasst") }}
              onConvert={isQuote ? () => { store.convertQuoteToInvoice(selected.id); toast.success("Angebot in Rechnung umgewandelt") } : undefined}
              onSaveTemplate={(name) => {
                store.addTemplate({ kind, name, items: selected.items.map(({ id: _id, ...rest }) => rest) })
                toast.success("Als Vorlage gespeichert")
              }}
              onDeleteTemplate={(id) => store.removeTemplate(id)}
            />
          ) : (
            <Card className="flex h-full flex-col items-center justify-center gap-4 p-12 text-sm text-muted-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-vitaminb-white.png" alt="" className="h-8 w-auto opacity-15" />
              Beleg auswählen oder neu anlegen.
            </Card>
          )}
        </div>
      </div>

      {/* Druck-Layout (nur beim Drucken sichtbar) */}
      {selected && (
        <div id="print-root" className="print-only">
          <PrintDoc
            kind={kind}
            doc={selected}
            customer={db.customers.find((c) => c.id === selected.customerId)}
            company={db.company}
          />
        </div>
      )}
    </div>
  )
}

/* ---------- Editor ---------- */

function Editor({
  kind,
  doc,
  customers,
  customer,
  company,
  templates,
  defaultTaxRate,
  onPatch,
  onRemove,
  onVoid,
  onSendDunning,
  onConvert,
  onSaveTemplate,
  onDeleteTemplate,
}: {
  kind: Kind
  doc: Doc
  customers: { id: string; company: string }[]
  customer?: Customer
  company: CompanySettings
  templates: { id: string; name: string; items: Omit<LineItem, "id">[] }[]
  defaultTaxRate: number
  onPatch: (patch: Partial<Doc>) => void
  onRemove: () => void
  onVoid?: () => void
  onSendDunning: () => void
  onConvert?: () => void
  onSaveTemplate: (name: string) => void
  onDeleteTemplate: (id: string) => void
}) {
  const isQuote = kind === "quote"
  const totals = computeTotals(doc.items)
  const checks = documentChecks(kind, doc, customer, company)
  const ready = checks.every((c) => c.ok)

  function printDoc() {
    const prev = document.title
    document.title = `${isQuote ? "Angebot" : "Rechnung"} ${doc.number}${customer?.company ? ` – ${customer.company}` : ""}`
    const restore = () => { document.title = prev; window.removeEventListener("afterprint", restore) }
    window.addEventListener("afterprint", restore)
    window.print()
  }
  const status = isQuote ? (doc as Quote).status : (doc as Invoice).status
  const color = isQuote ? QUOTE_STATUS_COLOR[status as QuoteStatus] : INVOICE_STATUS_COLOR[status as InvoiceStatus]

  function setItems(items: LineItem[]) {
    onPatch({ items } as Partial<Doc>)
  }
  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems(doc.items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  function addItem(preset?: Omit<LineItem, "id">) {
    setItems([...doc.items, { id: newId(), description: "", qty: 1, unit: "Stk", price: 0, taxRate: defaultTaxRate, ...preset }])
  }
  function removeItem(id: string) {
    setItems(doc.items.filter((it) => it.id !== id))
  }

  return (
    <Card
      className="overflow-hidden"
      style={{ borderColor: `${color}55`, boxShadow: `inset 0 0 0 1px ${color}1f, 0 0 40px -22px ${color}` }}
    >
      {/* Kopf — in Statusfarbe getönt */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b p-4"
        style={{ borderColor: `${color}33`, background: `linear-gradient(180deg, ${color}24, ${color}08)` }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}2e`, color, border: `1px solid ${color}55` }}>
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <div className="font-heading text-lg font-bold">{isQuote ? "Angebot" : "Rechnung"} {doc.number}</div>
            <div className="text-xs text-muted-foreground">{doc.items.length} Positionen · {eur(totals.gross)} brutto</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isQuote && onConvert && (
            <Button size="sm" variant="secondary" onClick={onConvert} title="In Rechnung umwandeln">
              <ArrowRight className="h-4 w-4" /> In Rechnung
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={printDoc}>
            <Printer className="h-4 w-4" /> Drucken / PDF
          </Button>
          {isQuote || doc.status === "entwurf" ? (
            <button onClick={onRemove} aria-label="Beleg löschen" title="Löschen" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : onVoid ? (
            <Button size="sm" variant="secondary" onClick={onVoid} title="Rechnung stornieren (Original bleibt für den Nummernkreis erhalten)">
              <AlertTriangle className="h-4 w-4" /> Stornieren
            </Button>
          ) : (doc as Invoice).voided ? (
            <Badge color="#ef4444">Storniert</Badge>
          ) : (doc as Invoice).creditNoteFor ? (
            <Badge color="#9ca3af">Stornorechnung</Badge>
          ) : null}
        </div>
      </div>

      {/* Fehler-Check: zeigt vor dem Druck, ob der Beleg vollständig & korrekt ist */}
      <ChecklistBar ready={ready} checks={checks} isQuote={isQuote} />

      {/* Meta */}
      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="lg:col-span-2">
          <span className="mb-1.5 block text-xs text-muted-foreground">Kunde</span>
          <select
            value={doc.customerId}
            onChange={(e) => onPatch({ customerId: e.target.value } as Partial<Doc>)}
            className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
          >
            {customers.length === 0 && <option value="">— kein Kunde —</option>}
            {customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
        </label>

        <StatusSelect kind={kind} doc={doc} onPatch={onPatch} />

        {isQuote ? (
          <DateField label="Gültig bis" value={(doc as Quote).validUntil} onChange={(v) => onPatch({ validUntil: v } as Partial<Doc>)} />
        ) : (
          <>
            <DateField label="Rechnungsdatum" value={(doc as Invoice).issueDate} onChange={(v) => onPatch({ issueDate: v } as Partial<Doc>)} />
            <DateField label="Leistungsdatum" value={(doc as Invoice).serviceDate ?? (doc as Invoice).issueDate} onChange={(v) => onPatch({ serviceDate: v } as Partial<Doc>)} />
            <DateField label="Fälligkeit" value={(doc as Invoice).dueDate} onChange={(v) => onPatch({ dueDate: v } as Partial<Doc>)} />
          </>
        )}
      </div>

      {/* Mahnwesen & wiederkehrende Rechnung — nur bei Rechnungen */}
      {!isQuote && !(doc as Invoice).voided && !(doc as Invoice).creditNoteFor && (
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2">
          <DunningPanel doc={doc as Invoice} onSendDunning={onSendDunning} />
          <RecurrencePanel doc={doc as Invoice} onPatch={onPatch} paymentTermDays={company.paymentTermDays} />
        </div>
      )}

      {/* Positionen */}
      <div className="p-4">
        <div className="mb-2 hidden grid-cols-[1fr_70px_80px_100px_90px_110px_32px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Beschreibung</span>
          <span className="text-right">Menge</span>
          <span>Einheit</span>
          <span className="text-right">Einzel €</span>
          <span className="text-right">USt</span>
          <span className="text-right">Netto €</span>
          <span />
        </div>
        <div className="space-y-2">
          {doc.items.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">Noch keine Positionen.</p>
          )}
          {doc.items.map((it) => (
            <div key={it.id} className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-white/[0.02] p-2 sm:grid-cols-[1fr_70px_80px_100px_90px_110px_32px] sm:border-0 sm:bg-transparent sm:p-0">
              <input
                value={it.description}
                onChange={(e) => updateItem(it.id, { description: e.target.value })}
                placeholder="Leistung / Position"
                className="col-span-2 h-10 rounded-lg border border-border bg-white/[0.03] px-2.5 text-sm outline-none focus:border-primary/50 sm:col-span-1 sm:h-9"
              />
              {/* sm:contents → auf Mobile beschriftete Felder, auf Desktop direkte Grid-Items (Layout unverändert) */}
              <label className="sm:contents">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">Menge</span>
                <input
                  type="number" min={0} inputMode="numeric" value={it.qty}
                  onChange={(e) => updateItem(it.id, { qty: num0(e.target.value) })}
                  className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-2 text-right text-sm outline-none focus:border-primary/50 sm:h-9"
                />
              </label>
              <label className="sm:contents">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">Einheit</span>
                <select
                  value={it.unit}
                  onChange={(e) => updateItem(it.id, { unit: e.target.value as LineItem["unit"] })}
                  className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-2 text-sm outline-none focus:border-primary/50 [color-scheme:dark] sm:h-9"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
              <label className="sm:contents">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">Einzel €</span>
                <input
                  type="number" min={0} step="0.01" inputMode="decimal" value={it.price}
                  onChange={(e) => updateItem(it.id, { price: num0(e.target.value) })}
                  className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-2 text-right text-sm outline-none focus:border-primary/50 sm:h-9"
                />
              </label>
              <label className="sm:contents">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">USt</span>
                <select
                  value={it.taxRate}
                  onChange={(e) => updateItem(it.id, { taxRate: Number(e.target.value) })}
                  className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-2 text-sm outline-none focus:border-primary/50 [color-scheme:dark] sm:h-9"
                >
                  <option value={19}>19%</option>
                  <option value={7}>7%</option>
                  <option value={0}>0%</option>
                </select>
              </label>
              <div className="sm:contents">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">Netto €</span>
                <div className="flex h-10 items-center justify-end px-1 text-sm font-medium tabular-nums sm:h-9">{eur(lineNet(it))}</div>
              </div>
              <button onClick={() => removeItem(it.id)} aria-label="Position löschen" title="Position löschen" className="flex h-10 items-center justify-center self-end text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-9">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Zeile hinzufügen + Templates */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => addItem()}>
            <Plus className="h-4 w-4" /> Position
          </Button>
          {templates.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              {templates.map((t) => (
                <span key={t.id} className="group inline-flex items-center rounded-full border border-border transition-colors hover:border-primary/50">
                  <button
                    onClick={() => setItems([...doc.items, ...t.items.map((it) => ({ ...it, id: newId() }))])}
                    className="px-2.5 py-1 text-xs text-muted-foreground group-hover:text-foreground"
                  >
                    + {t.name}
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(t.id)}
                    title="Vorlage löschen"
                    className="pr-2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {doc.items.length > 0 && <SaveAsTemplateButton onSave={onSaveTemplate} />}
        </div>
      </div>

      {/* Summen */}
      <div className="flex justify-end border-t border-border p-4">
        <div className="w-full max-w-xs space-y-1.5 text-sm">
          <Row label="Netto" value={eur(totals.net)} />
          {totals.taxByRate.map((r) => (
            <Row key={r.rate} label={`USt ${r.rate}%`} value={eur(r.tax)} muted />
          ))}
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
            <span className="font-heading text-base font-bold">Gesamt</span>
            <span className="font-heading text-[clamp(1.05rem,1vw+0.85rem,1.25rem)] font-bold text-primary">{eur(totals.gross)}</span>
          </div>
        </div>
      </div>

      {/* Notiz */}
      <div className="border-t border-border p-4">
        <span className="mb-1.5 block text-xs text-muted-foreground">Hinweis auf dem Beleg</span>
        <textarea
          value={doc.notes ?? ""}
          onChange={(e) => onPatch({ notes: e.target.value } as Partial<Doc>)}
          rows={2}
          placeholder="z. B. Zahlungsziel, Hinweise…"
          className="w-full rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-primary/50"
        />
      </div>
    </Card>
  )
}

const RECURRENCE_LABEL: Record<RecurrenceFreq, string> = {
  none: "Einmalig",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  yearly: "Jährlich",
}

function SaveAsTemplateButton({ onSave }: { onSave: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  function commit() {
    const v = name.trim()
    if (!v) return
    onSave(v)
    setName("")
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        title="Aktuelle Positionen als Vorlage speichern"
      >
        <Save className="h-3.5 w-3.5" /> Als Vorlage speichern
      </button>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setOpen(false) }}
        placeholder="Name der Vorlage"
        className="h-8 w-40 rounded-lg border border-border bg-white/[0.03] px-2.5 text-xs outline-none focus:border-primary/50"
      />
      <button onClick={commit} className="rounded-lg bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25">
        Speichern
      </button>
      <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function DunningPanel({ doc, onSendDunning }: { doc: Invoice; onSendDunning: () => void }) {
  const level = doc.dunningLevel ?? 0
  const canDun = doc.status === "ueberfaellig" || level > 0
  if (!canDun) {
    return (
      <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        Mahnwesen greift automatisch, sobald die Rechnung überfällig ist.
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.02] p-3">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">Mahnstatus</div>
        <div className="text-sm font-semibold" style={{ color: level > 0 ? "#ef4444" : undefined }}>
          {DUNNING_LABEL[level as 0 | 1 | 2 | 3]}
        </div>
      </div>
      {level < 3 && (
        <Button size="sm" variant="secondary" onClick={onSendDunning}>
          <AlertTriangle className="h-4 w-4" /> {level === 0 ? "1. Mahnung" : `${level + 1}. Mahnung`}
        </Button>
      )}
    </div>
  )
}

function RecurrencePanel({
  doc,
  onPatch,
  paymentTermDays,
}: {
  doc: Invoice
  onPatch: (patch: Partial<Doc>) => void
  paymentTermDays: number
}) {
  const freq = doc.recurrence?.freq ?? "none"

  function setFreq(next: RecurrenceFreq) {
    if (next === "none") {
      onPatch({ recurrence: undefined, nextRecurrenceDate: undefined } as Partial<Doc>)
      return
    }
    const recurrence = { freq: next, interval: 1 }
    onPatch({ recurrence, nextRecurrenceDate: nthOccurrenceOf(doc.issueDate, recurrence, 1) } as Partial<Doc>)
  }

  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-3">
      <div className="mb-1.5 text-xs text-muted-foreground">Wiederkehrende Rechnung</div>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(RECURRENCE_LABEL) as RecurrenceFreq[]).map((f) => (
          <button
            key={f}
            onClick={() => setFreq(f)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
              freq === f ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {RECURRENCE_LABEL[f]}
          </button>
        ))}
      </div>
      {doc.nextRecurrenceDate && (
        <p className="mt-2 text-xs text-muted-foreground">
          Nächste Folgerechnung: <span className="font-medium text-foreground">{dateDE(doc.nextRecurrenceDate)}</span>
          {" · Zahlungsziel "}{paymentTermDays} Tage
        </p>
      )}
    </div>
  )
}

function StatusSelect({ kind, doc, onPatch }: { kind: Kind; doc: Doc; onPatch: (p: Partial<Doc>) => void }) {
  const isQuote = kind === "quote"
  const opts = isQuote
    ? (Object.keys(QUOTE_STATUS_LABEL) as QuoteStatus[]).map((s) => ({ v: s, l: QUOTE_STATUS_LABEL[s] }))
    : (Object.keys(INVOICE_STATUS_LABEL) as InvoiceStatus[]).map((s) => ({ v: s, l: INVOICE_STATUS_LABEL[s] }))
  const cur = isQuote ? (doc as Quote).status : (doc as Invoice).status
  const color = isQuote ? QUOTE_STATUS_COLOR[cur as QuoteStatus] : INVOICE_STATUS_COLOR[cur as InvoiceStatus]
  return (
    <label>
      <span className="mb-1.5 block text-xs text-muted-foreground">Status</span>
      <select
        value={cur}
        onChange={(e) => onPatch({ status: e.target.value } as Partial<Doc>)}
        className="h-10 w-full rounded-lg border bg-white/[0.03] px-3 text-sm font-medium outline-none [color-scheme:dark]"
        style={{ borderColor: `${color}66`, color }}
      >
        {opts.map((o) => <option key={o.v} value={o.v} style={{ color: "#fff" }}>{o.l}</option>)}
      </select>
    </label>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      <input
        type="date" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
      />
    </label>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={cn("tabular-nums", muted ? "text-muted-foreground" : "font-medium")}>{value}</span>
    </div>
  )
}

/* ---------- Fehler-Absicherung: Vollständigkeits-Prüfung ---------- */

interface DocCheck { ok: boolean; label: string }

function documentChecks(kind: Kind, doc: Doc, customer: Customer | undefined, company: CompanySettings): DocCheck[] {
  const isQuote = kind === "quote"
  const totals = computeTotals(doc.items)
  const hasItems = doc.items.length > 0
  const checks: DocCheck[] = [
    { ok: !!customer, label: "Kunde ausgewählt" },
    { ok: !!(customer?.address && customer.address.trim().length > 4), label: "Empfänger-Adresse vollständig" },
    { ok: hasItems, label: "Mindestens eine Position" },
    { ok: hasItems && doc.items.every((it) => it.description.trim() !== ""), label: "Alle Positionen beschrieben" },
    { ok: hasItems && doc.items.every((it) => it.price > 0 && it.qty > 0), label: "Alle Preise & Mengen gesetzt" },
    { ok: totals.gross > 0, label: "Gesamtbetrag größer 0" },
    { ok: !!(company.name && company.address && company.taxId && company.iban), label: "Firmendaten vollständig (USt-IdNr & IBAN)" },
  ]
  if (!isQuote) {
    checks.push({ ok: !!(doc as Invoice).issueDate, label: "Rechnungsdatum gesetzt" })
    checks.push({ ok: !!((doc as Invoice).serviceDate ?? (doc as Invoice).issueDate), label: "Leistungsdatum gesetzt" })
    checks.push({ ok: !!(doc as Invoice).dueDate, label: "Fälligkeit gesetzt" })
  }
  return checks
}

function ChecklistBar({ ready, checks, isQuote }: { ready: boolean; checks: DocCheck[]; isQuote: boolean }) {
  const open = checks.filter((c) => !c.ok)
  return (
    <div className="border-b border-border px-4 py-3">
      {ready ? (
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#34d399" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {isQuote ? "Angebot" : "Rechnung"} vollständig — bereit zum Drucken &amp; Senden.
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#f59e0b" }}>
            <AlertTriangle className="h-4 w-4 shrink-0" /> {open.length} {open.length === 1 ? "Angabe fehlt" : "Angaben fehlen"} — bitte vor dem Senden ergänzen:
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 pl-6 text-xs text-muted-foreground">
            {open.map((c) => <li key={c.label} className="list-disc">{c.label}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ---------- Druck-Layout (DE, §14 UStG-konform) ---------- */

function PrintDoc({
  kind,
  doc,
  customer,
  company,
}: {
  kind: Kind
  doc: Doc
  customer?: Customer
  company: CompanySettings
}) {
  const isQuote = kind === "quote"
  const totals = computeTotals(doc.items)
  const title = isQuote ? "Angebot" : "Rechnung"
  const issue = isQuote ? (doc as Quote).createdAt.slice(0, 10) : (doc as Invoice).issueDate
  const service = !isQuote ? ((doc as Invoice).serviceDate ?? (doc as Invoice).issueDate) : undefined

  const ink = "#1a1a1a"
  const soft = "#6b7280"
  const line = "#e5e7eb"
  const accent = "#E39832"
  const label: CSSProperties = { fontSize: 8.5, letterSpacing: "0.09em", textTransform: "uppercase", color: soft, fontWeight: 600 }
  const numCell: CSSProperties = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }

  const metaRows: { k: string; v: string }[] = [
    { k: isQuote ? "Angebots-Nr." : "Rechnungs-Nr.", v: doc.number },
    { k: isQuote ? "Angebotsdatum" : "Rechnungsdatum", v: dateLong(issue) },
    ...(service ? [{ k: "Leistungsdatum", v: dateLong(service) }] : []),
    isQuote
      ? { k: "Gültig bis", v: dateLong((doc as Quote).validUntil) }
      : { k: "Fällig bis", v: dateLong((doc as Invoice).dueDate) },
  ]

  return (
    <div style={{ color: ink, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 11.5, lineHeight: 1.55 }}>
      {/* Kopf */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${accent}`, paddingBottom: 14, marginBottom: 26 }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vitaminb-orange.png" alt="Vitamin B" style={{ height: 36, width: "auto", marginBottom: 6 }} />
          <div style={{ fontSize: 10.5, color: soft }}>{company.name}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10.5, color: ink }}>
          <div style={{ whiteSpace: "pre-line" }}>{company.address}</div>
          <div>{company.email} · {company.phone}</div>
          <div style={{ color: soft }}>USt-IdNr.: {company.taxId}</div>
        </div>
      </div>

      {/* Empfänger + Belegdaten */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32, marginBottom: 30 }}>
        <div style={{ maxWidth: "58%" }}>
          <div style={{ ...label, fontSize: 8, marginBottom: 6 }}>{company.name} · {company.address.replace(/\n/g, ", ")}</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{customer?.company ?? "—"}</div>
          {customer?.contactName && <div>{customer.contactName}</div>}
          {customer?.address && <div style={{ whiteSpace: "pre-line" }}>{customer.address}</div>}
        </div>
        <div style={{ minWidth: 220 }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 10 }}>{title}</div>
          <table style={{ borderCollapse: "collapse", fontSize: 10.5, width: "100%" }}>
            <tbody>
              {metaRows.map((r) => (
                <tr key={r.k}>
                  <td style={{ ...label, padding: "2px 12px 2px 0", verticalAlign: "top" }}>{r.k}</td>
                  <td style={{ padding: "2px 0", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Positionen */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${ink}` }}>
            <th style={{ ...label, padding: "0 6px 7px 0", textAlign: "left", width: 26 }}>Pos.</th>
            <th style={{ ...label, padding: "0 6px 7px 0", textAlign: "left" }}>Beschreibung</th>
            <th style={{ ...label, padding: "0 6px 7px", textAlign: "right", width: 52 }}>Menge</th>
            <th style={{ ...label, padding: "0 6px 7px", textAlign: "left", width: 52 }}>Einh.</th>
            <th style={{ ...label, padding: "0 6px 7px", textAlign: "right", width: 78 }}>Einzel</th>
            <th style={{ ...label, padding: "0 6px 7px", textAlign: "right", width: 44 }}>USt</th>
            <th style={{ ...label, padding: "0 0 7px 6px", textAlign: "right", width: 88 }}>Netto</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((it, i) => (
            <tr key={it.id} style={{ borderBottom: `1px solid ${line}`, background: i % 2 === 1 ? "#fafafa" : "transparent" }}>
              <td style={{ padding: "7px 6px 7px 0", color: soft }}>{i + 1}</td>
              <td style={{ padding: "7px 6px 7px 0" }}>{it.description || <span style={{ color: "#c00" }}>— Beschreibung fehlt —</span>}</td>
              <td style={{ ...numCell, padding: "7px 6px" }}>{it.qty}</td>
              <td style={{ padding: "7px 6px" }}>{it.unit}</td>
              <td style={{ ...numCell, padding: "7px 6px" }}>{eur(it.price)}</td>
              <td style={{ ...numCell, padding: "7px 6px" }}>{it.taxRate}%</td>
              <td style={{ ...numCell, padding: "7px 0 7px 6px", fontWeight: 600 }}>{eur(lineNet(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summen */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 26 }}>
        <table style={{ minWidth: 280, borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={{ padding: "3px 12px 3px 0", color: soft }}>Nettobetrag</td><td style={{ ...numCell, padding: "3px 0" }}>{eur(totals.net)}</td></tr>
            {totals.taxByRate.map((r) => (
              <tr key={r.rate}><td style={{ padding: "3px 12px 3px 0", color: soft }}>zzgl. {r.rate}% USt</td><td style={{ ...numCell, padding: "3px 0" }}>{eur(r.tax)}</td></tr>
            ))}
            <tr style={{ borderTop: `2px solid ${ink}` }}>
              <td style={{ padding: "8px 12px 0 0", fontWeight: 800, fontSize: 13 }}>Gesamtbetrag</td>
              <td style={{ ...numCell, padding: "8px 0 0", fontWeight: 800, fontSize: 14, color: accent }}>{eur(totals.gross)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {doc.notes && <div style={{ marginBottom: 16, color: ink }}>{doc.notes}</div>}

      {!isQuote && (
        <div style={{ marginBottom: 26, padding: "12px 14px", background: "#fafafa", border: `1px solid ${line}`, borderRadius: 6 }}>
          Zahlbar ohne Abzug bis <strong>{dateLong((doc as Invoice).dueDate)}</strong> auf das unten genannte Konto.
          Bitte geben Sie bei der Überweisung die Rechnungsnummer <strong>{doc.number}</strong> an.
        </div>
      )}

      <div style={{ fontSize: 11, color: soft, marginBottom: 26 }}>
        Vielen Dank für die gute Zusammenarbeit.
      </div>

      {/* Fußzeile */}
      <div style={{ borderTop: `1px solid ${line}`, paddingTop: 12, fontSize: 9.5, color: soft, display: "flex", justifyContent: "space-between", gap: 20 }}>
        <div><strong style={{ color: ink }}>{company.name}</strong><br />{company.owner}<br />{company.address.replace(/\n/g, ", ")}</div>
        <div><strong style={{ color: ink }}>Bankverbindung</strong><br />{company.bank}<br />IBAN: {company.iban}{company.bic ? <><br />BIC: {company.bic}</> : null}</div>
        <div><strong style={{ color: ink }}>Kontakt &amp; Steuer</strong><br />USt-IdNr.: {company.taxId}<br />{company.email} · {company.phone}</div>
      </div>
    </div>
  )
}

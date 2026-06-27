"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Trash2,
  Printer,
  FileText,
  ArrowRight,
  LayoutTemplate,
  Search,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/lib/toast"
import {
  UNITS,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_COLOR,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
  type LineItem,
  type Quote,
  type Invoice,
  type QuoteStatus,
  type InvoiceStatus,
} from "@/lib/types"
import { computeTotals, lineNet } from "@/lib/totals"
import { eur, dateDE } from "@/lib/format"
import { todayISO, addDaysISO } from "@/lib/recurrence"
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
      return matchQ && matchS
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
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[180px] flex-1">
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
        <Button onClick={createNew}>
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
                className="flex w-full items-center gap-4 rounded-2xl border py-4 pl-6 pr-5 text-left transition-all hover:brightness-110"
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
                <div className="flex shrink-0 items-center gap-5">
                  <Badge color={color}>{label}</Badge>
                  <span className="num w-32 text-right font-heading text-xl font-bold" style={{ color }}>{eur(t.gross)}</span>
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
              templates={templates.map((t) => ({ id: t.id, name: t.name, items: t.items }))}
              defaultTaxRate={db.company.defaultTaxRate}
              onPatch={patchDoc}
              onRemove={() => removeDoc(selected.id)}
              onConvert={isQuote ? () => { store.convertQuoteToInvoice(selected.id); toast.success("Angebot in Rechnung umgewandelt") } : undefined}
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
  templates,
  defaultTaxRate,
  onPatch,
  onRemove,
  onConvert,
}: {
  kind: Kind
  doc: Doc
  customers: { id: string; company: string }[]
  templates: { id: string; name: string; items: Omit<LineItem, "id">[] }[]
  defaultTaxRate: number
  onPatch: (patch: Partial<Doc>) => void
  onRemove: () => void
  onConvert?: () => void
}) {
  const isQuote = kind === "quote"
  const totals = computeTotals(doc.items)
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
        <div className="flex items-center gap-2">
          {isQuote && onConvert && (
            <Button size="sm" variant="secondary" onClick={onConvert} title="In Rechnung umwandeln">
              <ArrowRight className="h-4 w-4" /> In Rechnung
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Drucken / PDF
          </Button>
          <button onClick={onRemove} aria-label="Beleg löschen" title="Löschen" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

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
          <DateField label="Fälligkeit" value={(doc as Invoice).dueDate} onChange={(v) => onPatch({ dueDate: v } as Partial<Doc>)} />
        )}
      </div>

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
                className="col-span-2 h-9 rounded-lg border border-border bg-white/[0.03] px-2.5 text-sm outline-none focus:border-primary/50 sm:col-span-1"
              />
              <input
                type="number" min={0} value={it.qty}
                onChange={(e) => updateItem(it.id, { qty: num0(e.target.value) })}
                className="h-9 rounded-lg border border-border bg-white/[0.03] px-2 text-right text-sm outline-none focus:border-primary/50"
              />
              <select
                value={it.unit}
                onChange={(e) => updateItem(it.id, { unit: e.target.value as LineItem["unit"] })}
                className="h-9 rounded-lg border border-border bg-white/[0.03] px-2 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <input
                type="number" min={0} step="0.01" value={it.price}
                onChange={(e) => updateItem(it.id, { price: num0(e.target.value) })}
                className="h-9 rounded-lg border border-border bg-white/[0.03] px-2 text-right text-sm outline-none focus:border-primary/50"
              />
              <select
                value={it.taxRate}
                onChange={(e) => updateItem(it.id, { taxRate: Number(e.target.value) })}
                className="h-9 rounded-lg border border-border bg-white/[0.03] px-2 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
              >
                <option value={19}>19%</option>
                <option value={7}>7%</option>
                <option value={0}>0%</option>
              </select>
              <div className="flex h-9 items-center justify-end px-1 text-sm font-medium tabular-nums">{eur(lineNet(it))}</div>
              <button onClick={() => removeItem(it.id)} aria-label="Position löschen" title="Position löschen" className="flex h-9 items-center justify-center text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
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
            <div className="flex items-center gap-1.5">
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setItems([...doc.items, ...t.items.map((it) => ({ ...it, id: newId() }))])}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  + {t.name}
                </button>
              ))}
            </div>
          )}
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
            <span className="font-heading text-lg font-bold text-primary">{eur(totals.gross)}</span>
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

/* ---------- Druck-Layout (DE) ---------- */

function PrintDoc({
  kind,
  doc,
  customer,
  company,
}: {
  kind: Kind
  doc: Doc
  customer?: { company: string; contactName?: string; address?: string }
  company: { name: string; owner: string; address: string; taxId: string; iban: string; bank: string; email: string; phone: string }
}) {
  const isQuote = kind === "quote"
  const totals = computeTotals(doc.items)
  const title = isQuote ? "Angebot" : "Rechnung"
  return (
    <div style={{ color: "#000", fontFamily: "Arial, sans-serif", fontSize: 12, lineHeight: 1.5 }}>
      {/* Kopf */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #E39832", paddingBottom: 12, marginBottom: 24 }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-vitaminb-orange.png" alt="Vitamin B" style={{ height: 34, width: "auto", marginBottom: 4 }} />
          <div style={{ fontSize: 11, color: "#555" }}>{company.name}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#333" }}>
          <div>{company.address}</div>
          <div>{company.email} · {company.phone}</div>
          <div>USt-IdNr.: {company.taxId}</div>
        </div>
      </div>

      {/* Empfänger + Belegdaten */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>{company.name} · {company.address}</div>
          <div style={{ fontWeight: 700 }}>{customer?.company ?? "—"}</div>
          {customer?.contactName && <div>{customer.contactName}</div>}
          {customer?.address && <div>{customer.address}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{title}</div>
          <div>Nr. {doc.number}</div>
          <div>Datum: {dateDE(isQuote ? (doc as Quote).createdAt.slice(0, 10) : (doc as Invoice).issueDate).replace(/^\w+, /, "")}</div>
          {isQuote
            ? <div>Gültig bis: {dateDE((doc as Quote).validUntil).replace(/^\w+, /, "")}</div>
            : <div>Fällig bis: {dateDE((doc as Invoice).dueDate).replace(/^\w+, /, "")}</div>}
        </div>
      </div>

      {/* Positionen */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000", textAlign: "left" }}>
            <th style={{ padding: "6px 4px" }}>Pos.</th>
            <th style={{ padding: "6px 4px" }}>Beschreibung</th>
            <th style={{ padding: "6px 4px", textAlign: "right" }}>Menge</th>
            <th style={{ padding: "6px 4px" }}>Einh.</th>
            <th style={{ padding: "6px 4px", textAlign: "right" }}>Einzel</th>
            <th style={{ padding: "6px 4px", textAlign: "right" }}>USt</th>
            <th style={{ padding: "6px 4px", textAlign: "right" }}>Netto</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((it, i) => (
            <tr key={it.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "6px 4px" }}>{i + 1}</td>
              <td style={{ padding: "6px 4px" }}>{it.description}</td>
              <td style={{ padding: "6px 4px", textAlign: "right" }}>{it.qty}</td>
              <td style={{ padding: "6px 4px" }}>{it.unit}</td>
              <td style={{ padding: "6px 4px", textAlign: "right" }}>{eur(it.price)}</td>
              <td style={{ padding: "6px 4px", textAlign: "right" }}>{it.taxRate}%</td>
              <td style={{ padding: "6px 4px", textAlign: "right" }}>{eur(lineNet(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summen */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <table style={{ minWidth: 260 }}>
          <tbody>
            <tr><td style={{ padding: "2px 8px", color: "#555" }}>Nettobetrag</td><td style={{ padding: "2px 8px", textAlign: "right" }}>{eur(totals.net)}</td></tr>
            {totals.taxByRate.map((r) => (
              <tr key={r.rate}><td style={{ padding: "2px 8px", color: "#555" }}>zzgl. {r.rate}% USt</td><td style={{ padding: "2px 8px", textAlign: "right" }}>{eur(r.tax)}</td></tr>
            ))}
            <tr style={{ borderTop: "2px solid #000", fontWeight: 800, fontSize: 14 }}>
              <td style={{ padding: "6px 8px" }}>Gesamtbetrag</td>
              <td style={{ padding: "6px 8px", textAlign: "right" }}>{eur(totals.gross)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {doc.notes && <div style={{ marginBottom: 20 }}>{doc.notes}</div>}

      {!isQuote && (
        <div style={{ marginBottom: 20 }}>
          Bitte überweisen Sie den Gesamtbetrag bis zum {dateDE((doc as Invoice).dueDate).replace(/^\w+, /, "")} auf das unten genannte Konto.
        </div>
      )}

      {/* Fußzeile */}
      <div style={{ borderTop: "1px solid #ccc", paddingTop: 10, fontSize: 10, color: "#666", display: "flex", justifyContent: "space-between" }}>
        <div>{company.name}<br />{company.owner}</div>
        <div>{company.bank}<br />IBAN: {company.iban}</div>
        <div>USt-IdNr.: {company.taxId}<br />{company.email}</div>
      </div>
    </div>
  )
}

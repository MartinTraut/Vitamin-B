"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  Trash2,
  Printer,
  FileText,
  ArrowRight,
  LayoutTemplate,
} from "lucide-react"
import { useStore } from "@/lib/store"
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
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Kind = "quote" | "invoice"
type Doc = Quote | Invoice

function newId() {
  return Math.random().toString(36).slice(2, 8)
}
function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function plusDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function DocumentsView({ kind }: { kind: Kind }) {
  const store = useStore()
  const { db, activePerson } = store
  const docs: Doc[] = kind === "quote" ? db.quotes : db.invoices
  const isQuote = kind === "quote"

  const [selectedId, setSelectedId] = useState<string | null>(docs[0]?.id ?? null)
  const [pendingNew, setPendingNew] = useState(false)

  useEffect(() => {
    if (pendingNew && docs.length) {
      setSelectedId(docs[0].id)
      setPendingNew(false)
    }
  }, [docs, pendingNew])

  const selected = docs.find((d) => d.id === selectedId) ?? null
  const customerName = (id: string) => db.customers.find((c) => c.id === id)?.company ?? "—"

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
    if (isQuote) {
      store.addQuote({ customerId: cid, status: "entwurf", items: [], validUntil: plusDaysISO(14), person: activePerson })
    } else {
      store.addInvoice({ customerId: cid, status: "entwurf", items: [], issueDate: todayISO(), dueDate: plusDaysISO(14), person: activePerson })
    }
    setPendingNew(true)
  }

  const templates = db.templates.filter((t) => t.kind === kind)

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <span className="text-sm text-muted-foreground">{docs.length} {isQuote ? "Angebote" : "Rechnungen"}</span>
        </div>
        <Button onClick={createNew}>
          <Plus className="h-4 w-4" /> {isQuote ? "Neues Angebot" : "Neue Rechnung"}
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Liste */}
        <div className="space-y-2.5">
          {docs.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">Noch keine Belege.</Card>}
          {docs.map((d) => {
            const t = computeTotals(d.items)
            const active = d.id === selectedId
            const color = isQuote ? QUOTE_STATUS_COLOR[(d as Quote).status] : INVOICE_STATUS_COLOR[(d as Invoice).status]
            const label = isQuote ? QUOTE_STATUS_LABEL[(d as Quote).status] : INVOICE_STATUS_LABEL[(d as Invoice).status]
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={cn(
                  "w-full rounded-2xl border bg-card/80 p-4 text-left transition-all hover:border-white/15",
                  active ? "border-primary/50 ring-1 ring-inset ring-primary/30" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading text-sm font-bold">{isQuote ? "AN" : "RE"} {d.number}</span>
                  <Badge color={color}>{label}</Badge>
                </div>
                <div className="mt-1 truncate text-sm">{customerName(d.customerId)}</div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.items.length} Position{d.items.length === 1 ? "" : "en"}</span>
                  <span className="font-semibold text-foreground">{eur(t.gross)}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selected ? (
            <Editor
              kind={kind}
              doc={selected}
              customers={db.customers.map((c) => ({ id: c.id, company: c.company }))}
              templates={templates.map((t) => ({ id: t.id, name: t.name, items: t.items }))}
              onPatch={patchDoc}
              onRemove={() => removeDoc(selected.id)}
              onConvert={isQuote ? () => store.convertQuoteToInvoice(selected.id) : undefined}
            />
          ) : (
            <Card className="flex h-full items-center justify-center p-12 text-sm text-muted-foreground">
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
  onPatch,
  onRemove,
  onConvert,
}: {
  kind: Kind
  doc: Doc
  customers: { id: string; company: string }[]
  templates: { id: string; name: string; items: Omit<LineItem, "id">[] }[]
  onPatch: (patch: Partial<Doc>) => void
  onRemove: () => void
  onConvert?: () => void
}) {
  const isQuote = kind === "quote"
  const totals = computeTotals(doc.items)

  function setItems(items: LineItem[]) {
    onPatch({ items } as Partial<Doc>)
  }
  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems(doc.items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  function addItem(preset?: Omit<LineItem, "id">) {
    setItems([...doc.items, { id: newId(), description: "", qty: 1, unit: "Stk", price: 0, taxRate: 19, ...preset }])
  }
  function removeItem(id: string) {
    setItems(doc.items.filter((it) => it.id !== id))
  }

  return (
    <Card className="overflow-hidden">
      {/* Kopf */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
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
          <button onClick={onRemove} title="Löschen" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive">
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
                onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })}
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
                onChange={(e) => updateItem(it.id, { price: Number(e.target.value) })}
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
              <button onClick={() => removeItem(it.id)} className="flex h-9 items-center justify-center text-muted-foreground transition-colors hover:text-destructive">
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
          <div style={{ fontSize: 22, fontWeight: 800, color: "#E39832" }}>vitamin b</div>
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
          <div>Datum: {dateDE(isQuote ? (doc as Quote).validUntil : (doc as Invoice).issueDate).replace(/^\w+, /, "")}</div>
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

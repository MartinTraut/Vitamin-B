"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, TrendingDown, Receipt, ReceiptText, Layers, ArrowUpRight, Search, Building2, Download } from "lucide-react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { EXPENSE_CATEGORIES, type Transaction } from "@/lib/types"
import { eur, eur0, dateShort, parseAmountDE } from "@/lib/format"
import { downloadCsv, deNum } from "@/lib/csv"
import { todayISO, toISO } from "@/lib/recurrence"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiTile } from "@/components/ui/kpi-tile"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { LedgerTable } from "@/components/ui/ledger-table"
import { CategoryDonut } from "@/components/dashboard/charts"
import { cn } from "@/lib/utils"
import { EXPENSE, ORANGE, BLUE, PURPLE } from "@/lib/theme-colors"

function netOf(amount: number, rate: number) {
  return amount / (1 + rate / 100)
}

export function ExpensesView() {
  const { db, addTransaction, updateTransaction, removeTransaction } = useStore()
  const [adding, setAdding] = useState(false)
  // Beleg im Bearbeiten-Modus — nutzt dasselbe Formular wie das Erfassen.
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<"all" | "week" | "month">("all")
  const [cat, setCat] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount">("date")

  // Nur geschäftliche Ausgaben (Belege/Eingangsrechnungen). Private laufen unter /privat.
  const expenses = useMemo(
    () => db.transactions.filter((t) => t.type === "expense" && t.scope !== "private"),
    [db.transactions],
  )

  const monthStartISO = useMemo(() => {
    const now = new Date()
    return toISO(new Date(now.getFullYear(), now.getMonth(), 1))
  }, [])

  const m = useMemo(() => {
    const total = expenses.reduce((s, t) => s + t.amount, 0)
    const month = expenses.filter((t) => t.date >= monthStartISO).reduce((s, t) => s + t.amount, 0)
    const vorsteuer = expenses.reduce((s, t) => s + (t.amount - netOf(t.amount, t.taxRate)), 0)
    const byCat = new Map<string, number>()
    for (const t of expenses) byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount)
    const cats = [...byCat.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    return { total, month, vorsteuer, count: expenses.length, cats }
  }, [expenses, monthStartISO])

  // Gefilterte Belegliste (Suche · Zeitraum · Kategorie)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let startISO = ""
    if (period === "week") {
      const w = new Date()
      w.setHours(0, 0, 0, 0)
      w.setDate(w.getDate() - ((w.getDay() + 6) % 7))
      startISO = toISO(w)
    } else if (period === "month") {
      startISO = monthStartISO
    }
    const list = expenses
      .filter((t) => {
        if (cat !== "all" && t.category !== cat) return false
        if (startISO && t.date < startISO) return false
        if (q && !(t.category.toLowerCase().includes(q) || (t.note ?? "").toLowerCase().includes(q))) return false
        return true
      })
      .sort((a, b) => (sortBy === "amount" ? b.amount - a.amount : b.date.localeCompare(a.date)))
    const sum = list.reduce((s, t) => s + t.amount, 0)
    return { list, sum }
  }, [expenses, search, period, cat, monthStartISO, sortBy])

  return (
    <div className="space-y-4">
      {/* Banner — eigener Belege-/Ausgaben-Bereich, klar abgegrenzt */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4" style={{ background: `linear-gradient(135deg, ${EXPENSE}1f, ${EXPENSE}06 70%)`, borderColor: `${EXPENSE}40` }}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${EXPENSE}24`, color: EXPENSE, border: `1px solid ${EXPENSE}55` }}>
            <ReceiptText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="font-heading text-base font-bold">Belege & Ausgaben</div>
            <div className="text-xs text-muted-foreground">Eingangsrechnungen & Belege erfassen · fließt direkt in die Finanzen</div>
          </div>
        </div>
        <Link href="/finanzen" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          <Building2 className="h-3.5 w-3.5" /> Finanzen-Übersicht →
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile icon={TrendingDown} label="Ausgaben gesamt" value={eur0(m.total)} accent={EXPENSE} />
        <KpiTile icon={ReceiptText} label="Diesen Monat" value={eur0(m.month)} accent={ORANGE} />
        <KpiTile icon={Receipt} label="Vorsteuer abziehbar" value={eur0(m.vorsteuer)} accent={BLUE} />
        <KpiTile icon={Layers} label="Belege" value={String(m.count)} accent={PURPLE} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Belegliste */}
        <Card className="flex flex-col overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between gap-2 border-b border-border p-4">
            <h3 className="font-heading text-base font-bold">Belege</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                title="Gefilterte Belege als CSV exportieren (Steuerberater)"
                onClick={() =>
                  downloadCsv(
                    `belege-${todayISO()}.csv`,
                    ["Datum", "Kategorie", "Notiz", "Betrag brutto", "USt-Satz", "Netto", "Vorsteuer"],
                    filtered.list.map((t) => {
                      const net = netOf(t.amount, t.taxRate)
                      return [dateShort(t.date), t.category, t.note ?? "", deNum(t.amount), `${t.taxRate} %`, deNum(net), deNum(t.amount - net)]
                    }),
                  )
                }
              >
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button size="sm" onClick={() => setAdding((v) => !v)}>
                <Plus className="h-4 w-4" /> Beleg erfassen
              </Button>
            </div>
          </div>

          {/* Filterleiste: Suche · Zeitraum · Kategorie */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-white/[0.015] px-4 py-3">
            <div className="relative min-w-[150px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kategorie oder Notiz suchen…"
                className="h-9 w-full rounded-lg border border-border bg-white/[0.03] pl-9 pr-3 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <SegmentedControl
              value={period}
              onChange={(v) => setPeriod(v as typeof period)}
              options={[{ v: "all", l: "Gesamt" }, { v: "week", l: "Woche" }, { v: "month", l: "Monat" }]}
            />
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
              <option value="all">Alle Kategorien</option>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <SegmentedControl
              value={sortBy}
              onChange={(v) => setSortBy(v as typeof sortBy)}
              options={[{ v: "date", l: "Datum" }, { v: "amount", l: "Betrag" }]}
            />
          </div>

          {(adding || editing) && (
            <ExpenseForm
              key={editing?.id ?? "new"}
              initial={editing ?? undefined}
              onCancel={() => { setAdding(false); setEditing(null) }}
              onSave={(input) => {
                if (editing) updateTransaction(editing.id, input)
                else addTransaction(input)
                setAdding(false)
                setEditing(null)
              }}
            />
          )}

          {/* Echte Tabellen-Struktur mit Monats-Gruppen — Betrag auf fester rechtsbündiger Achse */}
          <LedgerTable
            withVat
            groupMonths={sortBy === "date"}
            emptyText={expenses.length === 0 ? "Noch keine Belege erfasst." : "Keine Treffer für diesen Filter."}
            rows={filtered.list.map((t) => ({
              id: t.id,
              label: t.category,
              note: t.note,
              date: t.date,
              amount: t.amount,
              sign: "−" as const,
              color: EXPENSE,
              vat: `${t.taxRate} %`,
              icon: <ArrowUpRight className="h-4 w-4" />,
              onEdit: () => { setEditing(t); setAdding(false) },
              editLabel: "Beleg bearbeiten",
              onRemove: () => removeTransaction(t.id),
              removeLabel: "Beleg löschen",
            }))}
          />

          {filtered.list.length > 0 && (
            <div className="flex items-center justify-between border-t border-border bg-white/[0.015] px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">{filtered.list.length} {filtered.list.length === 1 ? "Beleg" : "Belege"}</span>
              <span className="font-semibold text-muted-foreground">
                Summe Auswahl <span className="num font-bold" style={{ color: EXPENSE }}>−{eur(filtered.sum)}</span>
              </span>
            </div>
          )}
        </Card>

        {/* Kategorien */}
        <Card className="p-4">
          <h3 className="mb-3 font-heading text-base font-bold">Ausgaben nach Kategorie</h3>
          {m.cats.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Noch keine Daten.</p>
          ) : (
            <CategoryDonut data={m.cats} />
          )}
        </Card>
      </div>
    </div>
  )
}

function ExpenseForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Transaction
  onSave: (input: Omit<Transaction, "id">) => void
  onCancel: () => void
}) {
  const [category, setCategory] = useState(initial?.category ?? EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace(".", ",") : "")
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? 19)
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [note, setNote] = useState(initial?.note ?? "")
  const [error, setError] = useState(false)

  // Formular beim Öffnen in den Blick holen — bei langen Listen sitzt es sonst
  // unsichtbar über der Tabelle ("es passiert nichts").
  const formRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [])

  return (
    <div ref={formRef} className="space-y-3 border-b border-border bg-white/[0.02] p-4">
      {initial && <div className="eyebrow">Beleg bearbeiten</div>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input autoFocus value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.,]/g, "")); setError(false) }} inputMode="decimal" placeholder="Betrag € (brutto)" className={cn("h-10 rounded-lg border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50", error ? "border-destructive" : "border-border")} />
        <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
          <option value={19}>19% USt</option>
          <option value={7}>7% USt</option>
          <option value={0}>0% USt</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]" />
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lieferant / Notiz (optional)" className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Abbrechen</Button>
        <Button size="sm" onClick={() => {
          const val = parseAmountDE(amount)
          if (!Number.isFinite(val) || val <= 0) { setError(true); return }
          onSave({ type: "expense", category, amount: val, taxRate, date, note: note.trim() || undefined })
        }}>Speichern</Button>
      </div>
    </div>
  )
}


"use client"

import { useMemo, useState } from "react"
import { Plus, TrendingUp, TrendingDown, Wallet, Receipt, Trash2, ArrowDownLeft, ArrowUpRight, Search, Building2, PiggyBank, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type TxType,
  type Transaction,
} from "@/lib/types"
import { eur, eur0, dateDE } from "@/lib/format"
import { todayISO, toISO } from "@/lib/recurrence"
import { buildSeries, GRAN_LABEL, type Gran } from "@/lib/finance-series"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FinanceChart, CategoryDonut, ChartLegend, type SeriesKey } from "@/components/dashboard/charts"
import { cn } from "@/lib/utils"

const INCOME = "#34d399"
const EXPENSE = "#ef4444"

function netOf(amount: number, rate: number) {
  return amount / (1 + rate / 100)
}

// DE-Betrag robust parsen: "1.234,56" -> 1234.56, "12,50" -> 12.5, "12.50" -> 12.5
function parseAmount(s: string): number {
  let t = s.trim()
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".")
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

export function FinanceView() {
  const { db, addTransaction, removeTransaction } = useStore()
  const [adding, setAdding] = useState(false)
  const [gran, setGran] = useState<Gran>("month")
  // Welche Verlauf-Linien sichtbar sind (über die Legende umschaltbar).
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({ income: true, expense: true, debt: true })
  const toggleSeries = (k: SeriesKey) => setVisible((v) => ({ ...v, [k]: !v[k] }))
  // Ledger-Filter
  const [search, setSearch] = useState("")
  const [txType, setTxType] = useState<"all" | "income" | "expense">("all")
  const [txPeriod, setTxPeriod] = useState<"all" | "week" | "month">("all")

  // Nur geschäftliche Buchungen — private laufen getrennt unter /privat.
  const businessTx = useMemo(() => db.transactions.filter((t) => t.scope !== "private"), [db.transactions])
  const chartData = useMemo(() => buildSeries(businessTx, gran), [businessTx, gran])

  const m = useMemo(() => {
    const tx = businessTx
    const income = tx.filter((t) => t.type === "income")
    const expense = tx.filter((t) => t.type === "expense")
    const sumIncome = income.reduce((s, t) => s + t.amount, 0)
    const sumExpense = expense.reduce((s, t) => s + t.amount, 0)
    const ustOut = income.reduce((s, t) => s + (t.amount - netOf(t.amount, t.taxRate)), 0) // USt eingenommen
    const vorsteuer = expense.reduce((s, t) => s + (t.amount - netOf(t.amount, t.taxRate)), 0) // Vorsteuer
    // Ausgaben je Kategorie
    const byCat = new Map<string, number>()
    for (const t of expense) byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount)
    const cats = [...byCat.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    const maxCat = cats.reduce((mx, c) => Math.max(mx, c.value), 0)
    return {
      sumIncome, sumExpense, profit: sumIncome - sumExpense,
      ustOut, vorsteuer, zahllast: ustOut - vorsteuer,
      cats, maxCat,
      sorted: [...tx].sort((a, b) => b.date.localeCompare(a.date)),
    }
  }, [businessTx])

  // Gefilterte Buchungsliste (Suche + Typ + Zeitraum)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    let startISO = ""
    if (txPeriod === "week") {
      const w = new Date(now)
      w.setDate(w.getDate() - ((w.getDay() + 6) % 7))
      startISO = toISO(w)
    } else if (txPeriod === "month") {
      startISO = toISO(new Date(now.getFullYear(), now.getMonth(), 1))
    }
    const list = m.sorted.filter((t) => {
      if (txType !== "all" && t.type !== txType) return false
      if (startISO && t.date < startISO) return false
      if (q && !(t.category.toLowerCase().includes(q) || (t.note ?? "").toLowerCase().includes(q))) return false
      return true
    })
    const net = list.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0)
    return { list, net }
  }, [m.sorted, search, txType, txPeriod])

  return (
    <div className="space-y-4">
      {/* Firmen-Banner — klare Abgrenzung zu den privaten Finanzen */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4" style={{ background: `linear-gradient(135deg, ${INCOME}1f, ${INCOME}06 70%)`, borderColor: `${INCOME}40` }}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${INCOME}24`, color: INCOME, border: `1px solid ${INCOME}55` }}>
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="font-heading text-base font-bold">Firmen-Finanzen{db.company?.name ? ` · ${db.company.name}` : ""}</div>
            <div className="text-xs text-muted-foreground">Geschäftliche Einnahmen & Ausgaben · teamweit</div>
          </div>
        </div>
        <Link
          href="/privat"
          className="group flex shrink-0 items-center gap-2 rounded-xl border border-primary/45 bg-primary/15 px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:border-primary/70 hover:bg-primary/25 hover:shadow-md hover:shadow-primary/10"
        >
          <PiggyBank className="h-4 w-4 shrink-0" />
          <span>Zu den privaten Finanzen</span>
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon={TrendingUp} label="Einnahmen" value={eur0(m.sumIncome)} accent={INCOME} />
        <Kpi icon={TrendingDown} label="Ausgaben" value={eur0(m.sumExpense)} accent={EXPENSE} />
        <Kpi icon={Wallet} label="Gewinn" value={eur0(m.profit)} accent={m.profit >= 0 ? INCOME : EXPENSE} />
        <Kpi icon={Receipt} label="USt-Zahllast" value={eur0(m.zahllast)} accent="#E39832" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Verlauf */}
        <Card className="flex flex-col lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 pb-2">
            <h3 className="font-heading text-base font-bold">Verlauf · Einnahmen & Ausgaben</h3>
            <div className="flex flex-wrap items-center gap-3">
              <ChartLegend
                visible={visible}
                onToggle={toggleSeries}
                items={[
                  { key: "income", color: INCOME },
                  { key: "expense", color: EXPENSE },
                ]}
              />
              {/* Tag / Woche / Monat */}
              <div className="flex items-center rounded-lg border border-border bg-white/[0.03] p-0.5">
                {(["day", "week", "month"] as Gran[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGran(g)}
                    aria-pressed={gran === g}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                      gran === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {GRAN_LABEL[g]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="min-h-[240px] flex-1 p-3 pt-1">
            <FinanceChart data={chartData} height="full" visible={visible} />
          </div>
        </Card>

        {/* USt + Kategorien */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 font-heading text-base font-bold">Umsatzsteuer</h3>
            <UstRow label="USt eingenommen" value={m.ustOut} />
            <UstRow label="Vorsteuer (abziehbar)" value={-m.vorsteuer} />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2.5">
              <span className="text-sm font-semibold">Zahllast ans Finanzamt</span>
              <span className="font-heading text-lg font-bold" style={{ color: "#E39832" }}>{eur(m.zahllast)}</span>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-heading text-base font-bold">Ausgaben nach Kategorie</h3>
            <CategoryDonut data={m.cats} />
          </Card>
        </div>
      </div>

      {/* Ledger */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-heading text-base font-bold">Buchungen</h3>
          <Button size="sm" onClick={() => setAdding((v) => !v)}>
            <Plus className="h-4 w-4" /> Buchung
          </Button>
        </div>

        {/* Filterleiste: Suche · Typ · Zeitraum */}
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
          <Segmented
            value={txType}
            onChange={(v) => setTxType(v as typeof txType)}
            options={[{ v: "all", l: "Alle" }, { v: "income", l: "Einnahmen", color: INCOME }, { v: "expense", l: "Ausgaben", color: EXPENSE }]}
          />
          <Segmented
            value={txPeriod}
            onChange={(v) => setTxPeriod(v as typeof txPeriod)}
            options={[{ v: "all", l: "Gesamt" }, { v: "week", l: "Woche" }, { v: "month", l: "Monat" }]}
          />
        </div>

        {adding && (
          <AddTransaction
            onCancel={() => setAdding(false)}
            onSave={(input) => { addTransaction(input); setAdding(false) }}
          />
        )}
        <div className="divide-y divide-border">
          {filtered.list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">{m.sorted.length === 0 ? "Noch keine Buchungen." : "Keine Treffer für diesen Filter."}</p>}
          {filtered.list.map((t) => {
            const inc = t.type === "income"
            return (
              <div key={t.id} className="group flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${inc ? INCOME : EXPENSE}1f`, color: inc ? INCOME : EXPENSE }}>
                  {inc ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{t.category}{t.note ? <span className="font-normal text-muted-foreground"> · {t.note}</span> : ""}</div>
                  <div className="text-xs text-muted-foreground">{dateDE(t.date)} · {t.taxRate}% USt</div>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: inc ? INCOME : EXPENSE }}>
                  {inc ? "+" : "−"}{eur(t.amount)}
                </span>
                <button onClick={() => removeTransaction(t.id)} aria-label="Buchung löschen" title="Buchung löschen" className="action-reveal rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Auswahl-Summe */}
        {filtered.list.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-white/[0.015] px-4 py-2.5 text-xs">
            <span className="text-muted-foreground">{filtered.list.length} {filtered.list.length === 1 ? "Buchung" : "Buchungen"}</span>
            <span className="font-semibold text-muted-foreground">
              Saldo Auswahl <span className="num font-bold" style={{ color: filtered.net >= 0 ? INCOME : EXPENSE }}>{filtered.net >= 0 ? "+" : "−"}{eur(Math.abs(filtered.net))}</span>
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string; color?: string }[] }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-white/[0.03] p-0.5">
      {options.map((o) => {
        const active = value === o.v
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            style={active ? { backgroundColor: o.color ?? "var(--primary)", color: o.color ? "#fff" : "var(--primary-foreground)" } : undefined}
          >
            {o.l}
          </button>
        )
      })}
    </div>
  )
}

function AddTransaction({
  onSave,
  onCancel,
}: {
  onSave: (input: Omit<Transaction, "id">) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<TxType>("expense")
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState("")
  const [taxRate, setTaxRate] = useState(19)
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState(false)
  const [note, setNote] = useState("")
  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="space-y-3 border-b border-border bg-white/[0.02] p-4">
      <div className="flex gap-2">
        <button onClick={() => { setType("expense"); setCategory(EXPENSE_CATEGORIES[0]) }} className={cn("flex-1 rounded-lg border py-2 text-sm font-medium transition-colors", type === "expense" ? "border-transparent" : "border-border text-muted-foreground")} style={type === "expense" ? { backgroundColor: `${EXPENSE}26`, color: EXPENSE } : undefined}>Ausgabe</button>
        <button onClick={() => { setType("income"); setCategory(INCOME_CATEGORIES[0]) }} className={cn("flex-1 rounded-lg border py-2 text-sm font-medium transition-colors", type === "income" ? "border-transparent" : "border-border text-muted-foreground")} style={type === "income" ? { backgroundColor: `${INCOME}26`, color: INCOME } : undefined}>Einnahme</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.,]/g, "")); setError(false) }} inputMode="decimal" placeholder="Betrag € (brutto)" className={cn("h-10 rounded-lg border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50", error ? "border-destructive" : "border-border")} />
        <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
          <option value={19}>19% USt</option>
          <option value={7}>7% USt</option>
          <option value={0}>0% USt</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]" />
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz (optional)" className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Abbrechen</Button>
        <Button size="sm" onClick={() => {
          const val = parseAmount(amount)
          if (!Number.isFinite(val) || val <= 0) { setError(true); return }
          onSave({ type, category, amount: val, taxRate, date, note: note.trim() || undefined })
        }}>Speichern</Button>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, accent }: { icon: typeof TrendingUp; label: string; value: string; accent: string }) {
  return (
    <Card className="hover-aura flex items-center gap-3 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1f`, color: accent, border: `1px solid ${accent}33` }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="eyebrow truncate">{label}</div>
        <div className="num truncate font-heading text-[clamp(1rem,5vw,1.5rem)] font-bold leading-tight tracking-tight sm:text-2xl">{value}</div>
      </div>
    </Card>
  )
}

function UstRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{eur(value)}</span>
    </div>
  )
}

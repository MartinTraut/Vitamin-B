"use client"

import { useMemo, useState } from "react"
import { Plus, TrendingUp, TrendingDown, Wallet, Receipt, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { useStore } from "@/lib/store"
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type TxType,
  type Transaction,
} from "@/lib/types"
import { eur, eur0, dateDE } from "@/lib/format"
import { todayISO } from "@/lib/recurrence"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FinanceChart, CategoryDonut } from "@/components/dashboard/charts"
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

  const m = useMemo(() => {
    const tx = db.transactions
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
  }, [db.transactions])

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={TrendingUp} label="Einnahmen" value={eur0(m.sumIncome)} accent={INCOME} />
        <Kpi icon={TrendingDown} label="Ausgaben" value={eur0(m.sumExpense)} accent={EXPENSE} />
        <Kpi icon={Wallet} label="Gewinn" value={eur0(m.profit)} accent={m.profit >= 0 ? INCOME : EXPENSE} />
        <Kpi icon={Receipt} label="USt-Zahllast" value={eur0(m.zahllast)} accent="#E39832" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Verlauf */}
        <Card className="flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between p-4 pb-0">
            <h3 className="font-heading text-base font-bold">Verlauf · Einnahmen & Ausgaben</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: INCOME }} />Einnahmen</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: EXPENSE }} />Ausgaben</span>
            </div>
          </div>
          <div className="p-3">
            <FinanceChart data={db.finance} height={230} />
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
        {adding && (
          <AddTransaction
            onCancel={() => setAdding(false)}
            onSave={(input) => { addTransaction(input); setAdding(false) }}
          />
        )}
        <div className="divide-y divide-border">
          {m.sorted.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Noch keine Buchungen.</p>}
          {m.sorted.map((t) => {
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
                <button onClick={() => removeTransaction(t.id)} aria-label="Buchung löschen" title="Buchung löschen" className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </Card>
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
      <div className="min-w-0">
        <div className="eyebrow truncate">{label}</div>
        <div className="num font-heading text-2xl font-bold leading-tight tracking-tight">{value}</div>
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

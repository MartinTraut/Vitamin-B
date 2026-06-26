"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  CheckSquare,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react"
import { useStore } from "@/lib/store"
import {
  PEOPLE,
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  type CashflowEvent,
} from "@/lib/types"
import { eur0, dateDE } from "@/lib/format"
import { occurrencesInRange, todayISO, addDaysISO } from "@/lib/recurrence"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FinanceChart } from "./charts"

const INCOME = "#34d399"
const EXPENSE = "#ef4444"
const POTENTIAL = "#eab308"

function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(iso + "T00:00:00")
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}
function relDayLabel(iso: string): string {
  const n = daysUntil(iso)
  if (n <= 0) return "heute"
  if (n === 1) return "morgen"
  if (n <= 7) return `in ${n} T.`
  return dateDE(iso).replace(/^\w+, /, "")
}

export function Overview() {
  const { db, activePerson } = useStore()
  const person = PEOPLE.find((p) => p.id === activePerson)!

  const data = useMemo(() => {
    const today = todayISO()
    const weekEnd = addDaysISO(today, 7)

    const myTasks = db.tasks.filter((t) => t.person === activePerson)
    const openTasks = myTasks.filter((t) => t.status !== "done")

    const myAppts = db.appointments.filter((a) => a.person === activePerson)
    const upcoming = myAppts
      .flatMap((a) => occurrencesInRange(a, today, weekEnd).map((date) => ({ appt: a, date })))
      .sort((x, y) => x.date.localeCompare(y.date))

    const last = db.finance[db.finance.length - 1]

    const horizon = addDaysISO(today, 30)
    const upcomingCash = [...db.cashflow]
      .filter((c) => c.date >= today && c.date <= horizon)
      .sort((a, b) => a.date.localeCompare(b.date))
    const nextIncome = upcomingCash.filter((c) => c.kind === "income")
    const nextExpense = upcomingCash.filter((c) => c.kind === "expense")
    const sumIncome = nextIncome.reduce((s, c) => s + c.amount, 0)
    const sumExpense = nextExpense.reduce((s, c) => s + c.amount, 0)

    return {
      openTasks,
      upcoming,
      income: last.income,
      expense: last.expense,
      profit: last.income - last.expense,
      nextIncome,
      nextExpense,
      sumIncome,
      sumExpense,
      net: sumIncome - sumExpense,
    }
  }, [db, activePerson])

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Begrüßung — kompakt */}
      <div className="flex items-baseline gap-2">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          <span style={{ color: person.color }}>{person.name}</span>
        </h2>
        <span className="text-sm text-muted-foreground">— dein Überblick auf einen Blick</span>
      </div>

      {/* KPIs — kompakte Tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CheckSquare} label="Offene Aufgaben" value={String(data.openTasks.length)} accent="#E39832" />
        <Stat icon={CalendarClock} label="Termine (7 T.)" value={String(data.upcoming.length)} accent="#3b82f6" />
        <Stat icon={TrendingUp} label="Einnahmen / Mt." value={eur0(data.income)} accent={INCOME} />
        <Stat icon={TrendingDown} label="Ausgaben / Mt." value={eur0(data.expense)} accent={EXPENSE} />
      </div>

      {/* Reihe 1: Chart (oben) + Termine */}
      <div className="grid min-h-0 flex-[1.25] gap-4 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader className="items-center pb-0">
            <div className="flex items-baseline gap-3">
              <CardTitle>Einnahmen & Ausgaben</CardTitle>
              <span className="text-xs text-muted-foreground">
                Gewinn akt. Monat: <span className="font-semibold" style={{ color: INCOME }}>{eur0(data.profit)}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: INCOME }} />Einnahmen</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: EXPENSE }} />Ausgaben</span>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-3">
            <FinanceChart data={db.finance} height="full" />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Anstehende Termine</CardTitle>
            <Link href="/kalender" className="text-xs text-primary hover:underline">Kalender</Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 p-3">
            {data.upcoming.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Keine Termine (7 Tage).</p>
            )}
            {data.upcoming.slice(0, 4).map(({ appt, date }) => (
              <div key={appt.id + date} className="flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] p-2.5">
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[appt.category] }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium">{appt.title}</div>
                  <div className="text-xs text-muted-foreground">{relDayLabel(date)}{appt.time ? ` · ${appt.time}` : ""}</div>
                </div>
                <Badge color={CATEGORY_COLOR[appt.category]}>{CATEGORY_LABEL[appt.category]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reihe 2: Cashflow (kompakt) + Aufgaben */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col overflow-hidden lg:col-span-2">
          <CardHeader className="items-center border-b border-border pb-3">
            <CardTitle>Anstehende Zahlungen <span className="ml-1 text-xs font-normal text-muted-foreground">· 30 Tage</span></CardTitle>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Saldo </span>
              <span className="font-heading text-base font-bold" style={{ color: data.net >= 0 ? INCOME : EXPENSE }}>
                {data.net >= 0 ? "+" : ""}{eur0(data.net)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid min-h-0 flex-1 content-start gap-4 p-3 sm:grid-cols-2">
            <CashflowColumn title="Einnahmen" icon={<ArrowDownLeft className="h-3.5 w-3.5" />} color={INCOME} total={data.sumIncome} items={data.nextIncome} sign="+" />
            <CashflowColumn title="Ausgaben" icon={<ArrowUpRight className="h-3.5 w-3.5" />} color={EXPENSE} total={data.sumExpense} items={data.nextExpense} sign="−" />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Offene Aufgaben</CardTitle>
            <Link href="/aufgaben" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Alle <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 p-3">
            {data.openTasks.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Alles erledigt. 🎯</p>
            )}
            {data.openTasks.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] px-3 py-2.5">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.priority === "high" ? "#ef4444" : t.priority === "normal" ? "#E39832" : "#9ca3af" }} />
                <span className="flex-1 truncate text-[15px]">{t.title}</span>
                {t.due && <span className="shrink-0 text-xs text-muted-foreground">{relDayLabel(t.due)}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string; accent: string }) {
  return (
    <Card className="hover-aura flex items-center gap-3 p-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1f`, color: accent, border: `1px solid ${accent}33` }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-heading text-2xl font-bold leading-tight tracking-tight">{value}</div>
      </div>
    </Card>
  )
}

function CashflowColumn({
  title,
  icon,
  color,
  total,
  items,
  sign,
}: {
  title: string
  icon: React.ReactNode
  color: string
  total: number
  items: CashflowEvent[]
  sign: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[15px] font-semibold" style={{ color }}>
          <span className="flex h-5 w-5 items-center justify-center rounded-md" style={{ backgroundColor: `${color}1f` }}>{icon}</span>
          {title}
        </div>
        <div className="text-[15px] font-bold" style={{ color }}>{sign}{eur0(total)}</div>
      </div>
      <div className="space-y-1.5">
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">Nichts in 30 Tagen.</p>
        )}
        {items.slice(0, 3).map((c) => {
          const potential = c.status === "potential"
          return (
            <div key={c.id} className="flex items-center gap-2.5 rounded-lg border bg-white/[0.02] px-2.5 py-2" style={{ borderColor: `${color}1f` }}>
              <div className="h-7 w-1 rounded-full" style={{ backgroundColor: potential ? POTENTIAL : color }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium">{c.title}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {relDayLabel(c.date)}
                  {potential && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${POTENTIAL}24`, color: POTENTIAL }}>potenziell</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-[15px] font-semibold" style={{ color: potential ? POTENTIAL : color }}>{sign}{eur0(c.amount)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

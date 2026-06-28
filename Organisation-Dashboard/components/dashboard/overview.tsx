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
  Target,
  Trophy,
} from "lucide-react"
import { useStore } from "@/lib/store"
import {
  PEOPLE,
  resolveCategory,
  type CashflowEvent,
} from "@/lib/types"
import { eur0, dateDE } from "@/lib/format"
import { buildSeries } from "@/lib/finance-series"
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

  // Live-Finanzreihe aus den echten Buchungen (geschäftlich) — bezahlte
  // Rechnungen und erfasste Belege schlagen so direkt aufs Dashboard durch.
  const businessTx = useMemo(() => db.transactions.filter((t) => t.scope !== "private"), [db.transactions])
  const chartData = useMemo(() => buildSeries(businessTx, "month"), [businessTx])

  const data = useMemo(() => {
    const today = todayISO()
    const weekEnd = addDaysISO(today, 7)

    const myTasks = db.tasks.filter((t) => t.person === activePerson)
    const openTasks = myTasks.filter((t) => t.status !== "done")

    const myAppts = db.appointments.filter((a) => a.person === activePerson)
    const upcoming = myAppts
      .flatMap((a) => occurrencesInRange(a, today, weekEnd).map((date) => ({ appt: a, date })))
      .sort((x, y) => x.date.localeCompare(y.date))

    // Pipeline — personenbezogen (nur die Deals der aktiven Ansicht).
    const myDeals = db.deals.filter((d) => d.person === activePerson)
    const openDeals = myDeals.filter((d) => d.stage !== "gewonnen")
    const openPipeline = openDeals.reduce((s, d) => s + d.value, 0)
    const wonPipeline = myDeals.filter((d) => d.stage === "gewonnen").reduce((s, d) => s + d.value, 0)

    // Aktueller Monat aus der Live-Reihe (letzter Bucket) — KPI & Chart konsistent.
    const last = chartData.at(-1) ?? { month: "", income: 0, expense: 0 }

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
      openPipeline,
      wonPipeline,
      openDealCount: openDeals.length,
      nextIncome,
      nextExpense,
      sumIncome,
      sumExpense,
      net: sumIncome - sumExpense,
    }
  }, [db, activePerson, chartData])

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {/* Begrüßung — kompakt */}
      <div className="flex items-baseline gap-2">
        <h2 className="font-heading text-[clamp(1.15rem,4vw+0.3rem,1.25rem)] font-bold tracking-tight">
          <span style={{ color: person.color }}>{person.name}</span>
        </h2>
        <span className="text-sm text-muted-foreground">— dein Überblick auf einen Blick</span>
      </div>

      {/* KPIs — kompakte Tiles (inkl. personenbezogener Pipeline) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Stat icon={CheckSquare} label="Offene Aufgaben" value={String(data.openTasks.length)} accent="#E39832" href="/aufgaben" />
        <Stat icon={CalendarClock} label="Termine (7 T.)" value={String(data.upcoming.length)} accent="#3b82f6" href="/kalender" />
        <Stat icon={Target} label="Offene Pipeline" value={eur0(data.openPipeline)} hint={data.openDealCount > 0 ? `${data.openDealCount} Deals` : undefined} accent="#a855f7" href="/pipeline" />
        <Stat icon={Trophy} label="Gewonnen" value={eur0(data.wonPipeline)} accent={INCOME} href="/pipeline" />
        <Stat icon={TrendingUp} label="Einnahmen / Mt." value={eur0(data.income)} accent={INCOME} href="/finanzen" />
        <Stat icon={TrendingDown} label="Ausgaben / Mt." value={eur0(data.expense)} accent={EXPENSE} href="/finanzen" />
      </div>

      {/* Reihe 1: Chart (oben) + Termine */}
      <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-[1.25] lg:grid-cols-3">
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
              <Link href="/finanzen" className="text-sm font-medium text-primary hover:underline">Finanzen</Link>
            </div>
          </CardHeader>
          <CardContent className="min-h-[260px] flex-1 p-3 lg:min-h-0">
            <FinanceChart data={chartData} height="full" />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Anstehende Termine</CardTitle>
            <Link href="/kalender" className="text-sm font-medium text-primary hover:underline">Kalender</Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 p-3">
            {data.upcoming.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Keine Termine (7 Tage).</p>
            )}
            {data.upcoming.slice(0, 4).map(({ appt, date }) => {
              const cat = resolveCategory(db.appointmentCategories, appt.category)
              return (
                <Link key={appt.id + date} href="/kalender" className="flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <div className="h-8 w-1 rounded-full" style={{ backgroundColor: cat.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium">{appt.title}</div>
                    <div className="text-sm text-muted-foreground">{relDayLabel(date)}{appt.time ? ` · ${appt.time}` : ""}</div>
                  </div>
                  <Badge color={cat.color}>{cat.label}</Badge>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Reihe 2: Cashflow (kompakt) + Aufgaben */}
      <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-3">
        <Card className="flex flex-col overflow-hidden lg:col-span-2">
          <CardHeader className="items-center border-b border-border pb-3">
            <CardTitle>Anstehende Zahlungen <span className="ml-1 text-sm font-normal text-muted-foreground">· 30 Tage</span></CardTitle>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm text-muted-foreground">Saldo</span>
              <span className="num font-heading text-xl font-bold" style={{ color: data.net >= 0 ? INCOME : EXPENSE }}>
                {data.net >= 0 ? "+" : ""}{eur0(data.net)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid content-start grid-cols-1 gap-5 p-4 [&>*:nth-child(2)]:border-t [&>*:nth-child(2)]:border-border [&>*:nth-child(2)]:pt-5 sm:grid-cols-2 sm:gap-7 sm:[&>*:nth-child(2)]:border-l sm:[&>*:nth-child(2)]:border-t-0 sm:[&>*:nth-child(2)]:pl-7 sm:[&>*:nth-child(2)]:pt-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <CashflowColumn title="Einnahmen" icon={<ArrowDownLeft className="h-3.5 w-3.5" />} color={INCOME} total={data.sumIncome} items={data.nextIncome} sign="+" href="/rechnungen" />
            <CashflowColumn title="Ausgaben" icon={<ArrowUpRight className="h-3.5 w-3.5" />} color={EXPENSE} total={data.sumExpense} items={data.nextExpense} sign="−" href="/finanzen" />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Offene Aufgaben</CardTitle>
            <Link href="/aufgaben" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 p-3">
            {data.openTasks.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Alles erledigt. 🎯</p>
            )}
            {data.openTasks.slice(0, 5).map((t) => (
              <Link key={t.id} href="/aufgaben" className="flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.05]">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.priority === "high" ? "#ef4444" : t.priority === "normal" ? "#E39832" : "#9ca3af" }} />
                <span className="flex-1 truncate text-base">{t.title}</span>
                {t.due && <span className="shrink-0 rounded-md bg-white/[0.05] px-2 py-0.5 text-sm font-medium text-muted-foreground">{relDayLabel(t.due)}</span>}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, hint, accent, href }: { icon: LucideIcon; label: string; value: string; hint?: string; accent: string; href: string }) {
  return (
    <Link href={href} className="group block">
      <Card className="hover-aura flex items-center gap-3 p-3.5 transition-colors hover:border-white/15 sm:p-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
          style={{ backgroundColor: `${accent}1f`, color: accent, border: `1px solid ${accent}33` }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="eyebrow truncate">{label}</div>
          <div className="num truncate font-heading text-[clamp(0.95rem,4.5vw,1.35rem)] font-bold leading-tight tracking-tight sm:text-2xl">{value}</div>
          {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
        </div>
        <ArrowRight className="hidden h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 sm:block" />
      </Card>
    </Link>
  )
}

function CashflowColumn({
  title,
  icon,
  color,
  total,
  items,
  sign,
  href,
}: {
  title: string
  icon: React.ReactNode
  color: string
  total: number
  items: CashflowEvent[]
  sign: string
  href: string
}) {
  return (
    <div>
      {/* Spalten-Kopf mit Summe */}
      <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
          <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1f` }}>{icon}</span>
          {title}
        </div>
        <div className="num font-heading text-lg font-bold" style={{ color }}>{sign}{eur0(total)}</div>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-5 text-center text-sm text-muted-foreground">Nichts in 30 Tagen.</p>
        )}
        {items.slice(0, 3).map((c) => {
          const potential = c.status === "potential"
          return (
            <Link key={c.id} href={href} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3 transition-colors hover:bg-white/[0.06]">
              <div className="h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: potential ? POTENTIAL : color }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-medium leading-tight">{c.title}</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  {relDayLabel(c.date)}
                  {potential && (
                    <span className="rounded-full px-1.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${POTENTIAL}24`, color: POTENTIAL }}>potenziell</span>
                  )}
                </div>
              </div>
              <div className="num shrink-0 font-heading text-base font-bold" style={{ color: potential ? POTENTIAL : color }}>{sign}{eur0(c.amount)}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

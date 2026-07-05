"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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
  Sparkles,
  AlertCircle,
  FileText,
  Wallet,
  UserRound,
  Building2,
  type LucideIcon,
} from "lucide-react"
import { useStore } from "@/lib/store"
import {
  PEOPLE,
  resolveCategory,
  DEAL_STAGE_DEFAULT_PROBABILITY,
  type CashflowEvent,
} from "@/lib/types"
import { eur0, dateDE } from "@/lib/format"
import { buildSeries } from "@/lib/finance-series"
import { computeTotals } from "@/lib/totals"
import { cn } from "@/lib/utils"
import { occurrencesInRange, todayISO, addDaysISO } from "@/lib/recurrence"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KpiTile } from "@/components/ui/kpi-tile"
import { FinanceChart, ChartLegend, type SeriesKey } from "./charts"
import { INCOME, EXPENSE, POTENTIAL, ORANGE, PURPLE, BLUE, NEUTRAL } from "@/lib/theme-colors"

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

// Tageszeit-abhängige Begrüßung — bewusst erst nach dem Mount gesetzt (kein
// Server/Client-Zeitversatz, `new Date()` darf nicht während des Renders laufen).
function useTimeGreeting(): string {
  const [hour, setHour] = useState<number | null>(null)
  useEffect(() => setHour(new Date().getHours()), [])
  if (hour === null) return "Willkommen zurück"
  if (hour < 5) return "Noch wach"
  if (hour < 11) return "Guten Morgen"
  if (hour < 18) return "Guten Tag"
  return "Guten Abend"
}

const FOCUS_KEY_PREFIX = "vitaminb-focus-"

export function Overview() {
  const { db, activePerson } = useStore()
  const person = PEOPLE.find((p) => p.id === activePerson)!
  const greeting = useTimeGreeting()

  // "Fokus heute" — pro Person gemerkt, blendet alles außer dem Dringenden aus.
  const [focusMode, setFocusMode] = useState(false)
  useEffect(() => {
    try {
      setFocusMode(localStorage.getItem(FOCUS_KEY_PREFIX + activePerson) === "1")
    } catch {
      /* ignore */
    }
  }, [activePerson])
  function toggleFocus() {
    setFocusMode((v) => {
      const next = !v
      try {
        localStorage.setItem(FOCUS_KEY_PREFIX + activePerson, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }

  // Live-Finanzreihe aus den echten Buchungen (geschäftlich) — bezahlte
  // Rechnungen und erfasste Belege schlagen so direkt aufs Dashboard durch.
  const businessTx = useMemo(() => db.transactions.filter((t) => t.scope !== "private"), [db.transactions])
  const chartData = useMemo(() => buildSeries(businessTx, "month"), [businessTx])
  // Chart-Serien einzeln ein-/ausblendbar (klickbare Legende wie in den Finanz-Views).
  const [visibleSeries, setVisibleSeries] = useState<Partial<Record<SeriesKey, boolean>>>({ income: true, expense: true, profit: true })
  const toggleSeries = (k: SeriesKey) => setVisibleSeries((v) => ({ ...v, [k]: !(v[k] ?? true) }))

  const data = useMemo(() => {
    const today = todayISO()
    const weekEnd = addDaysISO(today, 7)

    const myTasks = db.tasks.filter((t) => t.person === activePerson)
    const openTasks = myTasks.filter((t) => t.status !== "done")
    const urgentTasks = openTasks.filter((t) => !!t.due && t.due <= today)

    const myAppts = db.appointments.filter((a) => a.person === activePerson)
    const upcoming = myAppts
      .flatMap((a) => occurrencesInRange(a, today, weekEnd).map((date) => ({ appt: a, date })))
      .sort((x, y) => x.date.localeCompare(y.date))
    const todayAppts = upcoming.filter((u) => u.date === today)

    // Stornierte Rechnungen und Stornorechnungen zählen nirgends als "offen".
    const overdueInvoices = db.invoices.filter((i) => i.person === activePerson && i.status === "ueberfaellig" && !i.voided && !i.creditNoteFor)
    const overdueSum = overdueInvoices.reduce((s, i) => s + computeTotals(i.items).gross, 0)

    // Meine Rechnungen — was ich selbst geschrieben habe und was davon offen ist.
    const myOpenInvoices = db.invoices.filter((i) => i.person === activePerson && (i.status === "gesendet" || i.status === "ueberfaellig") && !i.voided && !i.creditNoteFor)
    const myOpenInvoiceSum = myOpenInvoices.reduce((s, i) => s + computeTotals(i.items).gross, 0)

    // Pipeline — personenbezogen (nur die Deals der aktiven Ansicht);
    // verloren markierte Deals zählen nicht mehr als offen (wie im Board).
    const myDeals = db.deals.filter((d) => d.person === activePerson)
    const openDeals = myDeals.filter((d) => d.stage !== "gewonnen" && !d.lostAt)
    const openPipeline = openDeals.reduce((s, d) => s + d.value, 0)
    // Abgeschlossen zählt firmenweit — gehört zur Firmen-Zone des Dashboards.
    const wonPipeline = db.deals.filter((d) => d.stage === "gewonnen").reduce((s, d) => s + d.value, 0)

    // Aktueller Monat aus der Live-Reihe (letzter Bucket) — KPI & Chart konsistent.
    const last = chartData.at(-1) ?? { month: "", income: 0, expense: 0 }

    // Anstehende Zahlungen — live abgeleitet statt statischer Demo-Daten:
    // offene Rechnungen (fix), wiederkehrende Vorlagen und heiße Deals (potenziell).
    const horizon = addDaysISO(today, 30)
    const recentPast = addDaysISO(today, -7)
    const customerName = (id: string) => db.customers.find((c) => c.id === id)?.company
    const events: CashflowEvent[] = []
    for (const i of db.invoices) {
      if (i.voided || i.creditNoteFor) continue
      // a) Offene Rechnungen → fixe Einnahme zum Fälligkeitsdatum.
      if (i.status === "gesendet" || i.status === "ueberfaellig") {
        events.push({
          id: `cf-inv-${i.id}`,
          kind: "income",
          status: "confirmed",
          title: `RE ${i.number}`,
          party: customerName(i.customerId),
          amount: computeTotals(i.items).gross,
          date: i.dueDate,
        })
      }
      // b) Wiederkehrende Vorlagen → nächste Folgerechnung als potenzielle Einnahme.
      if (i.recurrence && i.recurrence.freq !== "none" && i.nextRecurrenceDate) {
        events.push({
          id: `cf-rec-${i.id}`,
          kind: "income",
          status: "potential",
          title: `RE ${i.number} · wiederkehrend`,
          party: customerName(i.customerId),
          amount: computeTotals(i.items).gross,
          date: i.nextRecurrenceDate,
        })
      }
    }
    // c) Deals in der Angebots-Stufe → gewichteter Wert als potenzielle Einnahme
    //    (verlorene Deals ausgenommen — das Board zeigt sie auch nicht mehr).
    for (const d of db.deals) {
      if (d.stage !== "angebot" || d.lostAt) continue
      const prob = (d.probability ?? DEAL_STAGE_DEFAULT_PROBABILITY[d.stage]) / 100
      events.push({
        id: `cf-deal-${d.id}`,
        kind: "income",
        status: "potential",
        title: d.title,
        party: customerName(d.customerId),
        // Ohne erwartetes Abschlussdatum ans Ende des 30-Tage-Fensters einsortieren.
        amount: Math.round(d.value * prob),
        date: d.expectedCloseDate ?? horizon,
      })
    }
    // d) Ausgaben-Seite: manuell gepflegte Plan-Zahlungen (Miete, Leasing,
    //    Steuervorauszahlung …) aus db.cashflow. Nur die Ausgaben — die
    //    Einnahmen-Seite ist oben bereits live aus Rechnungen/Deals abgeleitet.
    for (const c of db.cashflow) {
      if (c.kind === "expense") events.push(c)
    }
    // Summen über das VOLLE 30-Tage-Fenster bilden — erst danach für die
    // Anzeige kürzen, sonst unterschlägt der Saldo spätere Zahlungen.
    const windowCash = events
      .filter((c) => c.date >= recentPast && c.date <= horizon)
      .sort((a, b) => a.date.localeCompare(b.date))
    const nextIncome = windowCash.filter((c) => c.kind === "income")
    const nextExpense = windowCash.filter((c) => c.kind === "expense")
    const sumIncome = nextIncome.reduce((s, c) => s + c.amount, 0)
    const sumExpense = nextExpense.reduce((s, c) => s + c.amount, 0)

    return {
      openTasks,
      urgentTasks,
      upcoming,
      todayAppts,
      overdueInvoices,
      overdueSum,
      myOpenInvoices,
      myOpenInvoiceSum,
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

  // Ein einziger, priorisierter Kontext-Hinweis statt Reizüberflutung.
  const nudge =
    data.overdueInvoices.length > 0
      ? { text: `${data.overdueInvoices.length} Rechnung${data.overdueInvoices.length > 1 ? "en" : ""} überfällig · ${eur0(data.overdueSum)} offen`, href: "/rechnungen", tone: "warn" as const }
      : data.urgentTasks.length > 0
        ? { text: `${data.urgentTasks.length} Aufgabe${data.urgentTasks.length > 1 ? "n" : ""} heute fällig`, href: "/aufgaben", tone: "warn" as const }
        : data.todayAppts.length > 0
          ? { text: `${data.todayAppts.length} Termin${data.todayAppts.length > 1 ? "e" : ""} heute`, href: "/kalender", tone: "info" as const }
          : { text: "Alles im grünen Bereich", href: null, tone: "ok" as const }

  const taskList = focusMode ? data.urgentTasks : data.openTasks
  const apptList = focusMode ? data.todayAppts : data.upcoming

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {/* Begrüßung — adaptiv (Tageszeit + wichtigster offener Punkt) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="font-heading text-[clamp(1.25rem,1vw+1rem,1.65rem)] font-bold tracking-tight">
            {greeting}, <span style={{ color: person.color }}>{person.name}</span>
          </h2>
          <Link
            href={nudge.href ?? "#"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
              !nudge.href && "pointer-events-none",
              nudge.tone === "warn" && "bg-destructive/15 text-destructive hover:bg-destructive/25",
              nudge.tone === "info" && "bg-primary/15 text-primary hover:bg-primary/25",
              nudge.tone === "ok" && "bg-success/15 text-success",
            )}
          >
            {nudge.tone === "ok" ? <Sparkles className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {nudge.text}
          </Link>
        </div>
        <button
          onClick={toggleFocus}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            focusMode ? "border-primary/50 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
          )}
          title="Nur heute Wichtiges zeigen"
        >
          <Target className="h-3.5 w-3.5" /> {focusMode ? "Fokus: Heute" : "Alles anzeigen"}
        </button>
      </div>

      {/* Zone 1: Mein Tag — persönliche Kennzahlen, als getöntes Personen-Band */}
      <Zone icon={UserRound} label={`Mein Tag · ${person.name}`} color={person.color} tinted>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiTile icon={CheckSquare} label={focusMode ? "Heute fällig" : "Offene Aufgaben"} value={String(taskList.length)} accent={ORANGE} href="/aufgaben" />
          <KpiTile icon={CalendarClock} label={focusMode ? "Termine heute" : "Termine (7 T.)"} value={String(apptList.length)} accent={BLUE} href="/kalender" />
          <KpiTile icon={Target} label="Meine Pipeline" value={eur0(data.openPipeline)} hint={data.openDealCount > 0 ? `${data.openDealCount} Deals` : undefined} accent={PURPLE} href="/pipeline" />
          <KpiTile
            icon={FileText}
            label="Meine offenen Rechnungen"
            value={eur0(data.myOpenInvoiceSum)}
            hint={data.myOpenInvoices.length === 0 ? "alles bezahlt" : `${data.myOpenInvoices.length} offen${data.overdueInvoices.length > 0 ? ` · ${data.overdueInvoices.length} überfällig` : ""}`}
            accent={data.overdueInvoices.length > 0 ? EXPENSE : INCOME}
            href="/rechnungen"
          />
        </div>
      </Zone>

      {/* Zone 2: Firma — gemeinsame Zahlen, bewusst neutrales Band (auch wenn die
          Personenfarbe orange ist, bleibt die Firma so klar unterscheidbar) */}
      <Zone icon={Building2} label="Vitamin B · Firma" color={ORANGE}>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiTile icon={TrendingUp} label="Einnahmen / Mt." value={eur0(data.income)} accent={INCOME} href="/finanzen" />
          <KpiTile icon={TrendingDown} label="Ausgaben / Mt." value={eur0(data.expense)} accent={EXPENSE} href="/finanzen" />
          <KpiTile icon={Wallet} label="Gewinn / Mt." value={eur0(data.profit)} accent={data.profit >= 0 ? INCOME : EXPENSE} href="/finanzen" />
          <KpiTile icon={Trophy} label="Abgeschlossen" value={eur0(data.wonPipeline)} accent={INCOME} href="/pipeline" />
        </div>
      </Zone>

      {/* Reihe 1: Chart (oben) + Termine */}
      <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-[1.7] lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader className="items-center pb-0">
            <div className="flex items-baseline gap-3">
              <CardTitle>Einnahmen & Ausgaben</CardTitle>
              <span className="text-xs text-muted-foreground">
                Gewinn akt. Monat: <span className="font-semibold" style={{ color: INCOME }}>{eur0(data.profit)}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ChartLegend
                visible={visibleSeries}
                onToggle={toggleSeries}
                items={[
                  { key: "income", color: INCOME },
                  { key: "expense", color: EXPENSE },
                  { key: "profit", color: ORANGE },
                ]}
              />
              <Link href="/finanzen" className="text-sm font-medium text-primary hover:underline">Finanzen</Link>
            </div>
          </CardHeader>
          <CardContent className="min-h-[340px] flex-1 p-3 lg:min-h-[320px]">
            <FinanceChart data={chartData} height="full" visible={visibleSeries} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>{focusMode ? "Termine heute" : "Anstehende Termine"}</CardTitle>
            <Link href="/kalender" className="text-sm font-medium text-primary hover:underline">Kalender</Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 p-3">
            {apptList.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">{focusMode ? "Keine Termine heute." : "Keine Termine (7 Tage)."}</p>
            )}
            {apptList.slice(0, 4).map(({ appt, date }) => {
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
              <span className="num font-heading text-[clamp(1.05rem,1vw+0.85rem,1.25rem)] font-bold" style={{ color: data.net >= 0 ? INCOME : EXPENSE }}>
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
            <CardTitle>{focusMode ? "Heute fällig" : "Offene Aufgaben"}</CardTitle>
            <Link href="/aufgaben" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2 p-3">
            {taskList.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Alles erledigt. 🎯</p>
            )}
            {taskList.slice(0, 5).map((t) => (
              <Link key={t.id} href="/aufgaben" className="flex items-center gap-2.5 rounded-lg border border-border bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.05]">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.priority === "high" ? EXPENSE : t.priority === "normal" ? ORANGE : NEUTRAL }} />
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

/**
 * Sichtbares Dashboard-Band: fasst zusammengehörige KPI-Kacheln in einer Zone
 * mit Icon-Kopf und Farbverlaufslinie. `tinted` färbt den Hintergrund leicht in
 * der Zonenfarbe ein (Mein Tag), ohne `tinted` bleibt das Band neutral (Firma) —
 * so sind beide Zonen auch dann unterscheidbar, wenn Personen- und Firmenfarbe
 * nahezu identisch sind (Robert = Orange).
 */
function Zone({
  icon: Icon,
  label,
  color,
  tinted,
  children,
}: {
  icon: LucideIcon
  label: string
  color: string
  tinted?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl border p-3 sm:p-4"
      style={
        tinted
          ? { borderColor: `${color}38`, background: `linear-gradient(150deg, ${color}12, ${color}05 45%, transparent 75%)` }
          : { borderColor: "rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.015)" }
      }
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}26`, color }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color }}>{label}</span>
        <span className="h-px min-w-4 flex-1" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
      </div>
      {children}
    </section>
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
        <div className="num font-heading text-[clamp(1rem,0.8vw+0.85rem,1.125rem)] font-bold" style={{ color }}>{sign}{eur0(total)}</div>
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
                <div className="truncate text-[clamp(1rem,0.4vw+0.9rem,1.125rem)] font-semibold leading-tight">{c.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[clamp(0.85rem,0.25vw+0.78rem,0.95rem)] text-muted-foreground">
                  {relDayLabel(c.date)}
                  {potential && (
                    <span className="rounded-full px-1.5 py-0.5 text-[clamp(0.72rem,0.2vw+0.66rem,0.8rem)] font-semibold" style={{ backgroundColor: `${POTENTIAL}24`, color: POTENTIAL }}>potenziell</span>
                  )}
                </div>
              </div>
              <div className="num shrink-0 font-heading text-[clamp(1.05rem,0.5vw+0.9rem,1.25rem)] font-bold tabular-nums" style={{ color: potential ? POTENTIAL : color }}>{sign}{eur0(c.amount)}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

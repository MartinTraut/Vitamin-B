"use client"

import type { ReactNode } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { eur, dateShort, monthName } from "@/lib/format"
import { INCOME, EXPENSE } from "@/lib/theme-colors"
import { cn } from "@/lib/utils"

/**
 * Einheitliche Ledger-Tabelle für Buchungs-/Beleg-Listen (Finanzen, Privat, Ausgaben).
 * Echtes Spalten-Raster statt Flex+Leader-Line: der Betrag sitzt auf einer festen,
 * rechtsbündigen Zahlen-Achse, Datum & USt füllen die Mitte — kein toter Raum.
 */

// Typo-Skala der Tabelle (fluid, Projekt-Pflichtform clamp(MIN, vw+rem, MAX)).
const LABEL = "text-[clamp(1rem,0.4vw+0.9rem,1.15rem)] font-semibold leading-tight"
const META = "text-[clamp(0.85rem,0.25vw+0.78rem,0.95rem)] text-muted-foreground"
const AMOUNT = "num font-heading text-[clamp(1.1rem,0.6vw+0.95rem,1.35rem)] font-bold leading-tight tabular-nums"

// Spalten: Icon | Bezeichnung | Datum | (USt) | Betrag | (Saldo ab lg) | Aktionen.
// Mobile kollabiert auf Icon | Bezeichnung(+Meta darunter) | Betrag | Aktionen.
// Aktionen-Spalte fasst Stift + Papierkorb; feste Breite hält die Geld-Achse über alle Zeilen bündig.
const GRID_VAT =
  "grid-cols-[2.5rem_minmax(0,1fr)_auto_3.75rem] md:grid-cols-[2.5rem_minmax(0,1fr)_7.5rem_4.5rem_9.5rem_3.75rem]"
const GRID_NOVAT =
  "grid-cols-[2.5rem_minmax(0,1fr)_auto_3.75rem] md:grid-cols-[2.5rem_minmax(0,1fr)_7.5rem_9.5rem_3.75rem]"
const GRID_VAT_BAL =
  "grid-cols-[2.5rem_minmax(0,1fr)_auto_3.75rem] md:grid-cols-[2.5rem_minmax(0,1fr)_7.5rem_4.5rem_9.5rem_3.75rem] lg:grid-cols-[2.5rem_minmax(0,1fr)_7.5rem_4.5rem_9.5rem_7.5rem_3.75rem]"
const GRID_NOVAT_BAL =
  "grid-cols-[2.5rem_minmax(0,1fr)_auto_3.75rem] md:grid-cols-[2.5rem_minmax(0,1fr)_7.5rem_9.5rem_3.75rem] lg:grid-cols-[2.5rem_minmax(0,1fr)_7.5rem_9.5rem_7.5rem_3.75rem]"

function gridClass(withVat: boolean, withBalance: boolean) {
  if (withVat) return withBalance ? GRID_VAT_BAL : GRID_VAT
  return withBalance ? GRID_NOVAT_BAL : GRID_NOVAT
}

export interface LedgerRowData {
  id: string
  label: string
  note?: string
  date: string // ISO yyyy-mm-dd
  amount: number
  sign: "+" | "−"
  color: string
  icon: ReactNode
  vat?: string // z. B. "19 %"
  balance?: number // laufender Saldo nach dieser Buchung (nur mit withBalance sichtbar)
  onEdit?: () => void
  editLabel?: string
  onRemove?: () => void
  removeLabel?: string
}

export function LedgerTable({
  rows,
  emptyText,
  withVat = false,
  withBalance = false,
  groupMonths = true,
}: {
  rows: LedgerRowData[]
  emptyText: string
  withVat?: boolean
  withBalance?: boolean
  groupMonths?: boolean
}) {
  if (rows.length === 0) {
    return <p className="p-10 text-center text-sm text-muted-foreground">{emptyText}</p>
  }
  const groups = groupMonths
    ? buildMonthGroups(rows)
    : [{ key: "all", label: "", net: 0, rows }]
  const grid = gridClass(withVat, withBalance)

  return (
    <div>
      {/* Spalten-Kopf (ab md) */}
      <div className={cn("hidden items-center gap-x-3 border-b border-border bg-white/[0.02] px-4 py-2 md:grid", grid)}>
        <span />
        <span className="eyebrow">Bezeichnung</span>
        <span className="eyebrow">Datum</span>
        {withVat && <span className="eyebrow">USt</span>}
        <span className="eyebrow justify-self-end">Betrag</span>
        {withBalance && <span className="eyebrow hidden justify-self-end lg:block">Saldo</span>}
        <span />
      </div>

      {groups.map((g) => (
        <div key={g.key}>
          {groupMonths && (
            <div className="flex items-baseline justify-between gap-3 border-b border-border bg-white/[0.025] px-4 py-2">
              <span className="eyebrow">{g.label}</span>
              <span
                className="num text-[clamp(0.85rem,0.25vw+0.78rem,0.95rem)] font-bold tabular-nums"
                style={{ color: g.net >= 0 ? INCOME : EXPENSE }}
              >
                {g.net >= 0 ? "+" : "−"}{eur(Math.abs(g.net))}
              </span>
            </div>
          )}
          <div className="divide-y divide-border/60">
            {g.rows.map((r) => (
              <LedgerRow key={r.id} r={r} grid={grid} withVat={withVat} withBalance={withBalance} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function LedgerRow({ r, grid, withVat, withBalance }: { r: LedgerRowData; grid: string; withVat: boolean; withBalance: boolean }) {
  return (
    <div className={cn("group relative grid items-center gap-x-3 px-4 py-3 transition-colors odd:bg-white/[0.015] hover:bg-white/[0.04]", grid)}>
      {/* Farb-Kante links beim Hover — trägt den Blick über die Zeile */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] rounded-r bg-current opacity-0 transition-opacity group-hover:opacity-100" style={{ color: r.color }} />
      {/* Typ-Anker */}
      <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${r.color}1a`, color: r.color }}>
        {r.icon}
      </span>
      {/* Identität */}
      <div className="min-w-0">
        <div className={cn("truncate", LABEL)}>{r.label}</div>
        {r.note && <div className={cn("mt-0.5 hidden truncate md:block", META)}>{r.note}</div>}
        {/* Mobile: Datum & USt wandern unter die Bezeichnung */}
        <div className={cn("mt-0.5 truncate md:hidden", META)}>
          {r.note ? `${r.note} · ` : ""}{dateShort(r.date)}{r.vat ? ` · ${r.vat} USt` : ""}
        </div>
      </div>
      {/* Datum (ab md) */}
      <div className={cn("hidden whitespace-nowrap md:block", META)}>{dateShort(r.date)}</div>
      {/* USt (ab md) */}
      {withVat && <div className={cn("hidden whitespace-nowrap md:block", META)}>{r.vat ?? "—"}</div>}
      {/* Geld-Achse: feste rechtsbündige Spalte — der Held der Zeile */}
      <div className={cn("justify-self-end whitespace-nowrap text-right", AMOUNT)} style={{ color: r.color }}>
        {r.sign}{eur(r.amount)}
      </div>
      {/* Laufender Saldo (ab lg) — Information, kein Signal: bewusst gedämpft */}
      {withBalance && (
        <div className={cn("hidden justify-self-end whitespace-nowrap text-right tabular-nums lg:block", META, "font-semibold")}>
          {r.balance !== undefined ? eur(r.balance) : "—"}
        </div>
      )}
      {/* Aktionen: Bearbeiten + Löschen, erscheinen beim Hover/Focus */}
      <div className="flex items-center justify-end gap-1">
        {r.onEdit && (
          <button
            type="button"
            onClick={r.onEdit}
            aria-label={r.editLabel ?? "Bearbeiten"}
            title={r.editLabel ?? "Bearbeiten"}
            className="action-reveal rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {r.onRemove && (
          <button
            type="button"
            onClick={r.onRemove}
            aria-label={r.removeLabel ?? "Löschen"}
            title={r.removeLabel ?? "Löschen"}
            className="action-reveal rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function buildMonthGroups(rows: LedgerRowData[]) {
  const groups: { key: string; label: string; net: number; rows: LedgerRowData[] }[] = []
  const idx = new Map<string, number>()
  for (const r of rows) {
    const key = r.date.slice(0, 7)
    let i = idx.get(key)
    if (i === undefined) {
      const [y, m] = key.split("-").map(Number)
      i = groups.length
      idx.set(key, i)
      groups.push({ key, label: `${monthName(m - 1)} ${y}`, net: 0, rows: [] })
    }
    const g = groups[i]
    g.rows.push(r)
    g.net += r.sign === "+" ? r.amount : -r.amount
  }
  return groups
}

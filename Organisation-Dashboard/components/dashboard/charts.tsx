"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { SeriesPoint } from "@/lib/finance-series"
import { eur, eur0 } from "@/lib/format"
import { cn } from "@/lib/utils"

// Kräftige, gut unterscheidbare Palette für Kategorie-Segmente.
export const DONUT_COLORS = ["#ef4444", "#f59e0b", "#E39832", "#a855f7", "#3b82f6", "#34d399", "#ec4899", "#14b8a6"]

export function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!data.length || total === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Keine Ausgaben.</p>
  }
  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13 }}
              formatter={(value, name) => [eur(Number(value)), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Gesamt</span>
          <span className="num font-heading text-xl font-bold">{eur0(total)}</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2.5 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className="flex-1 truncate font-medium">{d.name}</span>
            <span className="num text-muted-foreground">{eur(d.value)}</span>
            <span className="num w-10 text-right text-xs text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceChart({
  data,
  height = 260,
}: {
  data: SeriesPoint[]
  height?: number | "full"
}) {
  const fill = height === "full"
  const hasDebt = data.some((d) => typeof d.debt === "number")
  return (
    <div className={cn("w-full", fill && "h-full")} style={fill ? undefined : { height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="debtFillInline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.38} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#c2c2c2", fontSize: 13, fontWeight: 500 }} tickMargin={10} minTickGap={12} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: "#c2c2c2", fontSize: 13, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={42}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            domain={hasDebt ? [(min: number) => Math.floor(Math.min(0, min) / 1000) * 1000, (max: number) => Math.ceil(Math.max(0, max) / 1000) * 1000] : undefined}
          />
          {hasDebt && <ReferenceLine y={0} stroke="rgba(255,255,255,0.22)" />}
          <Tooltip
            contentStyle={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 13,
            }}
            labelStyle={{ color: "#f5f5f5", fontWeight: 600 }}
            formatter={(value, name) => [
              eur0(Math.abs(Number(value))),
              name === "income" ? "Einnahmen" : name === "debt" ? "Restschuld" : "Ausgaben",
            ]}
          />
          {hasDebt && <Area type="monotone" dataKey="debt" stroke="#f59e0b" strokeWidth={2.5} fill="url(#debtFillInline)" />}
          <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2.5} fill="url(#incomeFill)" />
          <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

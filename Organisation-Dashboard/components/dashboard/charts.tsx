"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { FinanceMonth } from "@/lib/types"
import { eur } from "@/lib/format"
import { cn } from "@/lib/utils"

export function FinanceChart({
  data,
  height = 260,
}: {
  data: FinanceMonth[]
  height?: number | "full"
}) {
  const fill = height === "full"
  return (
    <div className={cn("w-full", fill && "h-full")} style={fill ? undefined : { height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 13,
            }}
            labelStyle={{ color: "#f5f5f5", fontWeight: 600 }}
            formatter={(value, name) => [
              eur(Number(value)),
              name === "income" ? "Einnahmen" : "Ausgaben",
            ]}
          />
          <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2.5} fill="url(#incomeFill)" />
          <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

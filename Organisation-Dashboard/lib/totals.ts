import type { LineItem } from "./types"

export interface Totals {
  net: number
  taxByRate: { rate: number; net: number; tax: number }[]
  tax: number
  gross: number
}

export function lineNet(item: Pick<LineItem, "qty" | "price">): number {
  return Math.round(item.qty * item.price * 100) / 100
}

export function computeTotals(items: LineItem[]): Totals {
  const byRate = new Map<number, number>() // rate -> net
  let net = 0
  for (const it of items) {
    const n = lineNet(it)
    net += n
    byRate.set(it.taxRate, (byRate.get(it.taxRate) ?? 0) + n)
  }
  const taxByRate = [...byRate.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, rNet]) => ({
      rate,
      net: round2(rNet),
      tax: round2((rNet * rate) / 100),
    }))
  const tax = round2(taxByRate.reduce((s, r) => s + r.tax, 0))
  return { net: round2(net), taxByRate, tax, gross: round2(net + tax) }
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

/** Naechste fortlaufende Belegnummer im Format JAHR-NNN. */
export function nextNumber(existing: string[], year: number): string {
  const prefix = `${year}-`
  const max = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((m, n) => Math.max(m, n), 0)
  return `${prefix}${String(max + 1).padStart(3, "0")}`
}

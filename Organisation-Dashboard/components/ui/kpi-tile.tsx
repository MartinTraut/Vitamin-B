import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Einheitliche KPI-Kachel für Dashboard/Finanzen/Pipeline/CRM.
 * Ersetzt die vier zuvor separat gepflegten Varianten (Stat/Kpi/Metric/MiniStat).
 */
export function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  href,
  className,
}: {
  icon?: LucideIcon
  label: string
  value: string
  hint?: string
  accent: string
  href?: string
  className?: string
}) {
  const body = (
    <div
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 sm:p-4",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${accent}26, ${accent}0a 70%)`,
        borderColor: `${accent}40`,
        boxShadow: `inset 0 1px 0 0 ${accent}26`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-7 -top-7 h-20 w-20 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
      />
      {Icon && (
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
          style={{ backgroundColor: `${accent}2e`, color: accent, border: `1px solid ${accent}55`, boxShadow: `inset 0 1px 0 0 ${accent}33` }}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="relative min-w-0 flex-1">
        <div className="eyebrow truncate" style={{ color: `${accent}cc` }}>{label}</div>
        <div className="num truncate font-heading text-[clamp(1rem,3vw+0.6rem,1.5rem)] font-bold leading-tight tracking-tight" style={{ color: Icon ? undefined : accent }}>
          {value}
        </div>
        {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
      </div>
      {href && (
        <ArrowRight
          className="relative hidden h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 sm:block"
          style={{ color: accent }}
        />
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    )
  }
  return body
}

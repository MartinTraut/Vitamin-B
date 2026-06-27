import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "#E39832",
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  accent?: string
}) {
  return (
    <Card className="hover-aura glow-border overflow-hidden p-6">
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-3 font-heading text-[2.6rem] font-bold leading-none tracking-tight">
            {value}
          </div>
          {hint && <div className="mt-2 text-[13px] text-muted-foreground">{hint}</div>}
        </div>
        <div
          className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl")}
          style={{
            backgroundColor: `${accent}1f`,
            color: accent,
            border: `1px solid ${accent}33`,
          }}
        >
          <Icon className="h-[22px] w-[22px]" />
        </div>
      </div>
    </Card>
  )
}

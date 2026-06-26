import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

export function ComingSoon({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon
  title: string
  description: string
  phase: string
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center">
      <Card className="glow-orange flex h-20 w-20 items-center justify-center rounded-2xl">
        <Icon className="h-9 w-9 text-primary" />
      </Card>
      <h2 className="mt-6 font-heading text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <span className="mt-5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        {phase}
      </span>
    </div>
  )
}

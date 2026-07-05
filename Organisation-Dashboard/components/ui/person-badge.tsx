import { PEOPLE, type Person } from "@/lib/types"
import { cn } from "@/lib/utils"

const SIZE = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-7 w-7 text-[11px]",
  lg: "h-8 w-8 text-xs",
} as const

/** Runder Initialen-Chip in Personen-Farbe — kennzeichnet, wem ein Eintrag gehört. */
export function PersonBadge({
  person,
  size = "md",
  title,
  className,
}: {
  person: Person
  size?: keyof typeof SIZE
  title?: string
  className?: string
}) {
  const p = PEOPLE.find((x) => x.id === person)
  if (!p) return null
  return (
    <span
      title={title ?? p.name}
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold", SIZE[size], className)}
      style={{ backgroundColor: `${p.color}26`, color: p.color, border: `1px solid ${p.color}55` }}
    >
      {p.initials}
    </span>
  )
}

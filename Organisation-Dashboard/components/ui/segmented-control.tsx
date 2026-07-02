import { cn } from "@/lib/utils"

/** Kompakter Pill-Umschalter (z. B. Granularität, Filter) — ein Muster statt Copy-Paste. */
export function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { v: string; l: string; color?: string }[]
}) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-white/[0.03] p-0.5">
      {options.map((o) => {
        const active = value === o.v
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            style={active ? { backgroundColor: o.color ?? "var(--primary)", color: o.color ? "#fff" : "var(--primary-foreground)" } : undefined}
          >
            {o.l}
          </button>
        )
      })}
    </div>
  )
}

import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

export function Badge({
  className,
  color,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { color?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={
        color
          ? { backgroundColor: `${color}1f`, color, border: `1px solid ${color}33` }
          : undefined
      }
      {...props}
    />
  )
}

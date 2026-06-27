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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold",
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

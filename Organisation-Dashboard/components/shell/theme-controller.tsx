"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

// Lesbare Vordergrundfarbe je nach Helligkeit des Akzents bestimmen.
function foregroundFor(hex: string): string {
  const c = hex.replace("#", "")
  if (c.length < 6) return "#0a0a0a"
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? "#0a0a0a" : "#ffffff"
}

export function ThemeController() {
  const { db } = useStore()
  const accent = db.company.accent

  useEffect(() => {
    if (!accent) return
    const root = document.documentElement
    root.style.setProperty("--primary", accent)
    root.style.setProperty("--accent", accent)
    root.style.setProperty("--ring", accent)
    root.style.setProperty("--orange", accent)
    root.style.setProperty("--primary-foreground", foregroundFor(accent))
  }, [accent])

  return null
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scrollToSection(url: string) {
  if (typeof window === "undefined") return
  let top: number | null = null
  if (url === "#") {
    top = 0
  } else {
    const el = document.getElementById(url.replace("#", ""))
    if (el) {
      const eyebrow = el.querySelector<HTMLElement>(".tracking-widest")
      const target = eyebrow ?? el.querySelector("h2") ?? el
      const navEl = document.querySelector("nav")
      const headerOffset = (navEl ? navEl.offsetHeight : 96) + 24
      top = Math.max(
        0,
        window.scrollY + target.getBoundingClientRect().top - headerOffset,
      )
    }
  }
  if (top === null) return
  window.scrollTo({ top, behavior: "smooth" })
}

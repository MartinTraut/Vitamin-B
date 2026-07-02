/**
 * Zentrale Akzentfarben-Konstanten, gespiegelt aus den CSS-Variablen in app/globals.css
 * (--success/--destructive/--orange). Als JS-Werte nötig, weil viele Kacheln/Charts
 * die Farbe inline in style-Attributen (Gradient, boxShadow) brauchen, wo CSS var()
 * mit Alpha-Suffix (z.B. `${accent}1f`) nicht funktioniert.
 */
export const INCOME = "#34d399"
export const EXPENSE = "#ef4444"
export const POTENTIAL = "#eab308"
export const ORANGE = "#E39832"
export const PURPLE = "#a855f7"
export const BLUE = "#3b82f6"
export const DEBT = "#f59e0b"

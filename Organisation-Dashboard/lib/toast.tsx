"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Check, AlertTriangle, Info, X, RotateCcw } from "lucide-react"

type ToastKind = "success" | "error" | "info"

interface Toast {
  id: number
  kind: ToastKind
  message: string
  action?: { label: string; onClick: () => void }
}

interface ToastApi {
  toast: (message: string, opts?: { kind?: ToastKind; action?: Toast["action"]; duration?: number }) => void
  success: (message: string, opts?: { action?: Toast["action"]; duration?: number }) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const ACCENT: Record<ToastKind, string> = {
  success: "#34d399",
  error: "#ef4444",
  info: "#E39832",
}
const ICON: Record<ToastKind, typeof Check> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)
  const idRef = useRef(0)

  // Portal erst nach dem Mount (kein SSR-Mismatch).
  useEffect(() => setMounted(true), [])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message: string, opts?: { kind?: ToastKind; action?: Toast["action"]; duration?: number }) => {
      const id = ++idRef.current
      const kind = opts?.kind ?? "success"
      setToasts((prev) => [...prev, { id, kind, message, action: opts?.action }])
      const duration = opts?.duration ?? (opts?.action ? 6000 : 3200)
      window.setTimeout(() => remove(id), duration)
    },
    [remove],
  )

  const api: ToastApi = {
    toast: push,
    success: (message, opts) => push(message, { kind: "success", ...opts }),
    error: (message) => push(message, { kind: "error" }),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {toasts.map((t) => {
                const Icon = ICON[t.kind]
                const accent = ACCENT[t.kind]
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-card/95 p-3 pr-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${accent}1f`, color: accent }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium leading-snug">{t.message}</span>
                    {t.action && (
                      <button
                        onClick={() => {
                          t.action!.onClick()
                          remove(t.id)
                        }}
                        className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors hover:bg-white/[0.06]"
                        style={{ color: accent }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> {t.action.label}
                      </button>
                    )}
                    <button
                      onClick={() => remove(t.id)}
                      aria-label="Schließen"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

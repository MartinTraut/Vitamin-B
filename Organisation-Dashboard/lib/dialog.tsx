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
import { AlertTriangle } from "lucide-react"

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}
interface PromptOptions extends ConfirmOptions {
  defaultValue?: string
  placeholder?: string
}

type DialogState =
  | ({ kind: "confirm"; resolve: (v: boolean) => void } & ConfirmOptions)
  | ({ kind: "prompt"; resolve: (v: string | null) => void } & PromptOptions)

interface DialogApi {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
  prompt: (opts: PromptOptions) => Promise<string | null>
}

const DialogContext = createContext<DialogApi | null>(null)

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null)
  const [value, setValue] = useState("")
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setState({ kind: "confirm", resolve, ...opts })),
    [],
  )
  const prompt = useCallback(
    (opts: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setValue(opts.defaultValue ?? "")
        setState({ kind: "prompt", resolve, ...opts })
      }),
    [],
  )

  const close = useCallback(
    (result: boolean | string | null) => {
      if (!state) return
      if (state.kind === "confirm") state.resolve(result as boolean)
      else state.resolve(result as string | null)
      setState(null)
    },
    [state],
  )

  // Fokus setzen + Escape schließt.
  useEffect(() => {
    if (!state) return
    const t = window.setTimeout(() => {
      if (state.kind === "prompt") inputRef.current?.focus()
      else confirmRef.current?.focus()
    }, 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(state.kind === "confirm" ? false : null)
    }
    document.addEventListener("keydown", onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener("keydown", onKey)
    }
  }, [state, close])

  const cancelResult = state?.kind === "confirm" ? false : null
  const danger = state?.danger

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {state && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={state.title}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 bg-black/65 backdrop-blur-sm"
                  onClick={() => close(cancelResult)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-[0_20px_70px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-start gap-3">
                    {danger && (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base font-semibold">{state.title}</h3>
                      {state.message && <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>}
                    </div>
                  </div>

                  {state.kind === "prompt" && (
                    <input
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && value.trim() && close(value.trim())}
                      placeholder={state.placeholder}
                      className="mt-4 h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/60"
                    />
                  )}

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => close(cancelResult)}
                      className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                    >
                      {state.cancelLabel ?? "Abbrechen"}
                    </button>
                    <button
                      ref={confirmRef}
                      onClick={() => close(state.kind === "prompt" ? (value.trim() || null) : true)}
                      disabled={state.kind === "prompt" && !value.trim()}
                      className={cn(
                        "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-40",
                        danger
                          ? "bg-destructive text-white hover:bg-destructive/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {state.confirmLabel ?? "Bestätigen"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </DialogContext.Provider>
  )
}

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ")
}

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error("useDialog must be used within DialogProvider")
  return ctx
}

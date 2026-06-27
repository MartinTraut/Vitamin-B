"use client"

import { useState, type ComponentType } from "react"
import dynamic from "next/dynamic"
import { Plus, Trash2, Pencil, PenTool } from "lucide-react"
import { useStore } from "@/lib/store"
import { useDialog } from "@/lib/dialog"
import { useToast } from "@/lib/toast"
import { PEOPLE } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import "tldraw/tldraw.css"

const Tldraw = dynamic(() => import("tldraw").then((m) => m.Tldraw), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Whiteboard wird geladen…
    </div>
  ),
}) as ComponentType<{ persistenceKey?: string; inferDarkMode?: boolean }>

export function WhiteboardView() {
  const { db, activePerson, addWhiteboard, renameWhiteboard, removeWhiteboard } = useStore()
  const dialog = useDialog()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(db.whiteboards[0]?.id ?? null)

  const selected = db.whiteboards.find((w) => w.id === selectedId) ?? null

  function create() {
    const id = addWhiteboard({ name: "Neues Board", person: activePerson })
    setSelectedId(id)
  }
  async function rename(id: string, current: string) {
    const name = await dialog.prompt({ title: "Board umbenennen", defaultValue: current, placeholder: "Board-Name", confirmLabel: "Speichern" })
    if (name) renameWhiteboard(id, name)
  }
  async function remove(id: string, name: string) {
    const ok = await dialog.confirm({ title: "Board löschen?", message: `„${name}" wird unwiderruflich entfernt.`, confirmLabel: "Löschen", danger: true })
    if (!ok) return
    removeWhiteboard(id)
    setSelectedId(db.whiteboards.find((w) => w.id !== id)?.id ?? null)
    toast.success("Board gelöscht")
  }

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* Board-Liste */}
      <aside className="flex w-60 shrink-0 flex-col rounded-2xl border border-border bg-card/80">
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="font-heading text-sm font-bold">Boards</span>
          <Button size="sm" onClick={create}>
            <Plus className="h-4 w-4" /> Neu
          </Button>
        </div>
        <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
          {db.whiteboards.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">Noch kein Board.</p>
          )}
          {db.whiteboards.map((w) => {
            const active = w.id === selectedId
            const person = w.person ? PEOPLE.find((p) => p.id === w.person) : undefined
            return (
              <div
                key={w.id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border p-2.5 transition-colors",
                  active ? "border-primary/50 bg-primary/[0.08]" : "border-transparent hover:bg-white/[0.04]",
                )}
              >
                <button onClick={() => setSelectedId(w.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: person ? `${person.color}1f` : "rgba(227,152,50,0.15)", color: person?.color ?? "#E39832" }}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{w.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{person ? person.name : "Team"}</span>
                  </span>
                </button>
                <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => rename(w.id, w.name)} aria-label="Board umbenennen" title="Umbenennen" className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(w.id, w.name)} aria-label="Board löschen" title="Löschen" className="rounded-md p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Canvas */}
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border">
        {selected ? (
          <Tldraw key={selected.id} persistenceKey={`vitaminb-wb-${selected.id}`} inferDarkMode />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Board auswählen oder neu anlegen.
          </div>
        )}
      </div>
    </div>
  )
}

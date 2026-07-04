"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, GripVertical, Trash2, X, TrendingUp, Trophy, Layers, Scale, ChevronLeft, ChevronRight, ChevronDown, FileText, Receipt, Phone, Mail, Pencil, ThumbsDown, RotateCcw } from "lucide-react"
import { useStore } from "@/lib/store"
import { useToast } from "@/lib/toast"
import { useDialog } from "@/lib/dialog"
import { todayISO, addDaysISO, diffDays } from "@/lib/recurrence"
import {
  PEOPLE,
  DEAL_STAGES,
  DEAL_STAGE_LABEL,
  DEAL_STAGE_COLOR,
  DEAL_STAGE_DEFAULT_PROBABILITY,
  type Deal,
  type DealStage,
} from "@/lib/types"
import { eur0, dateDE, parseAmountDE } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiTile } from "@/components/ui/kpi-tile"
import { ORANGE, INCOME, PURPLE, BLUE, EXPENSE } from "@/lib/theme-colors"
import { cn } from "@/lib/utils"

export function PipelineView() {
  const { db, activePerson, addDeal, addCustomer, addQuote, addInvoice, convertQuoteToInvoice, moveDeal, reorderDeals, removeDeal, updateDeal } = useStore()
  const router = useRouter()
  const toast = useToast()
  const dialog = useDialog()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  // ⌘K-Deep-Link (?sel=<dealId>): passende Karte hervorheben und hinscrollen.
  const [highlightId, setHighlightId] = useState<string | null>(null)

  function createQuoteFromDeal(deal: Deal) {
    // Existiert bereits ein verknüpftes Angebot (z. B. automatisch bei Stufe
    // „Angebot" angelegt), nicht doppeln — direkt dorthin springen.
    const existing = db.quotes.find((q) => q.dealId === deal.id)
    if (existing) {
      router.push("/angebote")
      return
    }
    const term = db.company.paymentTermDays
    addQuote({
      customerId: deal.customerId,
      status: "entwurf",
      items: [],
      validUntil: addDaysISO(todayISO(), term),
      person: deal.person,
      dealId: deal.id,
    })
    toast.success("Angebot aus Deal erstellt")
    router.push("/angebote")
  }

  // Gewonnener Deal → Rechnung. Gibt es bereits ein verknüpftes Angebot mit
  // Positionen, wird daraus die Rechnung erzeugt (Positionen übernommen);
  // sonst ein Rechnungs-Entwurf direkt aus dem Deal.
  function createInvoiceFromDeal(deal: Deal) {
    const linkedQuote = db.quotes.find((q) => q.dealId === deal.id && q.items.length > 0)
    if (linkedQuote) {
      convertQuoteToInvoice(linkedQuote.id)
      toast.success(`Rechnung aus Angebot ${linkedQuote.number} erstellt`)
    } else {
      const issue = todayISO()
      addInvoice({
        customerId: deal.customerId,
        status: "entwurf",
        items: [],
        issueDate: issue,
        dueDate: addDaysISO(issue, db.company.paymentTermDays),
        person: deal.person,
      })
      toast.success("Rechnungs-Entwurf aus Deal erstellt")
    }
    router.push("/rechnungen")
  }

  // Deal gewinnen: in die Spalte „Gewonnen" verschieben und sofort die
  // Rechnungserstellung anbieten (nächster Schritt der Kette).
  function winDeal(deal: Deal) {
    moveDeal(deal.id, "gewonnen")
    toast.success("Deal gewonnen", {
      action: { label: "Rechnung", icon: Receipt, onClick: () => createInvoiceFromDeal(deal) },
    })
  }

  // Deal verlieren: Grund abfragen, vom Board nehmen — bleibt für die
  // Win/Loss-Analyse in der Sektion „Verloren" erhalten (reaktivierbar).
  async function loseDeal(deal: Deal) {
    const reason = await dialog.prompt({
      title: `„${deal.title}" als verloren markieren?`,
      message: `Der Deal verschwindet vom Board und wandert in die Sektion „Verloren". Er kann jederzeit reaktiviert werden.`,
      placeholder: "Verlustgrund (z. B. Preis, Konkurrenz, kein Bedarf)",
      confirmLabel: "Als verloren markieren",
      danger: true,
    })
    if (reason === null) return
    updateDeal(deal.id, { lostAt: new Date().toISOString(), lostReason: reason })
    toast.success("Deal als verloren markiert")
  }

  // Löschen nur mit Bestätigung — Deals sind Datenbasis für Forecast & Historie.
  async function confirmRemoveDeal(deal: Deal) {
    const ok = await dialog.confirm({
      title: `„${deal.title}" löschen?`,
      message: `Der Deal wird unwiderruflich entfernt. Tipp: „Als verloren markieren" behält ihn für die Win/Loss-Quote.`,
      confirmLabel: "Löschen",
      danger: true,
    })
    if (!ok) return
    removeDeal(deal.id)
    toast.success("Deal gelöscht")
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const customerName = useMemo(() => {
    const map = new Map(db.customers.map((c) => [c.id, c.company]))
    return (id: string) => map.get(id) ?? "—"
  }, [db.customers])

  // Pipeline ist personenbezogen: nur die Deals der aktiven Ansicht zeigen.
  // Verlorene Deals verschwinden vom Board, bleiben aber für die Win/Loss-Quote erhalten.
  const personDeals = useMemo(() => db.deals.filter((d) => d.person === activePerson), [db.deals, activePerson])
  const myDeals = useMemo(() => personDeals.filter((d) => !d.lostAt), [personDeals])
  const lostDeals = useMemo(
    () => personDeals.filter((d) => !!d.lostAt).sort((a, b) => (b.lostAt ?? "").localeCompare(a.lostAt ?? "")),
    [personDeals],
  )

  const totalOpen = myDeals.filter((d) => d.stage !== "gewonnen").reduce((s, d) => s + d.value, 0)
  const totalWon = myDeals.filter((d) => d.stage === "gewonnen").reduce((s, d) => s + d.value, 0)
  // Gewichtete Pipeline: realistischerer Forecast als die reine Summe offener Deals.
  const weightedOpen = myDeals
    .filter((d) => d.stage !== "gewonnen")
    .reduce((s, d) => s + (d.value * (d.probability ?? DEAL_STAGE_DEFAULT_PROBABILITY[d.stage])) / 100, 0)
  // Lost-Quote: Anteil verlorener an allen entschiedenen Deals (gewonnen + verloren).
  const wonCount = myDeals.filter((d) => d.stage === "gewonnen").length
  const decidedCount = wonCount + lostDeals.length
  const lostQuote = decidedCount > 0 ? Math.round((lostDeals.length / decidedCount) * 100) : null

  const activeDeal = activeId ? db.deals.find((d) => d.id === activeId) ?? null : null

  // Aus der ⌘K-Suche vorselektieren (?sel=<dealId>): Karte hervorheben + hinscrollen.
  // useSearchParams statt window.location — greift auch bei Client-Navigation auf
  // derselben Route und nach asynchronem Daten-Load; jede sel-ID nur einmal.
  const selParam = useSearchParams().get("sel")
  const handledSelRef = useRef<string | null>(null)
  useEffect(() => {
    if (!selParam || handledSelRef.current === selParam) return
    if (!db.deals.some((d) => d.id === selParam)) return
    handledSelRef.current = selParam
    setHighlightId(selParam)
    requestAnimationFrame(() => document.getElementById(`deal-${selParam}`)?.scrollIntoView({ behavior: "smooth", block: "center" }))
    setTimeout(() => setHighlightId(null), 2500)
  }, [selParam, db.deals])

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const dragged = db.deals.find((d) => d.id === active.id)
    if (!dragged) return
    const overId = String(over.id)
    const overDeal = db.deals.find((d) => d.id === overId)
    const targetStage: DealStage | null = overDeal
      ? overDeal.stage
      : (DEAL_STAGES as string[]).includes(overId)
        ? (overId as DealStage)
        : null
    if (!targetStage) return
    if (overDeal?.id === dragged.id) return

    const next = [...db.deals]
    const fromIdx = next.findIndex((d) => d.id === dragged.id)
    next.splice(fromIdx, 1)
    const moved: Deal = { ...dragged, stage: targetStage }
    let insertIdx: number
    if (overDeal && overDeal.id !== dragged.id) {
      insertIdx = next.findIndex((d) => d.id === overDeal.id)
    } else {
      let last = -1
      next.forEach((d, i) => { if (d.stage === targetStage) last = i })
      insertIdx = last === -1 ? next.length : last + 1
    }
    next.splice(insertIdx, 0, moved)
    reorderDeals(next)
  }

  return (
    <div className="space-y-4">
      {/* Kopf — prominente KPI-Kacheln */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <KpiTile icon={TrendingUp} label="Offene Pipeline" value={eur0(totalOpen)} accent={ORANGE} />
          <KpiTile icon={Scale} label="Gewichtet" value={eur0(weightedOpen)} hint="nach Abschluss-Wahrsch." accent={BLUE} />
          <KpiTile icon={Trophy} label="Abgeschlossen" value={eur0(totalWon)} accent={INCOME} />
          <KpiTile icon={Layers} label="Deals" value={String(myDeals.length)} accent={PURPLE} />
          <KpiTile icon={ThumbsDown} label="Lost-Quote" value={lostQuote === null ? "—" : `${lostQuote} %`} hint="verloren / entschieden" accent={EXPENSE} />
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="h-auto lg:px-6">
          <Plus className="h-4 w-4" /> Neuer Deal
        </Button>
      </div>

      {adding && (
        <AddDeal
          customers={db.customers.map((c) => ({ id: c.id, company: c.company }))}
          onCancel={() => setAdding(false)}
          onSave={({ title, value, stage, customerId, newCustomer }) => {
            const cid = newCustomer ? addCustomer({ ...newCustomer, health: "lead" }) : customerId!
            addDeal({ title, value, stage, customerId: cid, person: activePerson })
            setAdding(false)
          }}
        />
      )}

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="-mx-1 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {DEAL_STAGES.map((stage) => {
            const items = myDeals.filter((d) => d.stage === stage)
            const sum = items.reduce((s, d) => s + d.value, 0)
            return (
              <Column key={stage} stage={stage} count={items.length} sum={sum}>
                <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  {items.length === 0 && (
                    <div
                      className="rounded-xl border border-dashed py-8 text-center text-xs"
                      style={{ borderColor: `${DEAL_STAGE_COLOR[stage]}2e`, color: `${DEAL_STAGE_COLOR[stage]}99` }}
                    >
                      Hierher ziehen
                    </div>
                  )}
                  {items.map((d) => (
                    <SortableDeal
                      key={d.id}
                      deal={d}
                      customer={customerName(d.customerId)}
                      highlighted={d.id === highlightId}
                      onRemove={() => confirmRemoveDeal(d)}
                      onWin={stage !== "gewonnen" ? () => winDeal(d) : undefined}
                      onLost={stage !== "gewonnen" ? () => loseDeal(d) : undefined}
                      onMoveStage={(s) => moveDeal(d.id, s)}
                      onQuote={stage !== "gewonnen" ? () => createQuoteFromDeal(d) : undefined}
                      onInvoice={stage === "gewonnen" ? () => createInvoiceFromDeal(d) : undefined}
                      onUpdate={(patch) => { updateDeal(d.id, patch); toast.success("Deal aktualisiert") }}
                    />
                  ))}
                </SortableContext>
                {stage === "lead" && (
                  <LeadQuickAdd
                    onAdd={(d) =>
                      addDeal({ ...d, stage: "lead", customerId: "", person: activePerson })
                    }
                  />
                )}
              </Column>
            )
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
          {activeDeal ? <DealCardInner deal={activeDeal} customer={customerName(activeDeal.customerId)} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Verlorene Deals: unterhalb des Boards, einklappbar — Basis der Win/Loss-Analyse */}
      {lostDeals.length > 0 && (
        <LostSection
          deals={lostDeals}
          customerName={customerName}
          onReactivate={(d) => {
            updateDeal(d.id, { lostAt: undefined, lostReason: undefined })
            toast.success(`„${d.title}" reaktiviert`)
          }}
        />
      )}
    </div>
  )
}

// Einklappbare Sektion für verlorene Deals: Titel, Wert, Grund, Datum, Reaktivieren.
function LostSection({
  deals,
  customerName,
  onReactivate,
}: {
  deals: Deal[]
  customerName: (id: string) => string
  onReactivate: (deal: Deal) => void
}) {
  const [open, setOpen] = useState(false)
  const lostSum = deals.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2.5">
          <ThumbsDown className="h-4 w-4" style={{ color: EXPENSE }} />
          <span className="text-sm font-bold tracking-tight" style={{ color: EXPENSE }}>Verloren</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: `${EXPENSE}24`, color: EXPENSE }}>{deals.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="num font-heading text-[clamp(1rem,0.4vw+0.9rem,1.15rem)] font-bold tabular-nums text-muted-foreground">{eur0(lostSum)}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <div className="divide-y divide-border/60 border-t border-border/60">
          {deals.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{d.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {customerName(d.customerId) !== "—" && <span className="truncate">{customerName(d.customerId)}</span>}
                  {d.lostAt && <span>verloren am {dateDE(d.lostAt.slice(0, 10))}</span>}
                  {d.lostReason && <span className="italic">„{d.lostReason}"</span>}
                </div>
              </div>
              <span className="num font-heading text-[clamp(1rem,0.4vw+0.9rem,1.15rem)] font-bold tabular-nums text-muted-foreground">{eur0(d.value)}</span>
              <button
                type="button"
                onClick={() => onReactivate(d)}
                title="Deal reaktivieren"
                aria-label={`Deal „${d.title}" reaktivieren`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reaktivieren
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function Column({ stage, count, sum, children }: { stage: DealStage; count: number; sum: number; children: React.ReactNode }) {
  const accent = DEAL_STAGE_COLOR[stage]
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[42vh] w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl transition-all sm:w-[55vw] lg:min-h-[60vh] lg:w-auto lg:shrink lg:snap-align-none"
      style={{
        border: `1px solid ${isOver ? `${accent}aa` : `${accent}4d`}`,
        background: `linear-gradient(180deg, ${accent}26, ${accent}0a 55%)`,
        boxShadow: isOver ? `inset 0 0 0 1px ${accent}66, 0 0 30px -6px ${accent}88` : `inset 0 1px 0 0 ${accent}26`,
      }}
    >
      <div className="border-b px-4 py-3" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}24` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
            <span className="text-sm font-bold tracking-tight" style={{ color: accent }}>{DEAL_STAGE_LABEL[stage]}</span>
          </div>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: `${accent}24`, color: accent }}>{count}</span>
        </div>
        <div className="num mt-1 font-heading text-[clamp(1rem,0.5vw+0.9rem,1.2rem)] font-bold tabular-nums" style={{ color: accent }}>{eur0(sum)}</div>
      </div>
      <div className="flex-1 space-y-2.5 p-3">{children}</div>
    </div>
  )
}

// Schnellerfassung neuer Leads direkt in der Lead-Spalte: Name, Preis,
// Telefon, E-Mail + kurze Notiz. Kein Kunde nötig.
function LeadQuickAdd({
  onAdd,
}: {
  onAdd: (data: { title: string; value: number; phone?: string; email?: string; note?: string }) => void
}) {
  const accent = DEAL_STAGE_COLOR.lead
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")

  function save() {
    const t = title.trim()
    if (!t) return
    // Deutsche Beträge robust parsen ("1.000" → 1000, "12,50"/"12.50" → 12.5)
    const value = parseAmountDE(price)
    onAdd({
      title: t,
      value: Number.isFinite(value) && value > 0 ? value : 0,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      note: note.trim() || undefined,
    })
    setTitle(""); setPrice(""); setPhone(""); setEmail(""); setNote("")
    setOpen(false)
  }

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") save(); if (e.key === "Escape") setOpen(false) }
  const field = "h-9 w-full rounded-lg border border-border bg-white/[0.04] px-2.5 text-sm outline-none focus:border-primary/50"

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-xs font-semibold transition-colors hover:brightness-125"
        style={{ borderColor: `${accent}55`, color: accent }}
      >
        <Plus className="h-3.5 w-3.5" /> Lead erfassen
      </button>
    )
  }

  return (
    <div className="space-y-2 rounded-xl border p-2.5" style={{ borderColor: `${accent}66`, background: `${accent}12` }}>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={onKey} placeholder="Name / Firma" className={field} />
      <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.,]/g, ""))} onKeyDown={onKey} inputMode="decimal" placeholder="Preis € (geschätzt)" className={field} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={onKey} type="tel" placeholder="Telefon" className={field} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} type="email" placeholder="E-Mail" className={field} />
      <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={onKey} placeholder="Notiz (z. B. hat sich gemeldet)" className={field} />
      <div className="flex justify-end gap-1.5">
        <button onClick={() => setOpen(false)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          Abbrechen
        </button>
        <button
          onClick={save}
          className="rounded-lg px-3 py-1 text-xs font-bold transition-colors"
          style={{ backgroundColor: `${accent}26`, color: accent, border: `1px solid ${accent}66` }}
        >
          Hinzufügen
        </button>
      </div>
    </div>
  )
}

function SortableDeal({ deal, customer, highlighted, onRemove, onWin, onLost, onMoveStage, onQuote, onInvoice, onUpdate }: { deal: Deal; customer: string; highlighted?: boolean; onRemove: () => void; onWin?: () => void; onLost?: () => void; onMoveStage?: (stage: DealStage) => void; onQuote?: () => void; onInvoice?: () => void; onUpdate?: (patch: Partial<Omit<Deal, "id" | "createdAt">>) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }
  return (
    <div ref={setNodeRef} style={style} id={`deal-${deal.id}`}>
      <DealCardInner deal={deal} customer={customer} highlighted={highlighted} onRemove={onRemove} onWin={onWin} onLost={onLost} onMoveStage={onMoveStage} onQuote={onQuote} onInvoice={onInvoice} onUpdate={onUpdate} handleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

function DealCardInner({
  deal,
  customer,
  highlighted,
  onRemove,
  onWin,
  onLost,
  onMoveStage,
  onQuote,
  onInvoice,
  onUpdate,
  handleProps,
  dragging,
}: {
  deal: Deal
  customer: string
  highlighted?: boolean
  onRemove?: () => void
  onWin?: () => void
  onLost?: () => void
  onMoveStage?: (stage: DealStage) => void
  onQuote?: () => void
  onInvoice?: () => void
  onUpdate?: (patch: Partial<Omit<Deal, "id" | "createdAt">>) => void
  handleProps?: Record<string, unknown>
  dragging?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const person = PEOPLE.find((p) => p.id === deal.person)
  const stageIdx = DEAL_STAGES.indexOf(deal.stage)
  const prevStage = stageIdx > 0 ? DEAL_STAGES[stageIdx - 1] : null
  const nextStage = stageIdx < DEAL_STAGES.length - 1 ? DEAL_STAGES[stageIdx + 1] : null
  // Nachfass-Nudge: seit über 7 Tagen keine Stufenbewegung mehr (nur offene Deals).
  const daysSinceStageChange = deal.stageChangedAt ? diffDays(todayISO(), deal.stageChangedAt.slice(0, 10)) : 0
  const stale = deal.stage !== "gewonnen" && !!deal.stageChangedAt && daysSinceStageChange > 7
  // Kompaktes Inline-Edit-Panel statt Karteninhalt
  if (editing && onUpdate) {
    return (
      <DealEdit
        deal={deal}
        onCancel={() => setEditing(false)}
        onSave={(patch) => {
          onUpdate(patch)
          setEditing(false)
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-[#101010] p-3.5 transition-all",
        dragging ? "rotate-[1.5deg] border-primary/40 shadow-2xl shadow-black/60" : "hover:border-white/15 hover:bg-[#141414]",
        highlighted && "ring-2 ring-primary",
      )}
    >
      <div className="flex items-start gap-2.5">
        <button {...handleProps} className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing" aria-label="Ziehen">
          <GripVertical className="h-[18px] w-[18px]" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium leading-snug">{deal.title}</div>
          {customer && customer !== "—" && <div className="mt-0.5 truncate text-xs text-muted-foreground">{customer}</div>}
          {deal.note && <div className="mt-1 line-clamp-2 text-xs italic text-muted-foreground/90">{deal.note}</div>}
          {(deal.phone || deal.email) && (
            <div className="mt-1.5 flex flex-col gap-1">
              {deal.phone && (
                <a href={`tel:${deal.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 truncate text-xs text-muted-foreground transition-colors hover:text-primary">
                  <Phone className="h-3 w-3 shrink-0" /> {deal.phone}
                </a>
              )}
              {deal.email && (
                <a href={`mailto:${deal.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 truncate text-xs text-muted-foreground transition-colors hover:text-primary">
                  <Mail className="h-3 w-3 shrink-0" /> {deal.email}
                </a>
              )}
            </div>
          )}
          {stale && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-semibold text-destructive">
              Nachfassen? · seit {daysSinceStageChange} T. ohne Bewegung
            </div>
          )}
          {(deal.probability != null || deal.expectedCloseDate) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
              {deal.probability != null && <span className="tabular-nums">{deal.probability} % Abschluss-Wahrsch.</span>}
              {deal.expectedCloseDate && <span>bis {dateDE(deal.expectedCloseDate)}</span>}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="num font-heading text-[clamp(1rem,0.4vw+0.9rem,1.15rem)] font-bold tabular-nums">{eur0(deal.value)}</span>
            {person && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: `${person.color}26`, color: person.color }} title={person.name}>
                {person.initials}
              </span>
            )}
          </div>
        </div>
        {!dragging && (onRemove || onWin || onLost || onQuote || onInvoice || onUpdate) && (
          <div className="action-reveal absolute right-2 top-2 flex items-center gap-1">
            {onUpdate && (
              <button onClick={() => setEditing(true)} title="Deal bearbeiten" aria-label="Deal bearbeiten" className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onQuote && (
              <button onClick={onQuote} title="Angebot aus Deal erstellen" aria-label="Angebot aus Deal erstellen" className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary">
                <FileText className="h-3.5 w-3.5" />
              </button>
            )}
            {onInvoice && (
              <button onClick={onInvoice} title="Rechnung aus Deal erstellen" aria-label="Rechnung aus Deal erstellen" className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-success/15 hover:text-success">
                <Receipt className="h-3.5 w-3.5" />
              </button>
            )}
            {onWin && (
              <button onClick={onWin} title="Als gewonnen markieren" aria-label="Als gewonnen markieren" className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-success/15 hover:text-success">
                <Trophy className="h-3.5 w-3.5" />
              </button>
            )}
            {onLost && (
              <button onClick={onLost} title="Als verloren markieren" aria-label="Als verloren markieren" className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive">
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            )}
            {onRemove && (
              <button onClick={onRemove} title="Löschen" aria-label="Deal löschen" className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile/Tablet: Stufe per Tap wechseln (Drag bleibt Desktop vorbehalten) */}
      {!dragging && onMoveStage && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-2.5 lg:hidden">
          <button
            type="button"
            onClick={() => prevStage && onMoveStage(prevStage)}
            disabled={!prevStage}
            aria-label="Eine Stufe zurück"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors disabled:opacity-30 active:bg-white/[0.06]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex-1 truncate rounded-lg px-2 py-1 text-center text-[11px] font-bold" style={{ backgroundColor: `${DEAL_STAGE_COLOR[deal.stage]}1f`, color: DEAL_STAGE_COLOR[deal.stage] }}>
            {DEAL_STAGE_LABEL[deal.stage]}
          </span>
          <button
            type="button"
            onClick={() => nextStage && onMoveStage(nextStage)}
            disabled={!nextStage}
            aria-label="Eine Stufe weiter"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors disabled:opacity-30 active:bg-white/[0.06]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// Kompaktes Inline-Edit-Panel direkt auf der Karte: Titel, Wert, Wahrscheinlichkeit,
// erwartetes Abschlussdatum, Kontakt und Notiz — speichert via updateDeal-Patch.
function DealEdit({
  deal,
  onSave,
  onCancel,
}: {
  deal: Deal
  onSave: (patch: Partial<Omit<Deal, "id" | "createdAt">>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(deal.title)
  const [value, setValue] = useState(String(deal.value).replace(".", ","))
  // "" = automatisch aus der Stufe (Default-Wahrscheinlichkeit)
  const [probability, setProbability] = useState(deal.probability != null ? String(deal.probability) : "")
  const [closeDate, setCloseDate] = useState(deal.expectedCloseDate ?? "")
  const [phone, setPhone] = useState(deal.phone ?? "")
  const [email, setEmail] = useState(deal.email ?? "")
  const [note, setNote] = useState(deal.note ?? "")

  function save() {
    const t = title.trim()
    if (!t) return
    const parsed = parseAmountDE(value)
    onSave({
      title: t,
      value: Number.isFinite(parsed) && parsed >= 0 ? parsed : deal.value,
      probability: probability === "" ? undefined : Number(probability),
      expectedCloseDate: closeDate || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      note: note.trim() || undefined,
    })
  }

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel() }
  const field = "h-9 w-full rounded-lg border border-border bg-white/[0.04] px-2.5 text-sm outline-none focus:border-primary/50"
  const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"

  return (
    <div className="space-y-2 rounded-xl border border-primary/40 bg-[#141414] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Deal bearbeiten</span>
        <button onClick={onCancel} aria-label="Bearbeiten abbrechen" className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={onKey} placeholder="Titel des Deals" aria-label="Titel" className={field} />
      <input value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9.,]/g, ""))} onKeyDown={onKey} inputMode="decimal" placeholder="Wert €" aria-label="Wert in Euro" className={field} />
      <div>
        <label className={label}>Abschluss-Wahrscheinlichkeit</label>
        <select value={probability} onChange={(e) => setProbability(e.target.value)} aria-label="Abschluss-Wahrscheinlichkeit" className={cn(field, "[color-scheme:dark]")}>
          <option value="">Automatisch ({DEAL_STAGE_DEFAULT_PROBABILITY[deal.stage]} % aus Stufe)</option>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => (
            <option key={p} value={p}>{p} %</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Erwarteter Abschluss</label>
        <input value={closeDate} onChange={(e) => setCloseDate(e.target.value)} type="date" aria-label="Erwartetes Abschlussdatum" className={cn(field, "[color-scheme:dark]")} />
      </div>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={onKey} type="tel" placeholder="Telefon" aria-label="Telefon" className={field} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} type="email" placeholder="E-Mail" aria-label="E-Mail" className={field} />
      <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={onKey} placeholder="Notiz" aria-label="Notiz" className={field} />
      <div className="flex justify-end gap-1.5 pt-0.5">
        <button onClick={onCancel} className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          Abbrechen
        </button>
        <button
          onClick={save}
          disabled={!title.trim()}
          className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition-colors disabled:opacity-40"
        >
          Speichern
        </button>
      </div>
    </div>
  )
}

type DealSaveInput = {
  title: string
  value: number
  stage: DealStage
  customerId?: string
  newCustomer?: { company: string; contactName?: string; email?: string; phone?: string }
}

function AddDeal({
  customers,
  onSave,
  onCancel,
}: {
  customers: { id: string; company: string }[]
  onSave: (input: DealSaveInput) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState("")
  const [value, setValue] = useState("")
  const [stage, setStage] = useState<DealStage>("lead")
  // Kontakt: bestehenden Kunden wählen oder direkt neu anlegen (einheitliches Formular).
  const [mode, setMode] = useState<"existing" | "new">(customers.length ? "existing" : "new")
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "")
  const [nc, setNc] = useState({ company: "", contactName: "", email: "", phone: "" })
  const setNcField = (k: keyof typeof nc) => (e: React.ChangeEvent<HTMLInputElement>) => setNc((p) => ({ ...p, [k]: e.target.value }))

  function save() {
    if (!title.trim()) return
    if (mode === "new") {
      if (!nc.company.trim()) return
      onSave({
        title: title.trim(),
        value: Number(value) || 0,
        stage,
        newCustomer: {
          company: nc.company.trim(),
          contactName: nc.contactName.trim() || undefined,
          email: nc.email.trim() || undefined,
          phone: nc.phone.trim() || undefined,
        },
      })
    } else {
      if (!customerId) return
      onSave({ title: title.trim(), value: Number(value) || 0, stage, customerId })
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold">Neuer Deal</h3>
        <button onClick={onCancel} className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.06]"><X className="h-4 w-4" /></button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel des Deals" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
        <input value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Wert €" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
      </div>

      {/* Kontakt-Umschalter */}
      <div className="mt-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kontakt</span>
          <div className="flex items-center rounded-lg border border-border bg-white/[0.03] p-0.5">
            <button onClick={() => setMode("existing")} disabled={!customers.length} className={cn("rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40", mode === "existing" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Bestehender Kunde</button>
            <button onClick={() => setMode("new")} className={cn("rounded-md px-2.5 py-1 text-xs font-semibold transition-colors", mode === "new" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Neuer Kontakt</button>
          </div>
        </div>

        {mode === "existing" ? (
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]">
            {customers.length === 0 && <option value="">— kein Kunde —</option>}
            {customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={nc.company} onChange={setNcField("company")} placeholder="Firma *" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
            <input value={nc.contactName} onChange={setNcField("contactName")} placeholder="Ansprechpartner" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
            <input value={nc.email} onChange={setNcField("email")} type="email" placeholder="E-Mail" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
            <input value={nc.phone} onChange={setNcField("phone")} placeholder="Telefon" className="h-10 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50" />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {DEAL_STAGES.map((s) => (
          <button key={s} onClick={() => setStage(s)} className={cn("rounded-lg border px-2.5 py-1 text-xs transition-colors", stage === s ? "border-transparent" : "border-border text-muted-foreground")} style={stage === s ? { backgroundColor: `${DEAL_STAGE_COLOR[s]}26`, color: DEAL_STAGE_COLOR[s] } : undefined}>
            {DEAL_STAGE_LABEL[s]}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>Abbrechen</Button>
          <Button size="sm" onClick={save}>Speichern</Button>
        </div>
      </div>
    </Card>
  )
}


"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, CalendarDays, Clock, Sun, RotateCcw, Tags, X, Pencil } from "lucide-react"
import { useStore } from "@/lib/store"
import {
  PEOPLE,
  CATEGORY_COLOR_PALETTE,
  resolveCategory,
  type AppointmentCategory,
  type AppointmentCategoryDef,
} from "@/lib/types"
import { occurrencesInRange, toISO, parseISO, todayISO } from "@/lib/recurrence"
import { dateDE, monthName } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

// Wochen-Zeitraster
const START_HOUR = 6
const END_HOUR = 22 // exklusiv → letzte Zeile 21:00
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const ROW_H = 52 // px pro Stunde

type ViewMode = "month" | "week" | "day"

interface DayEvent {
  id: string
  title: string
  category: AppointmentCategory
  categoryColor: string
  categoryLabel: string
  time?: string
  endTime?: string
  done: boolean
}

interface Draft {
  date: string
  time?: string
  endTime?: string
}

function mondayOf(iso: string): Date {
  const d = parseISO(iso)
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  d.setHours(0, 0, 0, 0)
  return d
}

export function CalendarView() {
  const {
    db,
    activePerson,
    addAppointment,
    updateAppointment,
    toggleAppointmentDone,
    removeAppointment,
    addAppointmentCategory,
    updateAppointmentCategory,
    removeAppointmentCategory,
  } = useStore()
  const person = PEOPLE.find((p) => p.id === activePerson)!
  const today = todayISO()

  const [view, setView] = useState<ViewMode>("month")
  const [editEvt, setEditEvt] = useState<DayEvent | null>(null)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selected, setSelected] = useState(today)
  const [draft, setDraft] = useState<Draft | null>(null)

  const myAppts = useMemo(
    () => db.appointments.filter((a) => a.person === activePerson),
    [db.appointments, activePerson],
  )

  const categories = db.appointmentCategories
  const [manageCats, setManageCats] = useState(false)

  // Monats-Grid (Mo-basiert, 42 Zellen)
  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1)
    const offset = (first.getDay() + 6) % 7
    const start = new Date(cursor.year, cursor.month, 1 - offset)
    const cells: string[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      cells.push(toISO(d))
    }
    return cells
  }, [cursor])

  // Woche aus selected ableiten
  const weekDays = useMemo(() => {
    const m = mondayOf(selected)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(m)
      d.setDate(m.getDate() + i)
      return toISO(d)
    })
  }, [selected])

  function eventsFor(from: string, to: string): Map<string, DayEvent[]> {
    const map = new Map<string, DayEvent[]>()
    for (const a of myAppts) {
      const cat = resolveCategory(categories, a.category)
      for (const date of occurrencesInRange(a, from, to)) {
        const arr = map.get(date) ?? []
        arr.push({
          id: a.id,
          title: a.title,
          category: a.category,
          categoryColor: cat.color,
          categoryLabel: cat.label,
          time: a.time,
          endTime: a.endTime,
          done: a.completedDates.includes(date),
        })
        map.set(date, arr)
      }
    }
    return map
  }

  const monthEvents = useMemo(
    () => eventsFor(grid[0], grid[grid.length - 1]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myAppts, grid, categories],
  )
  const weekEvents = useMemo(
    () => eventsFor(weekDays[0], weekDays[6]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myAppts, weekDays, categories],
  )

  // Day- und Week-View lesen beide aus weekEvents (deckt selected garantiert ab);
  // nur die Monatsansicht nutzt das 42-Zellen-Grid.
  const selectedEvents = (view === "month" ? monthEvents : weekEvents).get(selected) ?? []

  function moveMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }
  function shiftSelected(deltaDays: number) {
    const d = parseISO(selected)
    d.setDate(d.getDate() + deltaDays)
    setSelected(toISO(d))
  }
  function move(delta: number) {
    if (view === "day") shiftSelected(delta)
    else if (view === "week") shiftSelected(delta * 7)
    else moveMonth(delta)
  }
  function goToday() {
    const d = new Date()
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
    setSelected(today)
  }

  const headerLabel =
    view === "day"
      ? `${dateDE(selected)} ${parseISO(selected).getFullYear()}`
      : view === "week"
        ? `${parseISO(weekDays[0]).getDate()}. – ${parseISO(weekDays[6]).getDate()}. ${monthName(parseISO(weekDays[6]).getMonth())} ${parseISO(weekDays[6]).getFullYear()}`
        : `${monthName(cursor.month)} ${cursor.year}`

  function save(input: { title: string; category: AppointmentCategory; time?: string; endTime?: string }) {
    if (!draft) return
    addAppointment({
      person: activePerson,
      recurrence: { freq: "none", interval: 1 },
      completedDates: [],
      ...input,
      date: draft.date,
    })
    setDraft(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Kopfzeile: Navigation + View-Switch */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => move(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="min-w-[220px] text-center font-heading text-lg font-bold">{headerLabel}</h3>
          <Button variant="ghost" size="icon" onClick={() => move(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={goToday}>
            Heute
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-white/[0.03] p-1">
          <SwitchBtn active={view === "day"} onClick={() => setView("day")} icon={<Sun className="h-4 w-4" />} label="Tag" />
          <SwitchBtn active={view === "week"} onClick={() => setView("week")} icon={<Clock className="h-4 w-4" />} label="Woche" />
          <SwitchBtn active={view === "month"} onClick={() => setView("month")} icon={<CalendarDays className="h-4 w-4" />} label="Monat" />
        </div>
      </Card>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
        <div className="flex min-h-0 flex-col lg:col-span-2">
          {view === "month" ? (
            <MonthGrid
              grid={grid}
              month={cursor.month}
              today={today}
              selected={selected}
              events={monthEvents}
              onSelect={(d) => setSelected(d)}
            />
          ) : (
            <WeekGrid
              days={view === "day" ? [selected] : weekDays}
              today={today}
              selected={selected}
              events={weekEvents}
              onSelectDay={(d) => setSelected(d)}
              onCreate={(d) => setDraft(d)}
            />
          )}
        </div>

        {/* Tages-Panel */}
        <Card className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <div className="text-xs text-muted-foreground">Ausgewählter Tag</div>
              <div className="font-heading text-base font-bold">{dateDE(selected)}</div>
            </div>
            <Button size="sm" onClick={() => { setEditEvt(null); setDraft(draft ? null : { date: selected }) }}>
              <Plus className="h-4 w-4" /> Termin
            </Button>
          </div>

          {/* Neuer Termin */}
          {draft && !editEvt && (
            <AddForm
              key={`new-${draft.date}-${draft.time ?? ""}`}
              categories={categories}
              defaultTime={draft.time}
              defaultEnd={draft.endTime}
              onCancel={() => setDraft(null)}
              onManageCategories={() => setManageCats(true)}
              onSave={save}
            />
          )}

          {/* Termin bearbeiten */}
          {editEvt && (
            <AddForm
              key={`edit-${editEvt.id}`}
              categories={categories}
              title="Termin bearbeiten"
              submitLabel="Aktualisieren"
              initialTitle={editEvt.title}
              initialCategory={editEvt.category}
              defaultTime={editEvt.time}
              defaultEnd={editEvt.endTime}
              onCancel={() => setEditEvt(null)}
              onManageCategories={() => setManageCats(true)}
              onSave={(input) => {
                updateAppointment(editEvt.id, input)
                setEditEvt(null)
              }}
            />
          )}

          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {selectedEvents.length === 0 && !draft && !editEvt && (
              <p className="py-8 text-center text-sm text-muted-foreground">Keine Termine an diesem Tag.</p>
            )}
            {(() => {
              const open = selectedEvents.filter((e) => !e.done).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
              const done = selectedEvents.filter((e) => e.done).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
              return (
                <>
                  <AnimatePresence initial={false}>
                    {open.map((e) => (
                      <DayEventRow
                        key={e.id}
                        e={e}
                        active={editEvt?.id === e.id}
                        onToggle={() => toggleAppointmentDone(e.id, selected)}
                        onRemove={() => removeAppointment(e.id)}
                        onEdit={() => { setDraft(null); setEditEvt(editEvt?.id === e.id ? null : e) }}
                      />
                    ))}
                  </AnimatePresence>

                  {done.length > 0 && (
                    <div className="flex items-center gap-2 px-1 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-success">
                      <Check className="h-3.5 w-3.5" /> Erledigt · {done.length}
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {done.map((e) => (
                      <DayEventRow
                        key={e.id}
                        e={e}
                        active={editEvt?.id === e.id}
                        onToggle={() => toggleAppointmentDone(e.id, selected)}
                        onRemove={() => removeAppointment(e.id)}
                        onEdit={() => { setDraft(null); setEditEvt(editEvt?.id === e.id ? null : e) }}
                      />
                    ))}
                  </AnimatePresence>
                </>
              )
            })()}
          </div>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {view === "week" ? "Mit der Maus über die Stunden ziehen, um einen Timeslot anzulegen · " : ""}
        Kalender von <span style={{ color: person.color }}>{person.name}</span> · oben links die Person wechseln
      </p>

      <AnimatePresence>
        {manageCats && (
          <CategoryManager
            categories={categories}
            onClose={() => setManageCats(false)}
            onAdd={addAppointmentCategory}
            onUpdate={updateAppointmentCategory}
            onRemove={removeAppointmentCategory}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Kategorie-Verwaltung (Modal) ---------- */

function CategoryManager({
  categories,
  onClose,
  onAdd,
  onUpdate,
  onRemove,
}: {
  categories: AppointmentCategoryDef[]
  onClose: () => void
  onAdd: (input: Omit<AppointmentCategoryDef, "id">) => void
  onUpdate: (id: string, patch: Partial<Omit<AppointmentCategoryDef, "id">>) => void
  onRemove: (id: string) => void
}) {
  const [newLabel, setNewLabel] = useState("")
  const [newColor, setNewColor] = useState(CATEGORY_COLOR_PALETTE[0])

  function add() {
    const label = newLabel.trim()
    if (!label) return
    onAdd({ label, color: newColor })
    setNewLabel("")
    setNewColor(CATEGORY_COLOR_PALETTE[(CATEGORY_COLOR_PALETTE.indexOf(newColor) + 1) % CATEGORY_COLOR_PALETTE.length])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Tags className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold">Kategorien verwalten</h3>
              <p className="text-xs text-muted-foreground">Eigene Termin-Kategorien mit Farbe anlegen</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[52vh] space-y-2 overflow-y-auto p-5">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              cat={c}
              canDelete={categories.length > 1}
              onUpdate={(patch) => onUpdate(c.id, patch)}
              onRemove={() => onRemove(c.id)}
            />
          ))}
        </div>

        <div className="space-y-3 border-t border-border bg-white/[0.02] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Neue Kategorie</div>
          <div className="flex gap-2">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="z. B. Werkstatt-Termin"
              className="h-10 flex-1 rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50"
            />
            <Button size="sm" onClick={add} className="shrink-0">
              <Plus className="h-4 w-4" /> Anlegen
            </Button>
          </div>
          <ColorPicker value={newColor} onChange={setNewColor} />
        </div>
      </motion.div>
    </motion.div>
  )
}

function CategoryRow({
  cat,
  canDelete,
  onUpdate,
  onRemove,
}: {
  cat: AppointmentCategoryDef
  canDelete: boolean
  onUpdate: (patch: Partial<Omit<AppointmentCategoryDef, "id">>) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(cat.label)

  function commit() {
    const v = label.trim()
    if (v && v !== cat.label) onUpdate({ label: v })
    else setLabel(cat.label)
    setEditing(false)
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-border p-3"
      style={{ backgroundColor: `${cat.color}10`, boxShadow: `inset 3px 0 0 0 ${cat.color}` }}
    >
      <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}88` }} />
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setLabel(cat.label); setEditing(false) } }}
          className="h-8 flex-1 rounded-md border border-border bg-white/[0.04] px-2 text-sm outline-none focus:border-primary/50"
        />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left text-sm font-medium" title="Name bearbeiten">
          {cat.label}
        </button>
      )}
      <div className="flex shrink-0 items-center gap-1.5">
        {CATEGORY_COLOR_PALETTE.map((col) => (
          <button
            key={col}
            onClick={() => onUpdate({ color: col })}
            aria-label={`Farbe ${col}`}
            className="h-5 w-5 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: col,
              boxShadow: cat.color === col ? `0 0 0 2px var(--card), 0 0 0 4px ${col}` : "none",
            }}
          />
        ))}
        {!editing && (
          <button onClick={() => setEditing(true)} title="Umbenennen" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={onRemove}
          disabled={!canDelete}
          title={canDelete ? "Löschen" : "Mindestens eine Kategorie behalten"}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLOR_PALETTE.map((col) => {
        const sel = value === col
        return (
          <button
            key={col}
            onClick={() => onChange(col)}
            aria-label={`Farbe ${col}`}
            className="h-8 w-8 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: col,
              boxShadow: sel ? `0 0 0 2px var(--card), 0 0 0 4px ${col}, 0 0 14px ${col}aa` : "none",
            }}
          />
        )
      })}
    </div>
  )
}

/* ---------- Animierte, swipebare Termin-Zeile ---------- */

function DayEventRow({
  e,
  active,
  onToggle,
  onRemove,
  onEdit,
}: {
  e: DayEvent
  active: boolean
  onToggle: () => void
  onRemove: () => void
  onEdit: () => void
}) {
  const done = e.done
  const color = e.categoryColor
  // Opake Hintergründe — sonst scheinen die Swipe-Hinweise dahinter durch.
  const bg = active ? "#1e1810" : done ? "#0f1915" : "#0d0d0d"

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 92) onToggle()
    else if (info.offset.x < -92) onRemove()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 480, damping: 38 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Swipe-Hinweise im Hintergrund */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-xl bg-[#0a0a0a] px-4 text-sm font-bold">
        <span className="flex items-center gap-1.5 text-success">
          {done ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {done ? "Offen" : "Erledigt"}
        </span>
        <span className="flex items-center gap-1.5 text-destructive">
          Löschen <Trash2 className="h-4 w-4" />
        </span>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
        className={cn(
          "relative flex touch-pan-y items-center gap-3 rounded-xl border p-3",
          active ? "border-primary/50" : "border-border",
        )}
        style={{ backgroundColor: bg, boxShadow: `inset 3px 0 0 0 ${done ? "#34d399" : color}` }}
      >
        {/* Abhaken — große, klare Checkbox mit Hover-Vorschau */}
        <button
          onClick={onToggle}
          aria-label={done ? "Als offen markieren" : "Als erledigt markieren"}
          aria-pressed={done}
          title={done ? "Rückgängig machen" : "Als erledigt markieren"}
          className={cn(
            "group/check flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60",
            done
              ? "border-success bg-success text-[#06281c]"
              : "border-muted-foreground/50 text-success hover:border-success hover:bg-success/10",
          )}
        >
          {done ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 20 }}>
              <Check className="h-5 w-5" strokeWidth={3} />
            </motion.span>
          ) : (
            <Check className="h-5 w-5 opacity-0 transition-opacity group-hover/check:opacity-60" strokeWidth={3} />
          )}
        </button>

        {/* Inhalt (Klick = bearbeiten) */}
        <button onClick={onEdit} className="min-w-0 flex-1 text-left" title="Termin bearbeiten">
          <div className={cn("text-base font-medium transition-colors", done && "text-muted-foreground line-through")}>{e.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                <Check className="h-3 w-3" strokeWidth={3} /> Erledigt
              </span>
            )}
            {e.time && (
              <span className="text-sm text-muted-foreground">
                {e.time}{e.endTime ? `–${e.endTime}` : ""}
              </span>
            )}
            <Badge color={color}>{e.categoryLabel}</Badge>
          </div>
        </button>

        {/* Aktion rechts */}
        {done ? (
          <button onClick={onToggle} title="Rückgängig" className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
            <RotateCcw className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={onRemove} title="Löschen" className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

function SwitchBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

/* ---------- Monats-Grid ---------- */

function MonthGrid({
  grid,
  month,
  today,
  selected,
  events,
  onSelect,
}: {
  grid: string[]
  month: number
  today: string
  selected: string
  events: Map<string, DayEvent[]>
  onSelect: (d: string) => void
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="grid shrink-0 grid-cols-7 border-b border-border bg-white/[0.02]">
        {WD.map((d) => (
          <div key={d} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7" style={{ gridTemplateRows: "repeat(6, minmax(0, 1fr))" }}>
        {grid.map((date, idx) => {
          const inMonth = parseISO(date).getMonth() === month
          const isToday = date === today
          const isSelected = date === selected
          const evs = events.get(date) ?? []
          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              className={cn(
                "flex min-h-[84px] flex-col gap-1.5 overflow-hidden border-b border-r border-border/60 p-2 text-left transition-colors",
                idx % 7 === 6 && "border-r-0",
                idx >= 35 && "border-b-0",
                isSelected ? "bg-primary/10 ring-1 ring-inset ring-primary/50" : "hover:bg-white/[0.03]",
                !inMonth && "bg-black/20 opacity-40",
              )}
            >
              <div className="flex shrink-0 items-center justify-between">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold",
                    isToday && "bg-primary text-primary-foreground",
                    !isToday && isSelected && "text-primary",
                  )}
                >
                  {parseISO(date).getDate()}
                </span>
                {evs.length > 1 && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {evs.length} Termine
                  </span>
                )}
              </div>
              <div className="min-h-0 flex-1 space-y-1 overflow-hidden">
                {evs.slice(0, 4).map((e, i) => (
                  <div
                    key={e.id + i}
                    className="flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-xs font-medium leading-tight"
                    style={{ backgroundColor: `${e.categoryColor}1f`, color: e.categoryColor }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: e.categoryColor }} />
                    {e.time && <span className="shrink-0 tabular-nums opacity-90">{e.time}</span>}
                    <span className="truncate">{e.title}</span>
                  </div>
                ))}
                {evs.length > 4 && (
                  <div className="px-1 text-[11px] font-medium text-muted-foreground">+{evs.length - 4} weitere</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

/* ---------- Wochen-Grid mit Drag-to-create ---------- */

function WeekGrid({
  days,
  today,
  selected,
  events,
  onSelectDay,
  onCreate,
}: {
  days: string[]
  today: string
  selected: string
  events: Map<string, DayEvent[]>
  onSelectDay: (d: string) => void
  onCreate: (draft: Draft) => void
}) {
  const [drag, setDrag] = useState<{ day: string; a: number; b: number } | null>(null)
  const dragging = useRef(false)

  // Auswahl global beenden (auch wenn Maus außerhalb losgelassen wird)
  useEffect(() => {
    function up() {
      if (dragging.current && drag) {
        const start = Math.min(drag.a, drag.b)
        const end = Math.max(drag.a, drag.b) + 1
        onCreate({
          date: drag.day,
          time: `${String(start).padStart(2, "0")}:00`,
          endTime: `${String(end).padStart(2, "0")}:00`,
        })
        onSelectDay(drag.day)
      }
      dragging.current = false
      setDrag(null)
    }
    window.addEventListener("pointerup", up)
    return () => window.removeEventListener("pointerup", up)
  }, [drag, onCreate, onSelectDay])

  return (
    <Card className="overflow-hidden">
      {/* Tages-Kopf */}
      <div className="grid border-b border-border bg-white/[0.02]" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
        <div />
        {days.map((d) => {
          const isToday = d === today
          const isSel = d === selected
          const dt = parseISO(d)
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={cn(
                "flex flex-col items-center gap-1 border-l border-border/60 py-2.5 transition-colors",
                isSel ? "bg-primary/10" : "hover:bg-white/[0.03]",
              )}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {WD[(dt.getDay() + 6) % 7]}
              </span>
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold",
                  isToday && "bg-primary text-primary-foreground",
                  !isToday && isSel && "text-primary",
                )}
              >
                {dt.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* Zeitraster */}
      <div className="max-h-[64vh] overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          {/* Stundenspalte */}
          <div>
            {HOURS.map((h) => (
              <div key={h} className="relative border-b border-border/40" style={{ height: ROW_H }}>
                <span className="absolute -top-2 right-2 text-[11px] tabular-nums text-muted-foreground">
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Tagesspalten */}
          {days.map((day) => {
            const evs = events.get(day) ?? []
            return (
              <div key={day} className="relative border-l border-border/60">
                {/* Stunden-Zellen (Drag-Targets) */}
                {HOURS.map((h, hi) => {
                  const inSel =
                    drag &&
                    drag.day === day &&
                    hi >= Math.min(drag.a, drag.b) &&
                    hi <= Math.max(drag.a, drag.b)
                  return (
                    <div
                      key={h}
                      onPointerDown={(e) => {
                        e.preventDefault()
                        dragging.current = true
                        setDrag({ day, a: hi, b: hi })
                        onSelectDay(day)
                      }}
                      onPointerEnter={() => {
                        if (dragging.current) setDrag((d) => (d && d.day === day ? { ...d, b: hi } : d))
                      }}
                      className={cn(
                        "border-b border-border/40 transition-colors",
                        inSel ? "bg-primary/25" : "hover:bg-white/[0.04]",
                      )}
                      style={{ height: ROW_H }}
                    />
                  )
                })}

                {/* Termin-Blöcke */}
                {evs
                  .filter((e) => e.time)
                  .map((e, i) => {
                    const [sh, sm] = e.time!.split(":").map(Number)
                    let eh = sh + 1
                    let em = sm
                    if (e.endTime) {
                      const [h2, m2] = e.endTime.split(":").map(Number)
                      eh = h2
                      em = m2
                    }
                    const top = (sh - START_HOUR + sm / 60) * ROW_H
                    const height = Math.max(((eh - sh) + (em - sm) / 60) * ROW_H - 3, 22)
                    if (top < 0) return null
                    return (
                      <div
                        key={e.id + i}
                        className="pointer-events-none absolute left-1 right-1 overflow-hidden rounded-lg border px-2 py-1"
                        style={{
                          top,
                          height,
                          backgroundColor: `${e.categoryColor}26`,
                          borderColor: `${e.categoryColor}55`,
                        }}
                      >
                        <div className="truncate text-[11px] font-semibold" style={{ color: e.categoryColor }}>
                          {e.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {e.time}{e.endTime ? `–${e.endTime}` : ""}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

/* ---------- Termin-Formular ---------- */

function AddForm({
  categories,
  onSave,
  onCancel,
  onManageCategories,
  defaultTime,
  defaultEnd,
  initialTitle,
  initialCategory,
  title: heading,
  submitLabel = "Speichern",
}: {
  categories: AppointmentCategoryDef[]
  onSave: (input: { title: string; category: AppointmentCategory; time?: string; endTime?: string }) => void
  onCancel: () => void
  onManageCategories: () => void
  defaultTime?: string
  defaultEnd?: string
  initialTitle?: string
  initialCategory?: AppointmentCategory
  title?: string
  submitLabel?: string
}) {
  const [title, setTitle] = useState(initialTitle ?? "")
  const [category, setCategory] = useState<AppointmentCategory>(initialCategory ?? categories[0]?.id ?? "termin")
  const [time, setTime] = useState(defaultTime ?? "")
  const [endTime, setEndTime] = useState(defaultEnd ?? "")

  return (
    <div className="space-y-3 border-b border-border bg-white/[0.02] p-4">
      {heading && <div className="text-xs font-semibold uppercase tracking-wider text-primary">{heading}</div>}
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel des Termins"
        className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((c) => {
          const sel = category === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="rounded-lg border px-2.5 py-1 text-xs font-medium transition-all"
              style={
                sel
                  ? { backgroundColor: `${c.color}26`, color: c.color, borderColor: c.color, boxShadow: `0 0 0 1px ${c.color}, 0 0 12px ${c.color}66` }
                  : { borderColor: "rgba(255,255,255,0.12)", color: "var(--muted-foreground)" }
              }
            >
              {c.label}
            </button>
          )
        })}
        <button
          onClick={onManageCategories}
          title="Kategorien verwalten"
          className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Tags className="h-3.5 w-3.5" /> Verwalten
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-[11px] text-muted-foreground">Von</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[11px] text-muted-foreground">Bis</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white/[0.03] px-3 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            if (!title.trim()) return
            onSave({ title: title.trim(), category, time: time || undefined, endTime: endTime || undefined })
          }}
        >
          {submitLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </div>
  )
}

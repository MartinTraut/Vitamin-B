"use client"

import { useMemo, useState } from "react"
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
import { Plus, Check, Trash2, ArrowRight, GripVertical, CalendarDays, Clock } from "lucide-react"
import { useStore } from "@/lib/store"
import {
  PEOPLE,
  PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type Priority,
  type Task,
  type TaskStatus,
} from "@/lib/types"
import { dateDE, formatMinutes } from "@/lib/format"
import { todayISO } from "@/lib/recurrence"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const COLUMNS: { status: TaskStatus; accent: string }[] = [
  { status: "todo", accent: "#9ca3af" },
  { status: "doing", accent: "#E39832" },
  { status: "done", accent: "#34d399" },
]

const PRIORITY_DOT: Record<Priority, string> = {
  high: "#ef4444",
  normal: "#E39832",
  low: "#9ca3af",
}

export function TasksView() {
  const { db, activePerson, addTask, updateTaskStatus, toggleTask, removeTask, reorderTasks, addTimeEntry } =
    useStore()
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("normal")
  const [projectId, setProjectId] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)

  const person = PEOPLE.find((p) => p.id === activePerson)!
  const myTasks = useMemo(
    () => db.tasks.filter((t) => t.person === activePerson),
    [db.tasks, activePerson],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeTask = activeId ? db.tasks.find((t) => t.id === activeId) ?? null : null

  function submit() {
    const value = title.trim()
    if (!value) return
    const project = db.projects.find((p) => p.id === projectId)
    addTask({
      person: activePerson,
      listId: db.lists[0]?.id ?? "l-orga",
      title: value,
      status: "todo",
      priority,
      projectId: projectId || undefined,
      customerId: project?.customerId,
    })
    setTitle("")
    setPriority("normal")
    setProjectId("")
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return

    const dragged = db.tasks.find((t) => t.id === active.id)
    if (!dragged) return

    const overId = String(over.id)
    const overTask = db.tasks.find((t) => t.id === overId)
    const targetStatus: TaskStatus | null = overTask
      ? overTask.status
      : overId === "todo" || overId === "doing" || overId === "done"
        ? (overId as TaskStatus)
        : null
    if (!targetStatus) return

    // Nichts geändert (gleiche Position, gleiche Spalte)
    if (overTask?.id === dragged.id) return

    const next = [...db.tasks]
    const fromIdx = next.findIndex((t) => t.id === dragged.id)
    next.splice(fromIdx, 1)
    const moved: Task = { ...dragged, status: targetStatus }

    let insertIdx: number
    if (overTask && overTask.id !== dragged.id) {
      insertIdx = next.findIndex((t) => t.id === overTask.id)
    } else {
      // Auf leere Spalte / Spaltenfläche gedroppt → ans Ende dieser Spalte (für diese Person)
      let last = -1
      next.forEach((t, i) => {
        if (t.status === targetStatus && t.person === dragged.person) last = i
      })
      insertIdx = last === -1 ? next.length : last + 1
    }
    next.splice(insertIdx, 0, moved)
    reorderTasks(next)
  }

  return (
    <div className="space-y-7">
      {/* Schnell-Erfassung */}
      <div className="glow-border rounded-2xl bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={`Neue Aufgabe für ${person.name}…`}
            className="h-12 flex-1 rounded-xl border border-border bg-white/[0.03] px-4 text-[15px] outline-none placeholder:text-muted-foreground/70 focus:border-primary/50"
          />
          {db.projects.length > 0 && (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-12 rounded-xl border border-border bg-white/[0.03] px-3 text-sm text-muted-foreground outline-none focus:border-primary/50 [color-scheme:dark]"
              title="Mit Projekt verknüpfen"
            >
              <option value="">Kein Projekt</option>
              {db.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {(["low", "normal", "high"] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  "h-12 flex-1 rounded-xl border px-3.5 text-sm font-medium transition-colors lg:flex-none",
                  priority === p
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                  style={{ backgroundColor: PRIORITY_DOT[p] }}
                />
                {PRIORITY_LABEL[p]}
              </button>
            ))}
            <Button onClick={submit} size="md" className="h-12 w-full px-5 text-sm sm:w-auto">
              <Plus className="h-4 w-4" /> Hinzufügen
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban-Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-1 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
          {COLUMNS.map((col) => {
            const items = myTasks.filter((t) => t.status === col.status)
            return (
              <Column key={col.status} status={col.status} accent={col.accent} count={items.length}>
                <SortableContext
                  items={items.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.length === 0 && (
                    <div
                      className="rounded-xl border border-dashed py-10 text-center text-sm"
                      style={{ borderColor: `${col.accent}2e`, color: `${col.accent}99` }}
                    >
                      Hierher ziehen
                    </div>
                  )}
                  {items.map((t) => (
                    <SortableTaskCard
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTask(t.id)}
                      onAdvance={() => updateTaskStatus(t.id, nextStatus(t.status))}
                      onRemove={() => removeTask(t.id)}
                      onLogTime={(minutes) => addTimeEntry({ person: t.person, taskId: t.id, projectId: t.projectId, minutes, date: todayISO() })}
                      projectName={db.projects.find((p) => p.id === t.projectId)?.name}
                    />
                  ))}
                </SortableContext>
              </Column>
            )
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
          {activeTask ? <TaskCardInner task={activeTask} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function nextStatus(s: TaskStatus): TaskStatus {
  return s === "todo" ? "doing" : s === "doing" ? "done" : "todo"
}

/* ---------- Spalte (Droppable) ---------- */

function Column({
  status,
  accent,
  count,
  children,
}: {
  status: TaskStatus
  accent: string
  count: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[46vh] w-[80vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border transition-colors sm:w-[60vw] lg:min-h-[62vh] lg:w-auto lg:shrink lg:snap-align-none"
      style={{
        borderColor: isOver ? `${accent}66` : `${accent}33`,
        backgroundColor: isOver ? `${accent}1a` : `${accent}0d`,
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3.5"
        style={{ borderColor: `${accent}26`, backgroundColor: `${accent}14` }}
      >
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-[15px] font-bold tracking-tight" style={{ color: accent }}>
            {TASK_STATUS_LABEL[status]}
          </span>
        </div>
        <span
          className="min-w-7 rounded-full px-2.5 py-1 text-center text-sm font-bold"
          style={{ backgroundColor: `${accent}24`, color: accent }}
        >
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-3 p-3.5">{children}</div>
    </div>
  )
}

/* ---------- Sortierbare Karte ---------- */

function SortableTaskCard({
  task,
  onToggle,
  onAdvance,
  onRemove,
  onLogTime,
  projectName,
}: {
  task: Task
  onToggle: () => void
  onAdvance: () => void
  onRemove: () => void
  onLogTime: (minutes: number) => void
  projectName?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }
  return (
    <div ref={setNodeRef} style={style}>
      <TaskCardInner
        task={task}
        onToggle={onToggle}
        onAdvance={onAdvance}
        onRemove={onRemove}
        onLogTime={onLogTime}
        projectName={projectName}
        handleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

/* ---------- Karten-Inhalt ---------- */

function TaskCardInner({
  task,
  onToggle,
  onAdvance,
  onRemove,
  onLogTime,
  projectName,
  handleProps,
  dragging,
}: {
  task: Task
  onToggle?: () => void
  onAdvance?: () => void
  onRemove?: () => void
  onLogTime?: (minutes: number) => void
  projectName?: string
  handleProps?: Record<string, unknown>
  dragging?: boolean
}) {
  const done = task.status === "done"
  const [logging, setLogging] = useState(false)
  const [minutesInput, setMinutesInput] = useState("15")
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-[#101010] p-4 transition-all",
        dragging
          ? "rotate-[1.5deg] border-primary/40 shadow-2xl shadow-black/60"
          : "hover:border-white/15 hover:bg-[#141414]",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag-Handle */}
        <button
          {...handleProps}
          className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing"
          title="Ziehen"
          aria-label="Aufgabe ziehen"
        >
          <GripVertical className="h-[18px] w-[18px]" />
        </button>

        {/* Check */}
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-colors",
            done
              ? "border-success bg-success/20 text-success"
              : "border-border text-transparent hover:border-primary",
          )}
          aria-label="Erledigt umschalten"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </button>

        {/* Inhalt */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[15px] font-medium leading-snug",
              done && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${PRIORITY_DOT[task.priority]}1f`,
                color: PRIORITY_DOT[task.priority],
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
              />
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.due && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2 py-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {dateDE(task.due)}
              </span>
            )}
            {projectName && (
              <span className="inline-flex items-center gap-1.5 truncate rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {projectName}
              </span>
            )}
            {!!task.trackedMinutes && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2 py-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatMinutes(task.trackedMinutes)}
              </span>
            )}
          </div>

          {logging && onLogTime && (
            <div className="mt-2.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                min={1}
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return
                  const n = Number(minutesInput)
                  if (n > 0) { onLogTime(n); setLogging(false); setMinutesInput("15") }
                }}
                className="h-8 w-20 rounded-md border border-border bg-white/[0.03] px-2 text-sm outline-none focus:border-primary/50"
                autoFocus
              />
              <span className="text-xs text-muted-foreground">Min.</span>
              <button
                onClick={() => {
                  const n = Number(minutesInput)
                  if (n > 0) { onLogTime(n); setLogging(false); setMinutesInput("15") }
                }}
                className="rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
              >
                Erfassen
              </button>
            </div>
          )}
        </div>

        {/* Aktionen */}
        {!dragging && (
          <div className="action-reveal flex shrink-0 items-center gap-1">
            {onLogTime && (
              <button
                onClick={() => setLogging((v) => !v)}
                title="Zeit erfassen"
                className={cn(
                  "rounded-md p-1.5 hover:bg-primary/15 hover:text-primary",
                  logging ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Clock className="h-4 w-4" />
              </button>
            )}
            {!done && onAdvance && (
              <button
                onClick={onAdvance}
                title="Status weiter"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/15 hover:text-primary"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                title="Löschen"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { Suspense } from "react"
import { TasksView } from "@/components/tasks/tasks-view"

export default function AufgabenPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Suspense>
        <TasksView />
      </Suspense>
    </div>
  )
}

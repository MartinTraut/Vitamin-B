import { Suspense } from "react"
import { CalendarView } from "@/components/calendar/calendar-view"

export default function KalenderPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Suspense>
        <CalendarView />
      </Suspense>
    </div>
  )
}

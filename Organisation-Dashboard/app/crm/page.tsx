import { Suspense } from "react"
import { CrmView } from "@/components/crm/crm-view"

export default function CrmPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Suspense>
        <CrmView />
      </Suspense>
    </div>
  )
}

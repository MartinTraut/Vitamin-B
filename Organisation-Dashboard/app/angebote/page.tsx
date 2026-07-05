import { Suspense } from "react"
import { DocumentsView } from "@/components/documents/documents-view"

export default function AngebotePage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Suspense>
        <DocumentsView kind="quote" />
      </Suspense>
    </div>
  )
}

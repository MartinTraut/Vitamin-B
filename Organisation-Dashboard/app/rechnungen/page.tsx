import { Suspense } from "react"
import { DocumentsView } from "@/components/documents/documents-view"

export default function RechnungenPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Suspense>
        <DocumentsView kind="invoice" />
      </Suspense>
    </div>
  )
}

import { Suspense } from "react"
import { PipelineView } from "@/components/pipeline/pipeline-view"

export default function PipelinePage() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Suspense>
        <PipelineView />
      </Suspense>
    </div>
  )
}

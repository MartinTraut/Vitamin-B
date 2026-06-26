import { GitBranch } from "lucide-react"
import { ComingSoon } from "@/components/shell/coming-soon"

export default function PipelinePage() {
  return (
    <ComingSoon
      icon={GitBranch}
      title="Pipeline"
      description="Anfragen und Aufträge per Drag-&-Drop durch die Phasen ziehen – von der ersten Anfrage bis zum gewonnenen Auftrag. Immer im Blick, was als Nächstes ansteht."
      phase="Phase 2"
    />
  )
}

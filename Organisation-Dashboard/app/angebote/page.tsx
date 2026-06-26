import { FileText } from "lucide-react"
import { ComingSoon } from "@/components/shell/coming-soon"

export default function AngebotePage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Angebote"
      description="Angebote per Vorlage erstellen – Autofolierung, Logo-Beklebung, Textildruck und mehr mit Positionen, Stundenlohn und Steuersatz. Mit einem Klick zur Rechnung."
      phase="Phase 3"
    />
  )
}

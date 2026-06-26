import { Receipt } from "lucide-react"
import { ComingSoon } from "@/components/shell/coming-soon"

export default function RechnungenPage() {
  return (
    <ComingSoon
      icon={Receipt}
      title="Rechnungen"
      description="Professionelle Rechnungen mit Firmenkopf, Positionen und USt-Aufschlüsselung. Status von Entwurf über versendet bis bezahlt – inklusive PDF-Export."
      phase="Phase 3"
    />
  )
}

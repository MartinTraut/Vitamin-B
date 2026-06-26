import { Users } from "lucide-react"
import { ComingSoon } from "@/components/shell/coming-soon"

export default function CrmPage() {
  return (
    <ComingSoon
      icon={Users}
      title="CRM & Kundenverwaltung"
      description="Alle Kunden, Kontaktdaten, Herkunft und Projekte an einem Ort. Bilder, PDFs und Dateien pro Projekt, Termine und Rechnungs-Historie direkt am Kunden."
      phase="Phase 2"
    />
  )
}

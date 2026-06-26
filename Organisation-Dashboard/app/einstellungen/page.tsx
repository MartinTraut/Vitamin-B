import { Settings } from "lucide-react"
import { ComingSoon } from "@/components/shell/coming-soon"

export default function EinstellungenPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Einstellungen"
      description="Team, Firmendaten, Steuer-ID, Bankverbindung und Nummernkreise für Angebote und Rechnungen. Plus Supabase-Anbindung für echtes Multi-User."
      phase="Phase 0/3"
    />
  )
}

import { Wallet } from "lucide-react"
import { ComingSoon } from "@/components/shell/coming-soon"

export default function FinanzenPage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="Finanzen & Buchhaltung"
      description="Einnahmen und Ausgaben kategorisiert erfassen, Auswertungen als Grafik, USt-Übersicht und Monatsabschluss. Volle Kontrolle über die Zahlen."
      phase="Phase 3"
    />
  )
}

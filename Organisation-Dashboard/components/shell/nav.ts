import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  PenTool,
  Users,
  GitBranch,
  FileText,
  Receipt,
  ReceiptText,
  Wallet,
  PiggyBank,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  subtitle: string
  icon: LucideIcon
  soon?: boolean
}

export interface NavGroup {
  label: string
  accent: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: "Übersicht",
    accent: "#E39832",
    items: [
      { href: "/", label: "Dashboard", subtitle: "Dein Tag auf einen Blick", icon: LayoutDashboard },
    ],
  },
  {
    label: "Organisation",
    accent: "#3b82f6",
    items: [
      { href: "/aufgaben", label: "Aufgaben", subtitle: "To-Dos & Listen", icon: CheckSquare },
      { href: "/kalender", label: "Kalender", subtitle: "Termine & Fristen", icon: Calendar },
      { href: "/whiteboard", label: "Whiteboard", subtitle: "Ideen & Mindmaps", icon: PenTool },
    ],
  },
  {
    label: "Kunden",
    accent: "#a855f7",
    items: [
      { href: "/crm", label: "CRM", subtitle: "Kunden & Projekte", icon: Users },
      { href: "/pipeline", label: "Pipeline", subtitle: "Anfragen & Deals", icon: GitBranch },
      { href: "/angebote", label: "Angebote", subtitle: "Angebote & Templates", icon: FileText },
    ],
  },
  {
    label: "Finanzen",
    accent: "#34d399",
    items: [
      { href: "/rechnungen", label: "Rechnungen", subtitle: "Rechnungsstellung", icon: Receipt },
      { href: "/ausgaben", label: "Belege", subtitle: "Belege & Eingangsrechnungen", icon: ReceiptText },
      { href: "/finanzen", label: "Finanzen", subtitle: "Einnahmen & Ausgaben", icon: Wallet },
      { href: "/privat", label: "Privat", subtitle: "Private Finanzen & Schulden", icon: PiggyBank },
    ],
  },
  {
    label: "System",
    accent: "#9ca3af",
    items: [
      { href: "/einstellungen", label: "Einstellungen", subtitle: "Team & Firma", icon: Settings },
    ],
  },
]

export const ALL_ITEMS: NavItem[] = NAV.flatMap((g) => g.items)

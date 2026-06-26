import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  PenTool,
  Users,
  GitBranch,
  FileText,
  Receipt,
  Wallet,
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
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: "Übersicht",
    items: [
      { href: "/", label: "Dashboard", subtitle: "Dein Tag auf einen Blick", icon: LayoutDashboard },
    ],
  },
  {
    label: "Organisation",
    items: [
      { href: "/aufgaben", label: "Aufgaben", subtitle: "To-Dos & Listen", icon: CheckSquare },
      { href: "/kalender", label: "Kalender", subtitle: "Termine & Fristen", icon: Calendar },
      { href: "/whiteboard", label: "Whiteboard", subtitle: "Ideen & Mindmaps", icon: PenTool, soon: true },
    ],
  },
  {
    label: "Kunden",
    items: [
      { href: "/crm", label: "CRM", subtitle: "Kunden & Projekte", icon: Users, soon: true },
      { href: "/pipeline", label: "Pipeline", subtitle: "Anfragen & Deals", icon: GitBranch, soon: true },
    ],
  },
  {
    label: "Finanzen",
    items: [
      { href: "/angebote", label: "Angebote", subtitle: "Angebote & Templates", icon: FileText, soon: true },
      { href: "/rechnungen", label: "Rechnungen", subtitle: "Rechnungsstellung", icon: Receipt, soon: true },
      { href: "/finanzen", label: "Finanzen", subtitle: "Einnahmen & Ausgaben", icon: Wallet, soon: true },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/einstellungen", label: "Einstellungen", subtitle: "Team & Firma", icon: Settings, soon: true },
    ],
  },
]

export const ALL_ITEMS: NavItem[] = NAV.flatMap((g) => g.items)

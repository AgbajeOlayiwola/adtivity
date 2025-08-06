import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
} from "lucide-react"

export interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  group?: string
  isActive?: (pathname: string) => boolean
}

export const mainNavLinks: NavLink[] = [
  {
    href: "/admin/dashboard",
    label: "KPI Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
    isActive: (pathname) =>
      pathname === "/dashboard" || pathname === "/dashboard/kpi",
  },
  {
    href: "/admin/anomalies",
    label: "Anomaly Alerts",
    icon: AlertTriangle,
    group: "Analytics",
  },
  {
    href: "/admin/forecasting",
    label: "Predictive Forecasting",
    icon: TrendingUp,
    group: "Analytics",
  },
  {
    href: "/admin/reports",
    label: "Custom Reports",
    icon: FileText,
    group: "Reporting",
  },
]

export const secondaryNavLinks: NavLink[] = [
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    href: "/", // Or a logout endpoint
    label: "Logout",
    icon: LogOut,
  },
]

export const groupedNavLinks = {
  Overview: mainNavLinks.filter((link) => link.group === "Overview"),
  Analytics: mainNavLinks.filter((link) => link.group === "Analytics"),
  Reporting: mainNavLinks.filter((link) => link.group === "Reporting"),
}

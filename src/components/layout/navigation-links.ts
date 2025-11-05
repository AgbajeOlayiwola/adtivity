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
    href: "/admin/twitter-analytics",
    label: "Twitter Analytics",
    icon: TrendingUp,
    group: "Analytics",
  },
  {
    href: "/admin/anomalies",
    label: "AI Analysis (Coming Soon)",
    icon: AlertTriangle,
    group: "Analytics",
  },
  // {
  //   href: "/admin/forecasting",
  //   label: "Predictive Forecasting (Coming Soon)",
  //   icon: TrendingUp,
  //   group: "Analytics",
  // },
  {
    href: "/admin/reports",
    label: "Custom Reports (Coming Soon)",
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

import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, LogOut, TrendingUp, Users, FolderKanban, BookOpen } from "lucide-react"

export interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  group?: string
  isActive?: (pathname: string) => boolean
}

// Top-level navigation (shown when no campaign is selected)
export const topLevelNavLinks: NavLink[] = [
  {
    href: "/admin/dashboard",
    label: "Campaigns",
    icon: FolderKanban,
    isActive: (pathname) => pathname === "/admin/dashboard",
  },
  {
    href: "/admin/teams",
    label: "Teams",
    icon: Users,
  },
]

// Campaign-specific navigation (shown when a campaign is selected)
export const campaignNavLinks: NavLink[] = [
  {
    href: "/admin/dashboard/company-info",
    label: "KPI Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
    isActive: (pathname) =>
      pathname.includes("/company-info") || pathname === "/dashboard/kpi",
  },
  {
    href: "/admin/twitter-analytics",
    label: "Twitter Analytics",
    icon: TrendingUp,
    group: "Analytics",
  },
  // {
  //   href: "/admin/anomalies",
  //   label: "AI Analysis (Coming Soon)",
  //   icon: AlertTriangle,
  //   group: "Analytics",
  // },
  // {
  //   href: "/admin/forecasting",
  //   label: "Predictive Forecasting (Coming Soon)",
  //   icon: TrendingUp,
  //   group: "Analytics",
  // },
  // {
  //   href: "/admin/reports",
  //   label: "Custom Reports (Coming Soon)",
  //   icon: FileText,
  //   group: "Reporting",
  // },
]

export const secondaryNavLinks: NavLink[] = [
  {
    href: "/admin/docs",
    label: "Documentation",
    icon: BookOpen,
  },
  // {
  //   href: "/admin/settings",
  //   label: "Settings",
  //   icon: Settings,
  // },
  {
    href: "/", // Or a logout endpoint
    label: "Logout",
    icon: LogOut,
  },
]

export const groupedCampaignNavLinks = {
  Overview: campaignNavLinks.filter((link) => link.group === "Overview"),
  Analytics: campaignNavLinks.filter((link) => link.group === "Analytics"),
  Reporting: campaignNavLinks.filter((link) => link.group === "Reporting"),
}

// Keep for backward compatibility
export const mainNavLinks = topLevelNavLinks
export const groupedNavLinks = {
  Overview: topLevelNavLinks.filter((link) => link.group === "Overview"),
  Analytics: topLevelNavLinks.filter((link) => link.group === "Analytics"),
  Reporting: topLevelNavLinks.filter((link) => link.group === "Reporting"),
}

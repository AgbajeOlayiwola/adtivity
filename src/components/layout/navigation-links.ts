import { LayoutDashboard, AlertTriangle, TrendingUp, FileText, Settings, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: string;
  isActive?: (pathname: string) => boolean;
}

export const mainNavLinks: NavLink[] = [
  {
    href: '/dashboard',
    label: 'KPI Dashboard',
    icon: LayoutDashboard,
    group: 'Overview',
    isActive: (pathname) => pathname === '/dashboard' || pathname === '/dashboard/kpi',
  },
  {
    href: '/dashboard/anomalies',
    label: 'Anomaly Alerts',
    icon: AlertTriangle,
    group: 'Analytics',
  },
  {
    href: '/dashboard/forecasting',
    label: 'Predictive Forecasting',
    icon: TrendingUp,
    group: 'Analytics',
  },
  {
    href: '/dashboard/reports',
    label: 'Custom Reports',
    icon: FileText,
    group: 'Reporting',
  },
];

export const secondaryNavLinks: NavLink[] = [
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
  {
    href: '/', // Or a logout endpoint
    label: 'Logout',
    icon: LogOut,
  },
];

export const groupedNavLinks = {
  Overview: mainNavLinks.filter(link => link.group === 'Overview'),
  Analytics: mainNavLinks.filter(link => link.group === 'Analytics'),
  Reporting: mainNavLinks.filter(link => link.group === 'Reporting'),
};

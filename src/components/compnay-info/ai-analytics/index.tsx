// components/analytics/AIAnalytics.tsx
"use client"

import { ChevronDown } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setAnalyticsData } from "@/redux/slices/abalyticsDataSlice"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"

export type AiDataOption =
  | "pageViews"
  | "clicks"
  | "usersPerDay"
  | "regional"
  | "web3Events"
  | "wallets"
  | "rawEvents"

export type AIAnalyticsDatasets = {
  pageViews?: Array<{ date: string; views: number }>
  clicks?: Array<{ date: string; clicks: number }>
  usersPerDay?: {
    users_per_day: Array<{ day: string; users: number }>
    total_unique_users: number
  }
  regional?: any[]
  web3Events?: any[]
  wallets?: any[]
  rawEvents?: any[]
}

export type AIAnalyticsFilters = {
  selectedButton?: string
  selectedPage?: string
  selectedCountry?: string
}

export type AIAnalyticsTimeRange = {
  startDate: string | null
  endDate: string | null
}

export type AIAnalyticsProps = {
  /** Company / tenant id for traceability */
  companyId?: string | null
  /** Time range */
  timeRange: AIAnalyticsTimeRange
  /** Current UI filters (page, button, country, etc.) */
  filters?: AIAnalyticsFilters

  /** Available datasets (pass only what you have) */
  datasets?: AIAnalyticsDatasets

  /** Which menu items to show (keys) — defaults to all known keys  */
  visibleOptions?: AiDataOption[]

  /** Initial checked options */
  defaultSelected?: Partial<Record<AiDataOption, boolean>>

  /** Label text in the dropdown */
  menuLabel?: string

  /** Where to open the analytics page; defaults to `/ai-analytics` */
  analyticsPath?: string

  /**
   * If you’d like to intercept the payload before navigation,
   * return false to stop navigation, or mutate/forward it.
   */
  onBeforeOpen?: (payload: any) => boolean | void

  /** Button text (next to dropdown) */
  actionText?: string

  /** Button variant; defaults to "default" */
  actionVariant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost"
    | "link"
}

const DEFAULT_VISIBLE: AiDataOption[] = [
  "pageViews",
  "clicks",
  "usersPerDay",
  "regional",
  "web3Events",
  "wallets",
  "rawEvents",
]

const LABELS: Record<AiDataOption, string> = {
  pageViews: "Daily Page Views",
  clicks: "Daily Button Clicks",
  usersPerDay: "Unique Users (per day)",
  regional: "Regional Data",
  web3Events: "Web3 Events",
  wallets: "Connected Wallets",
  rawEvents: "Raw Events (web2 + web3)",
}

export default function AIAnalytics({
  companyId = null,
  timeRange,
  filters,
  datasets,
  visibleOptions = DEFAULT_VISIBLE,
  defaultSelected,
  menuLabel = "Select data to analyze",
  analyticsPath = "/admin/dashboard/ai-analytics",
  onBeforeOpen,
  actionText = "Open AI Analytics",
  actionVariant = "default",
}: AIAnalyticsProps) {
  const [selection, setSelection] = React.useState<
    Record<AiDataOption, boolean>
  >(() => {
    // Default: off unless explicitly defined in defaultSelected
    const base: Record<AiDataOption, boolean> = {
      pageViews: false,
      clicks: false,
      usersPerDay: false,
      regional: false,
      web3Events: false,
      wallets: false,
      rawEvents: false,
    }
    for (const k in defaultSelected || {}) {
      const key = k as AiDataOption
      base[key] = !!defaultSelected?.[key]
    }
    return base
  })
  const navigate = useRouter()
  const dispatch = useDispatch()
  // Keep the dropdown OPEN while selecting items; only close on outside click or Escape
  const [open, setOpen] = React.useState(false)

  const hasAny = React.useMemo(
    () => Object.values(selection).some(Boolean),
    [selection]
  )

  const toggle = (key: AiDataOption) =>
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleToggleAndStick = (key: AiDataOption) => {
    toggle(key)
    // Radix will try to close after item interaction; reopen next frame
    requestAnimationFrame(() => setOpen(true))
  }

  const compact = (obj: Record<string, any>) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))

  const buildPayload = React.useCallback(() => {
    const selectedKeys = Object.entries(selection)
      .filter(([, v]) => v)
      .map(([k]) => k as AiDataOption)

    const ds = datasets || {}

    const payload = {
      companyId: companyId ?? null,
      timeRange,
      filters: filters ?? {},
      selected: selectedKeys,
      datasets: compact({
        pageViews: selection.pageViews ? ds.pageViews : undefined,
        clicks: selection.clicks ? ds.clicks : undefined,
        usersPerDay: selection.usersPerDay ? ds.usersPerDay : undefined,
        regional: selection.regional ? ds.regional : undefined,
        web3Events: selection.web3Events ? ds.web3Events : undefined,
        wallets: selection.wallets ? ds.wallets : undefined,
        rawEvents: selection.rawEvents ? ds.rawEvents : undefined,
      }),
      meta: { createdAt: new Date().toISOString() },
    }

    return payload
  }, [selection, datasets, companyId, timeRange, filters])

  const openAnalytics = () => {
    const payload = buildPayload()

    if (onBeforeOpen) {
      const maybe = onBeforeOpen(payload)
      if (maybe === false) return
    }

    try {
      localStorage.setItem("ai_analytics_payload", JSON.stringify(payload))
    } catch (e) {
      console.warn("Unable to write to localStorage", e)
    }
    dispatch(setAnalyticsData(payload))

    const qs = new URLSearchParams({
      selected: (payload.selected || []).join(","),
      startDate: payload.timeRange.startDate ?? "",
      endDate: payload.timeRange.endDate ?? "",
      src: "localStorage",
    }).toString()

    // window.open(`${analyticsPath}?${qs}`)
    navigate.push(`/admin/dashboard/ai-analytics`)
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="cursor-target">
            AI Analytics
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64"
          // Close only on outside click or Escape
          onInteractOutside={() => setOpen(false)}
          onEscapeKeyDown={() => setOpen(false)}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {visibleOptions.map((key) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={!!selection[key]}
              // Keep menu open on selection
              onCheckedChange={() => handleToggleAndStick(key)}
            >
              {LABELS[key]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        className="cursor-target"
        onClick={() => {
          openAnalytics()
          window.location.href = "/admin/dashboard/ai-analytics"
        }}
        variant={actionVariant}
        disabled={!hasAny}
        title={
          hasAny
            ? "Open /ai-analytics with selected data"
            : "Pick at least one dataset"
        }
      >
        {actionText}
      </Button>
    </div>
  )
}

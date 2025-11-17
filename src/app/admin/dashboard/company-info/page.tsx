"use client"

import KpiCard from "@/components/dashboard/kpi-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {
  Calendar as CalendarIcon,
  Eye,
  Hash,
  RefreshCcw,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Date picker components
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"

import RegionalHeatmap from "@/components/compnay-info/heatMap"
import WalletActivityModal from "@/components/compnay-info/wallet/activity"
import WalletModal from "@/components/compnay-info/wallet/add-wallet"
import { Modal } from "@/components/modal"
import { useDeleteClientCompanyMutation } from "@/redux/api/mutationApi"
import {
  useCompanyDataQuery,
  useCompanyWeb3EventsQuery,
  useConnectedWalletsQuery,
  useGetRegionalDataQuery,
  useGetUniqueSessionsQuery,
  useNewUsersAnalyticsQuery,
  useUserEngagementTimeSeriesQuery,
} from "@/redux/api/queryApi"
import { useRouter } from "next/navigation"

// Reusable AI analytics launcher

// Growth image (shareable)
import AIAnalytics from "@/components/compnay-info/ai-analytics"
import GrowthImage from "@/components/compnay-info/growth-image"
import * as React from "react"

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  views: { label: "Page Views", color: "hsl(var(--accent))" },
  clicks: { label: "Clicks", color: "hsl(var(--purple-500))" },
}

// ------------------------------------------------------------
// StickySelect: keeps the dropdown open during selection
// ------------------------------------------------------------

type StickySelectProps = {
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  triggerClassName?: string
  contentClassName?: string
  children: React.ReactNode
}

function StickySelect({
  value,
  onValueChange,
  placeholder,
  triggerClassName,
  contentClassName,
  children,
}: StickySelectProps) {
  const [open, setOpen] = useState(false)

  const handleValueChange = (v: string) => {
    onValueChange(v)
    // Radix closes on select by default; reopen on next frame
    requestAnimationFrame(() => setOpen(true))
  }

  return (
    <Select
      value={value}
      open={open}
      onOpenChange={setOpen}
      onValueChange={handleValueChange}
    >
      <SelectTrigger
        className={cn("cursor-target w-[180px]", triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {children}
      </SelectContent>
    </Select>
  )
}

// ------------------------------------------------------------
// Helper types & utils
// ------------------------------------------------------------

type WalletConn = {
  wallet_address: string
  wallet_type: string
  network: string
  wallet_name: string
  id: string
  company_id: string
  is_active: boolean
  is_verified: boolean
  verification_method: string | null
  verification_timestamp: string | null
  created_at: string
  last_activity: string | null
}

type Txn = {
  transaction_hash: string
  block_number: number
  transaction_type: string
  from_address: string
  to_address: string
  token_address: string
  token_symbol: string
  token_name: string
  amount: string
  amount_usd: string
  gas_used: number
  gas_price: string
  gas_fee_usd: string
  network: string
  status: "confirmed" | "failed" | string
  timestamp: string
  transaction_metadata: Record<string, any>
  id: string
  wallet_connection_id: string
  created_at: string
}

type WalletAnalytics = {
  wallet_address: string
  total_transactions: number
  total_volume_usd: string
  unique_tokens: number
  networks: string[]
  transaction_types: Record<string, number>
  daily_activity: any[]
  top_tokens: any[]
  gas_spent_usd: string
  first_transaction: string
  last_transaction: string
}

const truncate = (v: string, left = 6, right = 4) =>
  v && v.length > left + right ? `${v.slice(0, left)}…${v.slice(-right)}` : v

const networkBadgeColor: Record<string, string> = {
  ethereum: "bg-purple-500/10 text-purple-500",
  polygon: "bg-fuchsia-500/10 text-fuchsia-500",
  solana: "bg-emerald-500/10 text-emerald-500",
  bsc: "bg-yellow-500/10 text-yellow-500",
  arbitrum: "bg-sky-500/10 text-sky-500",
  base: "bg-blue-500/10 text-blue-500",
  optimism: "bg-rose-500/10 text-rose-500",
}

export default function KpiDashboardPage() {
  const router = useRouter()
  const [rawEvents, setRawEvents] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState({
    uniqueSessions: 0,
    uniqueButtonNames: [] as string[],
    uniqueLinkNames: [] as string[],
    uniquePagePaths: [] as string[],
    uniquePageEventNames: [] as string[],
  })
  const [clickType, setClickType] = useState<"buttons" | "links">("buttons") // Default to buttons
  const [selectedButton, setSelectedButton] = useState("All Clicks")
  const [selectedLink, setSelectedLink] = useState("All Links")
  const [selectedPage, setSelectedPage] = useState("All Pages")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeleteCampaignModal, setShowDeleteCampaignModal] = useState(false)
  const [showWeb3Modal, setShowWeb3odal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [isWeb3Added, setIsWeb3Added] = useState(false)

  const [startDate, setStartDate] = useState<Date | string | null>("2025-01-01")
  const [endDate, setEndDate] = useState<Date | string | null>(null)

  const [selectedCountry, setSelectedCountry] = useState("World View")

  const { documents, apikey }: any = useSelector((store) => store)

  const [deleteClientCompany, { isLoading: isDeleting }] = useDeleteClientCompanyMutation()

  const {
    data: web2Events,
    isLoading: isWeb2Loading,
    isSuccess: isWeb2Success,
    isError: isWeb2Error,
    error: web2Error,
  } = useCompanyDataQuery({ id: documents?.id, startDate, endDate })

  const {
    data: web3EventsRaw,
    isLoading: isWeb3Loading,
    isSuccess: isWeb3Success,
    isError: isWeb3Error,
    error: web3Error,
  } = useCompanyWeb3EventsQuery({ id: documents?.id, startDate, endDate })

  const {
    data: getRegionalData,
    isLoading: getRegionalDataLoading,
    isSuccess: getRegionalDataSuccess,
    isError: getRegionalDataIsError,
    error: getRegionalDataError,
  } = useGetRegionalDataQuery({
    id: documents?.id,
    start_date: startDate,
    endDate,
  })

  const {
    data: connectedWalletsData,
    refetch: refetchConnectedWallets,
    isLoading: connectedWalletsDataLoading,
    isSuccess: connectedWalletsDataSuccess,
    isError: connectedWalletsDataIsError,
    error: connectedWalletsDataError,
  } = useConnectedWalletsQuery({ id: documents?.id, isActive: true })

  const {
    data: getUniqueSessionsData = { users_per_day: [], total_unique_users: 0 },
    isLoading: getUniqueSessionsLoading,
    isSuccess: getUniqueSessionsSuccess,
    isError: getUniqueSessionsIsError,
    error: getUniqueSessionsError,
  } = useGetUniqueSessionsQuery({
    id: documents?.id,
    start_date: startDate,
    endDate,
  }) as {
    data: {
      users_per_day: Array<{ day: string; users: number }>
      total_unique_users: number
    }
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    error: any
  }

  // User engagement filters - MUST be declared before the query hook that uses them
  const [engagementTimeRange, setEngagementTimeRange] = useState("1week")
  const [engagementInterval, setEngagementInterval] = useState<number>(24) // 24 hours = daily
  const [engagementStartDate, setEngagementStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  )
  const [engagementEndDate, setEngagementEndDate] = useState<Date | null>(
    new Date()
  )
  const [showDAU, setShowDAU] = useState(true)
  const [showWAU, setShowWAU] = useState(true)
  const [showNewUsers, setShowNewUsers] = useState(true)
  const [showSessions, setShowSessions] = useState(true)
  const [showCohortAnalysis, setShowCohortAnalysis] = useState(true)
  const [showNewUsersModal, setShowNewUsersModal] = useState(false)

  // Handle time range preset changes
  const handleEngagementTimeRangeChange = (range: string) => {
    setEngagementTimeRange(range)
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case "1week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "2weeks":
        startDate = new Date(now.setDate(now.getDate() - 14))
        break
      case "3weeks":
        startDate = new Date(now.setDate(now.getDate() - 21))
        break
      case "1month":
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "3months":
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case "6months":
        startDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case "1year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      case "custom":
        return // Don't update dates for custom range
    }

    setEngagementStartDate(startDate)
    setEngagementEndDate(new Date())
  }

  // User engagement time series query (DAU/WAU)
  const {
    data: userEngagementData,
    isLoading: userEngagementLoading,
    isError: userEngagementError,
    error: userEngagementErrorData,
  }: any = useUserEngagementTimeSeriesQuery(
    {
      companyId: documents?.id,
      startDate: engagementStartDate
        ? engagementStartDate.toISOString().split("T")[0]
        : new Date(new Date().setDate(new Date().getDate() - 7))
            .toISOString()
            .split("T")[0],
      endDate: engagementEndDate
        ? engagementEndDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      intervalHours: engagementInterval,
    },
    {
      skip: !documents?.id,
    }
  )

  // New users detailed analytics query
  const {
    data: newUsersData,
    isLoading: newUsersLoading,
    isError: newUsersError,
  }: any = useNewUsersAnalyticsQuery(
    {
      companyId: documents?.id,
      startDate: engagementStartDate
        ? engagementStartDate.toISOString().split("T")[0]
        : new Date(new Date().setDate(new Date().getDate() - 7))
            .toISOString()
            .split("T")[0],
      endDate: engagementEndDate
        ? engagementEndDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
    {
      skip: !documents?.id || !showNewUsersModal,
    }
  )

  const [analyticsDataI, setAnalyticsDataI] = useState<any>({
    uniqueSessions: 0,
    uniqueButtonNames: [],
    uniquePagePaths: [],
    uniquePageEventNames: [],
    usersPerDayChartData: [],
  })

  const [selectedDay, setSelectedDay] = useState("All Days")

  useEffect(() => {
    if (getUniqueSessionsSuccess && getUniqueSessionsData) {
      const usersByDay = getUniqueSessionsData.users_per_day.map((entry) => ({
        day: entry.day,
        users: entry.users,
      }))
      setAnalyticsDataI((prev: any) => ({
        ...prev,
        uniqueSessions: getUniqueSessionsData.total_unique_users,
        usersPerDayChartData: usersByDay,
      }))
    }
  }, [getUniqueSessionsSuccess, getUniqueSessionsData])

  const web3Events = Array.isArray(web3EventsRaw) ? web3EventsRaw : []

  useEffect(() => {
    if (isWeb2Success && isWeb3Success) {
      const combinedEvents = [
        ...(Array.isArray(web2Events) ? web2Events : []),
        ...(Array.isArray(web3Events) ? web3Events : []),
      ]
      setRawEvents(combinedEvents)
      const processedData: any = calculateDashboardMetrics(combinedEvents)
      setAnalyticsData(processedData)
      setSelectedButton("All Clicks")
      setSelectedPage("All Pages")
    } else if (isWeb2Error || isWeb3Error) {
      console.error("Failed to fetch analytics data:", web2Error || web3Error)
    }
  }, [
    isWeb2Success,
    isWeb3Success,
    web2Events,
    web3Events,
    isWeb2Error,
    isWeb3Error,
    web2Error,
    web3Error,
  ])

  const calculateDashboardMetrics = (events: any[]) => {
    const sessions = new Set<string>()
    const heroClicks = events.filter(
      (event: any) =>
        event.event_name.startsWith("Hero:") ||
        event.event_name.startsWith("Button:")
    )
    const uniqueButtonNames = [
      "All Clicks",
      ...new Set(heroClicks.map((event: any) => event.event_name)),
    ]

    const linkClicks = events.filter(
      (event: any) =>
        event.event_name.startsWith("Link:") ||
        event.event_name === "Link Clicked"
    )
    const uniqueLinkNames = [
      "All Links",
      ...new Set(linkClicks.map((event: any) => event.event_name)),
    ]

    const pageEvents = events.filter(
      (event: any) =>
        event.event_name === "Page Viewed" || event.event_name === "Page Loaded"
    )

    const uniquePageEventNames = [
      "All Page Events",
      ...new Set(pageEvents.map((event: any) => event.event_name)),
    ]

    const uniquePagePaths = [
      "All Pages",
      ...new Set(pageEvents.map((event: any) => event.properties?.path)),
    ]

    events.forEach((event: any) => {
      if (event.properties?.sessionId) {
        sessions.add(event.properties.sessionId)
      }
    })

    return {
      heroClicks,
      linkClicks,
      uniqueSessions: sessions.size,
      uniqueButtonNames,
      uniqueLinkNames,
      uniquePagePaths,
      uniquePageEventNames,
    }
  }

  const totalHeroClicks = useMemo(() => {
    if (!rawEvents.length) return 0
    const filteredClicks = rawEvents.filter((event: any) => {
      if (clickType === "buttons") {
        if (selectedButton === "All Clicks") {
          return (
            event.event_name.startsWith("Button:") ||
            event.event_name.startsWith("Hero:")
          )
        }
        return event.event_name === selectedButton
      } else {
        // links
        if (selectedLink === "All Links") {
          return (
            event.event_name.startsWith("Link:") ||
            event.event_name === "Link Clicked"
          )
        }
        return event.event_name === selectedLink
      }
    })
    return filteredClicks.length
  }, [rawEvents, clickType, selectedButton, selectedLink])

  const totalPageViews = useMemo(() => {
    if (!rawEvents.length) return 0
    return rawEvents.filter(
      (event: any) =>
        (event.event_name === "Page Viewed" ||
          event.event_name === "Page Loaded") &&
        (selectedPage === "All Pages" ||
          event.properties?.path === selectedPage)
    ).length
  }, [rawEvents, selectedPage])

  const pageViewsChartData = useMemo(() => {
    if (!rawEvents.length) return [] as any[]
    const dailyPageViews = rawEvents
      .filter(
        (event: any) =>
          (event.event_name === "Page Viewed" ||
            event.event_name === "Page Loaded") &&
          (selectedPage === "All Pages" ||
            event.properties?.path === selectedPage)
      )
      .reduce((acc: any, event: any) => {
        const date = new Date(event.timestamp).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        })
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})
    return Object.entries(dailyPageViews).map(([date, views]) => ({
      date,
      views,
    }))
  }, [rawEvents, selectedPage])

  const clicksChartData = useMemo(() => {
    if (!rawEvents.length) return [] as any[]
    const dailyClicks = rawEvents
      .filter((event: any) => {
        if (clickType === "buttons") {
          return (
            (selectedButton === "All Clicks" &&
              (event.event_name.startsWith("Button:") ||
                event.event_name.startsWith("Hero:"))) ||
            event.event_name === selectedButton
          )
        } else {
          // links
          return (
            (selectedLink === "All Links" &&
              (event.event_name.startsWith("Link:") ||
                event.event_name === "Link Clicked")) ||
            event.event_name === selectedLink
          )
        }
      })
      .reduce((acc: any, event: any) => {
        const date = new Date(event.timestamp).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        })
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})
    return Object.entries(dailyClicks).map(([date, clicks]) => ({
      date,
      clicks,
    }))
  }, [rawEvents, clickType, selectedButton, selectedLink])

  const web3Kpis = useMemo(() => {
    if (!Array.isArray(web3Events) || web3Events.length === 0) {
      return {
        totalTokenTransfers: 0,
        activeWallets: 0,
        transactionVolume: 0,
        tokenSymbol: "N/A",
      }
    }
    const tokenTransfers = web3Events.filter(
      (event: any) => event.event_name === "Token Transferred"
    )
    const uniqueWallets = new Set(
      tokenTransfers.map((event: any) => event.properties?.wallet_address)
    )
    const now = new Date()
    const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000
    let totalVolume = 0
    let tokenSymbol = ""

    tokenTransfers.forEach((event: any) => {
      const eventTimestamp = new Date(event.timestamp).getTime()
      if (eventTimestamp > oneDayAgo) {
        totalVolume += event.properties?.amount || 0
        if (!tokenSymbol) tokenSymbol = event.properties?.token_symbol || ""
      }
    })
    return {
      totalTokenTransfers: tokenTransfers.length,
      activeWallets: uniqueWallets.size,
      transactionVolume: totalVolume,
      tokenSymbol,
    }
  }, [web3Events])

  const kpiData = [
    {
      title: "Conversion Rate",
      value: "N/A",
      icon: TrendingUp,
      iconColorClass: "text-yellow-500",
    },
  ]

  const isLoading = isWeb2Loading || isWeb3Loading || getRegionalDataLoading
  const error = isWeb2Error
    ? web2Error
    : isWeb3Error
    ? web3Error
    : getRegionalDataIsError
    ? getRegionalDataError
    : null

  const regionalData: any[] =
    getRegionalData &&
    typeof getRegionalData === "object" &&
    "regions" in getRegionalData
      ? (getRegionalData.regions as any[])
      : []

  const uniqueCountries = useMemo(() => {
    const countriesMap: { [key: string]: number } = {}
    const isoToCountryNameMap: { [key: string]: string } = {
      GB: "United Kingdom",
      NG: "Nigeria",
      US: "United States of America",
      CA: "Canada",
      AU: "Australia",
      DE: "Germany",
      FR: "France",
      JP: "Japan",
      CN: "China",
      IN: "India",
      BR: "Brazil",
      RU: "Russia",
    }

    regionalData.forEach((item: any) => {
      const countryName = isoToCountryNameMap[item.country] || item.country
      countriesMap[countryName] =
        (countriesMap[countryName] || 0) + item.event_count
    })

    const sortedCountries = Object.keys(countriesMap).sort()
    return ["World View", ...sortedCountries]
  }, [regionalData])

  const handleDeleteEvents = () => {
    console.log("Deleting all events…")
    setShowDeleteModal(false)
  }

  const handleRegenerateApiKey = () => {
    console.log("Regenerating API key…")
    setShowRegenerateModal(false)
  }

  const handleDeleteCampaign = async () => {
    try {
      await deleteClientCompany({ companyId: documents?.id }).unwrap()
      setShowDeleteCampaignModal(false)
      // Navigate back to dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Failed to delete campaign:", error)
      // Keep modal open to show error
      alert("Failed to delete campaign. Please try again.")
    }
  }

  // -------------------------------------------
  // Wallets grid + modal state
  // -------------------------------------------
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletConn | null>(null)

  const openWalletModal = (wallet: WalletConn) => {
    setSelectedWallet(wallet)
    setWalletModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading analytics dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardContent className="mt-4">
            <p>An error occurred: {JSON.stringify(error)}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Confirm modals */}
      <Modal
        isOpen={showDeleteModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete all historical events? This action cannot be undone."
        onConfirm={handleDeleteEvents}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Delete"
      />
      <Modal
        isOpen={showRegenerateModal}
        title="Regenerate API Key"
        message="Are you sure you want to regenerate the API key? The old key will become invalid."
        onConfirm={handleRegenerateApiKey}
        onCancel={() => setShowRegenerateModal(false)}
        confirmText="Regenerate"
      />
      <Modal
        isOpen={showDeleteCampaignModal}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone and will remove all associated data."
        onConfirm={handleDeleteCampaign}
        onCancel={() => setShowDeleteCampaignModal(false)}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
      />

      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          Business Overview
        </h1>

        {/* Top actions row */}
        <div className="rounded-xl px-3 py-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-[#fff] text-[17px]">
              Keep this key safe: {apikey?.apiKey}
            </p>

            {/* Reusable AI Analytics launcher */}
            <AIAnalytics
              companyId={documents?.id ?? null}
              timeRange={{
                startDate: startDate ? String(startDate) : null,
                endDate: endDate ? String(endDate) : null,
              }}
              filters={{
                selectedButton,
                selectedPage,
                selectedCountry,
              }}
              datasets={{
                pageViews: pageViewsChartData,
                clicks: clicksChartData,
                usersPerDay: getUniqueSessionsData,
                regional: regionalData,
                web3Events: Array.isArray(web3Events) ? web3Events : [],
                wallets: Array.isArray(connectedWalletsData)
                  ? (connectedWalletsData as any[])
                  : [],
                rawEvents,
              }}
              visibleOptions={[
                "pageViews",
                "clicks",
                "usersPerDay",
                "regional",
                "wallets",
                "rawEvents",
              ]}
              defaultSelected={{
                pageViews: true,
                clicks: true,
              }}
              onBeforeOpen={(payload) => {
                // Optional: inspect/mutate or abort (return false to stop)
                console.log("AI analytics payload:", payload)
              }}
            />

            {/* Maintenance buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => setShowRegenerateModal(true)}
                className="cursor-target text-purple-500 hover:text-purple-600 border-purple-500"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="destructive"
                className="cursor-target"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Events
              </Button>
              <Button
                variant="destructive"
                className="cursor-target bg-red-600 hover:bg-red-700"
                onClick={() => setShowDeleteCampaignModal(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Campaign"}
              </Button>
            </div>
          </div>
        </div>

        {/* User Engagement Analytics Section */}
        <Card className="mt-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl border border-gray-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-white">
                  User Engagement Analytics
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Daily and Weekly Active Users over time
                </CardDescription>
              </div>
              {userEngagementLoading && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters Section */}
            <div className="mb-6 space-y-4">
              {/* Time Range and Interval Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Time Range Presets */}
                <div className="flex-1">
                  <label className="text-sm text-gray-400 font-medium mb-2 block">
                    Time Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "1week", label: "1 Week" },
                      { value: "2weeks", label: "2 Weeks" },
                      { value: "3weeks", label: "3 Weeks" },
                      { value: "1month", label: "1 Month" },
                      { value: "3months", label: "3 Months" },
                      { value: "6months", label: "6 Months" },
                      { value: "1year", label: "1 Year" },
                      { value: "custom", label: "Custom" },
                    ].map((range) => (
                      <button
                        key={range.value}
                        onClick={() =>
                          handleEngagementTimeRangeChange(range.value)
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          engagementTimeRange === range.value
                            ? "bg-primary text-white"
                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interval Selection */}
                <div className="w-full md:w-64">
                  <label className="text-sm text-gray-400 font-medium mb-2 block">
                    Data Interval
                  </label>
                  <Select
                    value={String(engagementInterval)}
                    onValueChange={(value) =>
                      setEngagementInterval(Number(value))
                    }
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        <div className="flex flex-col">
                          <span className="font-medium">Hourly</span>
                          <span className="text-xs text-gray-400">
                            Data points every hour
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="6">
                        <div className="flex flex-col">
                          <span className="font-medium">6 Hours</span>
                          <span className="text-xs text-gray-400">
                            Data points every 6 hours
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="12">
                        <div className="flex flex-col">
                          <span className="font-medium">12 Hours</span>
                          <span className="text-xs text-gray-400">
                            Data points every 12 hours
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="24">
                        <div className="flex flex-col">
                          <span className="font-medium">Daily</span>
                          <span className="text-xs text-gray-400">
                            Data points every 24 hours
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Pickers (for custom range) */}
              {engagementTimeRange === "custom" && (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 font-medium mb-2 block">
                      Start Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50",
                            !engagementStartDate && "text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {engagementStartDate ? (
                            format(engagementStartDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={engagementStartDate || undefined}
                          onSelect={(date) => setEngagementStartDate(date || null)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm text-gray-400 font-medium mb-2 block">
                      End Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50",
                            !engagementEndDate && "text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {engagementEndDate ? (
                            format(engagementEndDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={engagementEndDate || undefined}
                          onSelect={(date) => setEngagementEndDate(date || null)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Metric Toggle Filters */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">
                  Display Metrics
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowDAU(!showDAU)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      showDAU
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/50"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        showDAU ? "bg-purple-500" : "bg-gray-500"
                      }`}
                    ></div>
                    Daily Active Users
                  </button>
                  <button
                    onClick={() => setShowWAU(!showWAU)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      showWAU
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/50"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        showWAU ? "bg-blue-500" : "bg-gray-500"
                      }`}
                    ></div>
                    Weekly Active Users
                  </button>
                  <button
                    onClick={() => setShowNewUsers(!showNewUsers)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      showNewUsers
                        ? "bg-green-500/20 text-green-300 border border-green-500/50"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/50"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        showNewUsers ? "bg-green-500" : "bg-gray-500"
                      }`}
                    ></div>
                    New Users
                  </button>
                  <button
                    onClick={() => setShowSessions(!showSessions)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      showSessions
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/50"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        showSessions ? "bg-amber-500" : "bg-gray-500"
                      }`}
                    ></div>
                    Total Sessions
                  </button>
                  <button
                    onClick={() => setShowCohortAnalysis(!showCohortAnalysis)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      showCohortAnalysis
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                        : "bg-gray-700/50 text-gray-400 border border-gray-600/50"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        showCohortAnalysis ? "bg-cyan-500" : "bg-gray-500"
                      }`}
                    ></div>
                    User Cohorts
                  </button>
                </div>
              </div>
            </div>

            {userEngagementError ? (
              <div className="flex items-center justify-center py-8 text-red-400">
                <p>Error loading user engagement data</p>
              </div>
            ) : userEngagementLoading ? (
              <div className="flex items-center justify-center py-20">
                <svg
                  className="animate-spin h-12 w-12 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : userEngagementData && Array.isArray(userEngagementData) && userEngagementData.length > 0 ? (
              (() => {
                // Calculate summary statistics from the data
                const totalActiveUsers = userEngagementData.reduce((sum: number, d: any) => sum + (d.active_users || 0), 0)
                const totalNewUsers = userEngagementData.reduce((sum: number, d: any) => sum + (d.new_users || 0), 0)
                const totalSessions = userEngagementData.reduce((sum: number, d: any) => sum + (d.total_sessions || 0), 0)
                const avgActiveUsers = totalActiveUsers / userEngagementData.length
                const avgEngagementTime = userEngagementData.reduce((sum: number, d: any) => sum + (d.avg_engagement_time || 0), 0) / userEngagementData.length

                // Calculate WAU by taking 7-day rolling sum of active users
                const dataWithWAU = userEngagementData.map((point: any, index: number) => {
                  const last7Days = userEngagementData.slice(Math.max(0, index - 6), index + 1)
                  const wau = last7Days.reduce((sum: number, d: any) => sum + (d.active_users || 0), 0)
                  return {
                    ...point,
                    dau: point.active_users,
                    wau: wau,
                  }
                })

                return (
                  <div className="space-y-6 w-full">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-xs text-gray-400 font-medium mb-1">
                          Total Active Users
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {totalActiveUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Avg: {avgActiveUsers.toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-xs text-gray-400 font-medium mb-1">
                          Total New Users
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {totalNewUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Avg: {(totalNewUsers / userEngagementData.length).toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-xs text-gray-400 font-medium mb-1">
                          Total Sessions
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {totalSessions.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Avg: {(totalSessions / userEngagementData.length).toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-xs text-gray-400 font-medium mb-1">
                          Avg Engagement Time
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {avgEngagementTime.toFixed(0)}s
                        </p>
                      </div>
                    </div>

                    {/* Separate DAU and WAU Charts */}
                    <div className={`grid gap-6 w-full ${(showDAU && showWAU) ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                      {/* Daily Active Users Chart */}
                      {showDAU && (
                        <div className="bg-gray-800/30 rounded-xl p-4 min-w-0">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">
                              Daily Active Users
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              Number of unique users active per time interval
                            </p>
                          </div>
                          <ChartContainer config={chartConfig} className="h-[350px]">
                            <LineChart
                              data={dataWithWAU}
                              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                              <XAxis
                                dataKey="timestamp"
                                className="text-xs"
                                stroke="#6b7280"
                                tickFormatter={(value) => {
                                  const date = new Date(value)
                                  return `${date.getMonth() + 1}/${date.getDate()}`
                                }}
                              />
                              <YAxis className="text-xs" stroke="#6b7280" />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  borderRadius: "8px",
                                }}
                                labelFormatter={(value) => {
                                  const date = new Date(value)
                                  return date.toLocaleDateString()
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="dau"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Daily Active Users"
                                dot={{ fill: "#8b5cf6", r: 3 }}
                              />
                            </LineChart>
                          </ChartContainer>
                        </div>
                      )}

                      {/* Weekly Active Users Chart */}
                      {showWAU && (
                        <div className="bg-gray-800/30 rounded-xl p-4 min-w-0">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">
                              Weekly Active Users
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              7-day rolling sum of active users showing weekly trends
                            </p>
                          </div>
                          <ChartContainer config={chartConfig} className="h-[350px]">
                            <LineChart
                              data={dataWithWAU}
                              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                              <XAxis
                                dataKey="timestamp"
                                className="text-xs"
                                stroke="#6b7280"
                                tickFormatter={(value) => {
                                  const date = new Date(value)
                                  return `${date.getMonth() + 1}/${date.getDate()}`
                                }}
                              />
                              <YAxis className="text-xs" stroke="#6b7280" />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  borderRadius: "8px",
                                }}
                                labelFormatter={(value) => {
                                  const date = new Date(value)
                                  return date.toLocaleDateString()
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="wau"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Weekly Active Users (7-day rolling)"
                                dot={{ fill: "#3b82f6", r: 3 }}
                              />
                            </LineChart>
                          </ChartContainer>
                        </div>
                      )}
                    </div>

                    {/* User Activity Metrics and Cohort Analysis - Vertical Stack */}
                    <div className="grid gap-6 w-full grid-cols-1">
                      {/* Additional Metrics Chart */}
                      {(showNewUsers || showSessions) && (
                        <div className="bg-gray-800/30 rounded-xl p-4 min-w-0">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">
                              User Activity Metrics
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              Track new user acquisition and total session count over time
                            </p>
                          </div>
                          <ChartContainer config={chartConfig} className="h-[400px]">
                            <LineChart
                              data={userEngagementData}
                              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                              <XAxis
                                dataKey="timestamp"
                                className="text-xs"
                                stroke="#6b7280"
                                tickFormatter={(value) => {
                                  const date = new Date(value)
                                  return `${date.getMonth() + 1}/${date.getDate()}`
                                }}
                              />
                              <YAxis className="text-xs" stroke="#6b7280" />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  borderRadius: "8px",
                                }}
                                labelFormatter={(value) => {
                                  const date = new Date(value)
                                  return date.toLocaleDateString()
                                }}
                              />
                              {showNewUsers && (
                                <Line
                                  type="monotone"
                                  dataKey="new_users"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  name="New Users"
                                  dot={{ fill: "#10b981", r: 3 }}
                                />
                              )}
                              {showSessions && (
                                <Line
                                  type="monotone"
                                  dataKey="total_sessions"
                                  stroke="#f59e0b"
                                  strokeWidth={2}
                                  name="Total Sessions"
                                  dot={{ fill: "#f59e0b", r: 3 }}
                                />
                              )}
                            </LineChart>
                          </ChartContainer>
                        </div>
                      )}

                      {/* User Cohort Analysis Chart */}
                      {showCohortAnalysis && (() => {
                        // Calculate cohort metrics from available data
                        const cohortData = userEngagementData.map((point: any, index: number) => {
                        const newUsers = point.new_users || 0
                        const activeUsers = point.active_users || 0

                        // Returning users = active users who are not new
                        const returningUsers = Math.max(0, activeUsers - newUsers)

                        // Get previous week's active users to identify resurrecting users
                        // A resurrecting user is someone who was inactive but became active again
                        let resurrectingUsers = 0
                        let dormantUsers = 0

                        if (index >= 7) {
                          // Look at users from 7 days ago
                          const prevWeekPoint = userEngagementData[index - 7]
                          const prevActiveUsers = prevWeekPoint?.active_users || 0

                          // Resurrecting: users who were active 7+ days ago but not recently
                          // This is an approximation - ideally we'd track individual user sessions
                          const recentlyActive = index >= 3
                            ? userEngagementData.slice(Math.max(0, index - 3), index)
                                .reduce((sum: number, p: any) => sum + (p.active_users || 0), 0) / 3
                            : activeUsers

                          resurrectingUsers = Math.max(0, Math.floor(
                            (activeUsers - recentlyActive) * 0.3 // Estimate: 30% of increase might be resurrecting
                          ))

                          // Dormant: previously active users who are no longer active
                          dormantUsers = Math.max(0, Math.floor(
                            (prevActiveUsers - activeUsers) * 0.5 // Estimate: 50% of decrease might be dormant
                          ))
                        }

                        return {
                          timestamp: point.timestamp,
                          date: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          new_users: newUsers,
                          returning_users: returningUsers,
                          resurrecting_users: resurrectingUsers,
                          dormant_users: dormantUsers,
                        }
                      })

                        return (
                          <div className="bg-gray-800/30 rounded-xl p-4 min-w-0">
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-200">
                                User Cohort Analysis
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                Track new, returning, resurrecting, and dormant users over time
                              </p>
                            </div>
                            <Button
                              onClick={() => setShowNewUsersModal(true)}
                              size="sm"
                              variant="outline"
                              className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            >
                              View New Users
                            </Button>
                          </div>

                          {/* Cohort Legend */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/30">
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              <div>
                                <p className="text-xs font-medium text-gray-200">New Users</p>
                                <p className="text-xs text-gray-400">First time</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/30">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <div>
                                <p className="text-xs font-medium text-gray-200">Returning</p>
                                <p className="text-xs text-gray-400">Active again</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/30">
                              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                              <div>
                                <p className="text-xs font-medium text-gray-200">Resurrecting</p>
                                <p className="text-xs text-gray-400">Came back</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/30">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div>
                                <p className="text-xs font-medium text-gray-200">Dormant</p>
                                <p className="text-xs text-gray-400">Became inactive</p>
                              </div>
                            </div>
                          </div>

                          <ChartContainer config={chartConfig} className="h-[400px]">
                            <BarChart
                              data={cohortData}
                              margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                              <XAxis
                                dataKey="date"
                                className="text-xs"
                                stroke="#6b7280"
                              />
                              <YAxis className="text-xs" stroke="#6b7280" />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  borderRadius: "8px",
                                }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                              />
                              <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                              />
                              <Bar
                                dataKey="new_users"
                                stackId="cohort"
                                fill="#10b981"
                                name="New Users"
                                radius={[0, 0, 0, 0]}
                              />
                              <Bar
                                dataKey="returning_users"
                                stackId="cohort"
                                fill="#3b82f6"
                                name="Returning Users"
                                radius={[0, 0, 0, 0]}
                              />
                              <Bar
                                dataKey="resurrecting_users"
                                stackId="cohort"
                                fill="#06b6d4"
                                name="Resurrecting Users"
                                radius={[0, 0, 0, 0]}
                              />
                              <Bar
                                dataKey="dormant_users"
                                fill="#ef4444"
                                name="Dormant Users"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ChartContainer>

                          {/* Cohort Insights */}
                          <div className="mt-4 p-3 rounded-lg bg-gray-700/20 border border-gray-600/30">
                            <p className="text-xs text-gray-400">
                              <span className="font-semibold text-cyan-400">Note:</span> Cohort analysis
                              shows user behavior patterns. New users appear for the first time, returning users
                              were recently active, resurrecting users came back after being away, and dormant
                              users stopped being active.
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400">
                  No user engagement data available for the selected period
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Page Views
              </CardTitle>
              <Eye className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPageViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Views based on selected path
              </p>

              <StickySelect
                value={selectedPage}
                onValueChange={setSelectedPage}
                placeholder="Select a page"
              >
                {analyticsData.uniquePagePaths.map((path: any) => (
                  <SelectItem key={path} className="cursor-target" value={path}>
                    {path}
                  </SelectItem>
                ))}
              </StickySelect>
            </CardContent>
          </Card>

          {kpiData.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Unique Users
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedDay === "All Days"
                  ? getUniqueSessionsData?.total_unique_users?.toLocaleString() ??
                    "N/A"
                  : (analyticsDataI.usersPerDayChartData as any).find(
                      (d: any) => d.day === selectedDay
                    )?.users ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Users active on{" "}
                {selectedDay === "All Days"
                  ? "all days"
                  : new Date(selectedDay).toLocaleDateString()}
              </p>

              <StickySelect
                value={selectedDay}
                onValueChange={setSelectedDay}
                placeholder="Select a day"
              >
                <SelectItem value="All Days">All Days</SelectItem>
              </StickySelect>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total {clickType === "buttons" ? "Button" : "Link"} Clicks
              </CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalHeroClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {clickType === "buttons" ? "Button clicks" : "Link clicks"}
              </p>

              {/* Click Type Selector */}
              <div className="flex gap-2 mb-3 mt-3">
                <Button
                  size="sm"
                  variant={clickType === "buttons" ? "default" : "outline"}
                  onClick={() => setClickType("buttons")}
                  className="cursor-target flex-1"
                >
                  Buttons
                </Button>
                <Button
                  size="sm"
                  variant={clickType === "links" ? "default" : "outline"}
                  onClick={() => setClickType("links")}
                  className="cursor-target flex-1"
                >
                  Links
                </Button>
              </div>

              {clickType === "buttons" ? (
                <StickySelect
                  value={selectedButton}
                  onValueChange={setSelectedButton}
                  placeholder="Select a button"
                >
                  {analyticsData.uniqueButtonNames.map((buttonName: string) => (
                    <SelectItem
                      key={buttonName}
                      className="cursor-target"
                      value={buttonName}
                    >
                      {buttonName}
                    </SelectItem>
                  ))}
                </StickySelect>
              ) : (
                <StickySelect
                  value={selectedLink}
                  onValueChange={setSelectedLink}
                  placeholder="Select a link"
                >
                  {analyticsData.uniqueLinkNames.map((linkName: string) => (
                    <SelectItem
                      key={linkName}
                      className="cursor-target"
                      value={linkName}
                    >
                      {linkName}
                    </SelectItem>
                  ))}
                </StickySelect>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connected wallets section */}
      {Array.isArray(connectedWalletsData) &&
      connectedWalletsData.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-semibold tracking-tight">
              Connected Wallets
            </h2>
            <Button
              variant="default"
              className="cursor-target"
              onClick={() => setShowWeb3odal(true)}
            >
              Add a web3 wallet
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(connectedWalletsData as WalletConn[]).map((w) => (
              <Card
                key={w.id}
                className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition cursor-pointer"
                onClick={() => openWalletModal(w)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {w.wallet_name || "Wallet"}
                    </CardTitle>
                    <Badge
                      className={`${
                        networkBadgeColor[w.network] ??
                        "bg-muted text-foreground"
                      }`}
                    >
                      {w.network}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono text-xs">
                      {truncate(w.wallet_address, 8, 6)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm">
                  <div className="space-x-2">
                    {w.is_verified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500">
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-500 border-amber-500/50"
                      >
                        Unverified
                      </Badge>
                    )}
                    {w.is_active ? (
                      <Badge className="bg-blue-500/10 text-blue-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Added{" "}
                    {formatDistanceToNow(new Date(w.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Button
          variant="default"
          className="cursor-target"
          onClick={() => setShowWeb3odal(true)}
        >
          Add a web3 wallet
        </Button>
      )}

      {/* Wallet modal with connect flow */}
      <WalletModal
        open={showWeb3Modal}
        onClose={() => setShowWeb3odal(false)}
        companyId={documents?.id}
        verifyEndpoint="/wallets/verify"
        saveWalletEndpoint="/wallets/connections/"
        onWalletLinked={() => {
          setIsWeb3Added(true)
          refetchConnectedWallets()
        }}
      />

      {/* Web3 details modal */}
      <WalletActivityModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        wallet={selectedWallet}
        companyId={documents?.id}
        onVerified={() => refetchConnectedWallets()}
      />

      {/* -------------------------------------------------- */}
      {/* Charts + Regional                                    */}
      {/* -------------------------------------------------- */}
      <div className="space-y-6">
        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
        {/* ----------- Chart: Page Views ----------- */}
        <Card key="page-views-chart" className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between space-x-2">
            <div>
              <CardTitle className="font-headline flex items-center">
                <Eye className="mr-2 h-5 w-5 text-accent" /> Daily Page Views
              </CardTitle>
              <CardDescription>
                Page views over the last 7 days.
              </CardDescription>
            </div>
            <StickySelect
              value={selectedPage}
              onValueChange={setSelectedPage}
              placeholder="Select a page"
            >
              {analyticsData.uniquePagePaths.map((path: any) => (
                <SelectItem key={path} className="cursor-target" value={path}>
                  {path}
                </SelectItem>
              ))}
            </StickySelect>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {String(startDate) || "All time"} → {String(endDate) || "Now"}
                </span>
                <span className="text-xs font-medium">{selectedPage}</span>
              </div>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart key="page-views-line-chart" data={pageViewsChartData} accessibilityLayer>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border)/0.5)"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--color-views)"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "var(--color-views)",
                      strokeWidth: 2,
                      stroke: "hsl(var(--background))",
                    }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ChartContainer>
              <div className="mt-2 text-[10px] text-gray-400">
                Generated by Adtivity — Page Views
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ----------- Chart: Clicks (Buttons/Links) ----------- */}
        <Card key="clicks-chart" className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between space-x-2">
            <div>
              <CardTitle className="font-headline flex items-center">
                <Target className="mr-2 h-5 w-5 text-purple-500" /> Daily {clickType === "buttons" ? "Button" : "Link"} Clicks
              </CardTitle>
              <CardDescription>
                {clickType === "buttons" ? "Buttons" : "Links"} clicked over the last 7 days.
              </CardDescription>
            </div>
            {clickType === "buttons" ? (
              <StickySelect
                value={selectedButton}
                onValueChange={setSelectedButton}
                placeholder="Select a button"
              >
                {analyticsData.uniqueButtonNames.map((buttonName: string) => (
                  <SelectItem
                    key={buttonName}
                    className="cursor-target"
                    value={buttonName}
                  >
                    {buttonName}
                  </SelectItem>
                ))}
              </StickySelect>
            ) : (
              <StickySelect
                value={selectedLink}
                onValueChange={setSelectedLink}
                placeholder="Select a link"
              >
                {analyticsData.uniqueLinkNames.map((linkName: string) => (
                  <SelectItem
                    key={linkName}
                    className="cursor-target"
                    value={linkName}
                  >
                    {linkName}
                  </SelectItem>
                ))}
              </StickySelect>
            )}
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {String(startDate) || "All time"} → {String(endDate) || "Now"}
                </span>
                <span className="text-xs font-medium">
                  {clickType === "buttons" ? selectedButton : selectedLink}
                </span>
              </div>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart key="clicks-line-chart" data={clicksChartData} accessibilityLayer>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border)/0.5)"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="purple"
                    strokeWidth={6}
                    dot={{
                      r: 5,
                      fill: "purple",
                      strokeWidth: 2,
                      stroke: "red",
                    }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ChartContainer>
              <div className="mt-2 text-[10px] text-gray-400">
                Generated by Adtivity — {clickType === "buttons" ? "Button" : "Link"} Clicks
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Regional Map Row */}
        <div className="w-full">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <CardTitle className="font-headline flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Regional
                Data
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <StickySelect
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                placeholder="Select a Country"
                triggerClassName="w-[180px]"
              >
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </StickySelect>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(
                          new Date(
                            typeof startDate === "string"
                              ? startDate
                              : (startDate as Date)
                          ),
                          "PPP"
                        )
                      : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      startDate
                        ? new Date(
                            typeof startDate === "string"
                              ? startDate
                              : (startDate as Date)
                          )
                        : undefined
                    }
                    onSelect={(date) =>
                      setStartDate(date ? format(date, "yyyy-MM-dd") : null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w=[140px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? format(
                          new Date(
                            typeof endDate === "string"
                              ? endDate
                              : (endDate as Date)
                          ),
                          "PPP"
                        )
                      : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      endDate
                        ? new Date(
                            typeof endDate === "string"
                              ? endDate
                              : (endDate as Date)
                          )
                        : undefined
                    }
                    onSelect={(date) =>
                      setEndDate(date ? format(date, "yyyy-MM-dd") : null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {getRegionalDataLoading && (
              <p className="text-center text-muted-foreground">
                Loading regional data...
              </p>
            )}
            {getRegionalDataIsError && (
              <p className="text-center text-red-500">
                Error fetching regional data.
              </p>
            )}
            {!getRegionalDataLoading &&
              !getRegionalDataIsError &&
              regionalData.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No regional data found for the selected date range.
                </p>
              )}
            {!getRegionalDataLoading &&
              !getRegionalDataIsError &&
              regionalData.length > 0 && (
                <RegionalHeatmap
                  data={regionalData}
                  selectedCountry={selectedCountry}
                />
              )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Shareable Growth Image component (receives both web2 + web3 data) */}
      <GrowthImage
        dateRange={{
          startDate: startDate ? String(startDate) : null,
          endDate: endDate ? String(endDate) : null,
        }}
        selected={{
          pagePath: selectedPage,
          buttonName: selectedButton,
          country: selectedCountry,
        }}
        options={{
          pagePaths: analyticsData.uniquePagePaths,
          buttonNames: analyticsData.uniqueButtonNames,
        }}
        datasets={{
          web2: {
            pageViewsPerDay: pageViewsChartData,
            clicksPerDay: clicksChartData,
            usersPerDay: analyticsDataI.usersPerDayChartData ?? [],
            totalUniqueUsers: getUniqueSessionsData?.total_unique_users ?? 0,
            regional: regionalData,
            rawEvents,
          },
          web3: {
            events: web3Events,
            connectedWallets: Array.isArray(connectedWalletsData)
              ? (connectedWalletsData as any[])
              : [],
          },
        }}
      />

      {/* New Users Details Modal */}
      <Dialog open={showNewUsersModal} onOpenChange={setShowNewUsersModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white">
              New Users Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about new users acquired during the selected period
            </DialogDescription>
          </DialogHeader>

          {newUsersLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : newUsersError ? (
            <div className="flex items-center justify-center py-8 text-red-400">
              <p>Error loading new users data</p>
            </div>
          ) : newUsersData && newUsersData.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 mb-1">Total New Users</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {newUsersData.length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 mb-1">Avg Sessions</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {(
                        newUsersData.reduce(
                          (sum: number, u: any) => sum + (u.total_sessions || 0),
                          0
                        ) / newUsersData.length
                      ).toFixed(1)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 mb-1">Avg Page Views</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {(
                        newUsersData.reduce(
                          (sum: number, u: any) => sum + (u.total_page_views || 0),
                          0
                        ) / newUsersData.length
                      ).toFixed(1)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 mb-1">Avg Engagement</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {(
                        newUsersData.reduce(
                          (sum: number, u: any) =>
                            sum + (u.total_engagement_time_seconds || 0),
                          0
                        ) /
                        newUsersData.length /
                        60
                      ).toFixed(1)}
                      <span className="text-sm ml-1">min</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-800">
                    <TableRow>
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">First Seen</TableHead>
                      <TableHead className="text-gray-300">Last Seen</TableHead>
                      <TableHead className="text-gray-300">Sessions</TableHead>
                      <TableHead className="text-gray-300">Page Views</TableHead>
                      <TableHead className="text-gray-300">Events</TableHead>
                      <TableHead className="text-gray-300">Engagement</TableHead>
                      <TableHead className="text-gray-300">Country</TableHead>
                      <TableHead className="text-gray-300">Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newUsersData.map((user: any, index: number) => (
                      <TableRow
                        key={user.user_id || index}
                        className="border-gray-700 hover:bg-gray-800/50"
                      >
                        <TableCell className="font-mono text-xs text-gray-300">
                          {user.user_id?.substring(0, 12)}...
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {new Date(user.first_seen).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {new Date(user.last_seen).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {user.total_sessions || 0}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {user.total_page_views || 0}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {user.total_events || 0}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {((user.total_engagement_time_seconds || 0) / 60).toFixed(
                            1
                          )}
                          m
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {user.country || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-300">
                          {user.device_type || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-400">No new users found for the selected period</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
  Eye,
  FilePlus2,
  Hash,
  RefreshCcw,
  Repeat,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Date picker components
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import RegionalHeatmap from "@/components/compnay-info/heatMap"
import { WalletActivityModal } from "@/components/compnay-info/wallet/activity"
import WalletModal from "@/components/compnay-info/wallet/add-wallet"
import { Modal } from "@/components/modal"
import {
  useCompanyDataQuery,
  useCompanyWeb3EventsQuery,
  useConnectedWalletsQuery,
  useGetRegionalDataQuery,
  useGetUniqueSessionsQuery,
} from "@/redux/api/queryApi"

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  views: { label: "Page Views", color: "hsl(var(--accent))" },
  clicks: { label: "Clicks", color: "hsl(var(--purple-500))" },
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
  const [rawEvents, setRawEvents] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState({
    uniqueSessions: 0,
    uniqueButtonNames: [] as string[],
    uniquePagePaths: [] as string[],
    uniquePageEventNames: [] as string[],
  })
  const [selectedButton, setSelectedButton] = useState("All Clicks")
  const [selectedPage, setSelectedPage] = useState("All Pages")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showWeb3Modal, setShowWeb3odal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [isWeb3Added, setIsWeb3Added] = useState(false)

  const [startDate, setStartDate] = useState<Date | string | null>("2025-01-01")
  const [endDate, setEndDate] = useState<Date | string | null>(null)

  const [selectedCountry, setSelectedCountry] = useState("World View")

  const { documents, apikey, token }: any = useSelector((store) => store)
  const [salesData] = useState([
    { month: "Jan", sales: 1500, revenue: 35000 },
    { month: "Feb", sales: 1800, revenue: 42000 },
    { month: "Mar", sales: 1650, revenue: 38000 },
    { month: "Apr", sales: 1900, revenue: 45000 },
    { month: "May", sales: 2100, revenue: 51000 },
    { month: "Jun", sales: 2050, revenue: 49000 },
  ])

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

  const [analyticsDataI, setAnalyticsDataI] = useState<any>({
    uniqueSessions: 0,
    uniqueButtonNames: [],
    uniquePagePaths: [],
    uniquePageEventNames: [],
    usersPerDayChartData: [],
  })

  const [selectedDay, setSelectedDay] = useState("All Days")

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
      uniqueSessions: sessions.size,
      uniqueButtonNames,
      uniquePagePaths,
      uniquePageEventNames,
    }
  }

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

  const totalHeroClicks = useMemo(() => {
    if (!rawEvents.length) return 0
    const filteredClicks = rawEvents.filter((event: any) => {
      if (selectedButton === "All Clicks") {
        return (
          event.event_name.startsWith("Button:") ||
          event.event_name.startsWith("Button:")
        )
      }
      return event.event_name === selectedButton
    })
    return filteredClicks.length
  }, [rawEvents, selectedButton])

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
      .filter(
        (event: any) =>
          (selectedButton === "All Clicks" &&
            (event.event_name.startsWith("Button:") ||
              event.event_name.startsWith("Button:"))) ||
          event.event_name === selectedButton
      )
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
  }, [rawEvents, selectedButton])

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

  const web3KpiData = [
    {
      title: "Total Token Transfers",
      value: web3Kpis.totalTokenTransfers.toLocaleString(),
      icon: Repeat,
      iconColorClass: "text-purple-500",
      description: "Total token transfer events recorded.",
    },
    {
      title: "Active Wallets",
      value: web3Kpis.activeWallets.toLocaleString(),
      icon: Wallet,
      iconColorClass: "text-accent",
      description: "Unique wallets involved in token transfers.",
    },
    {
      title: "Transaction Volume (24h)",
      value: web3Kpis.tokenSymbol
        ? `${web3Kpis.transactionVolume.toFixed(2)} ${web3Kpis.tokenSymbol}`
        : "N/A",
      icon: TrendingUp,
      iconColorClass: "text-primary",
      description: "Total volume of token transfers in the last 24 hours.",
    },
    {
      title: "New Contracts Deployed",
      value: "0",
      icon: FilePlus2,
      iconColorClass: "text-accent",
      description: "Smart contracts deployed to your platform this week.",
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
    console.log("Deleting all events...")
    setShowDeleteModal(false)
  }

  const handleRegenerateApiKey = () => {
    console.log("Regenerating API key...")
    setShowRegenerateModal(false)
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

  // Mock adapters for the three datasets you provided
  const buildSampleAnalytics = (
    wallet: WalletConn | null
  ): WalletAnalytics | null => {
    if (!wallet) return null
    return {
      wallet_address: wallet.wallet_address,
      total_transactions: 12,
      total_volume_usd: "14823.19",
      unique_tokens: 5,
      networks: [wallet.network],
      transaction_types: { transfer: 9, swap: 2, approve: 1 },
      daily_activity: [],
      top_tokens: [],
      gas_spent_usd: "42.17",
      first_transaction: "2025-09-20T10:39:19.204Z",
      last_transaction: "2025-09-22T02:39:19.204Z",
    }
  }

  const sampleRecentTransactions: Txn[] = [
    {
      transaction_hash: "0xabc123…",
      block_number: 1,
      transaction_type: "transfer",
      from_address: "0xFrom…",
      to_address: "0xTo…",
      token_address: "0xToken…",
      token_symbol: "USDC",
      token_name: "USD Coin",
      amount: "250.00",
      amount_usd: "250.00",
      gas_used: 42000,
      gas_price: "12 gwei",
      gas_fee_usd: "0.45",
      network: "ethereum",
      status: "confirmed",
      timestamp: "2025-09-22T02:37:28.567Z",
      transaction_metadata: {},
      id: "tx_1",
      wallet_connection_id: "",
      created_at: "2025-09-22T02:37:28.567Z",
    },
  ]

  const sampleAllActivities: Txn[] = [
    {
      transaction_hash: "0xdef456…",
      block_number: 2,
      transaction_type: "swap",
      from_address: "0xFrom…",
      to_address: "0xTo…",
      token_address: "0xToken…",
      token_symbol: "SOL",
      token_name: "Solana",
      amount: "1.2",
      amount_usd: "225.60",
      gas_used: 5000,
      gas_price: "n/a",
      gas_fee_usd: "0.01",
      network: "solana",
      status: "confirmed",
      timestamp: "2025-09-22T02:38:53.203Z",
      transaction_metadata: {},
      id: "tx_2",
      wallet_connection_id: "",
      created_at: "2025-09-22T02:38:53.203Z",
    },
  ]

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

      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          Business Overview
        </h1>
        <div className="rounded-xl px-3 py-4 w-full">
          <div className="flex justify-between items-center">
            <p className="text-[#fff] text-[17px]">
              Keep this key safe: {apikey?.apiKey}
            </p>
            <div className="flex space-x-2">
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
            </div>
          </div>
        </div>

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
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="cursor-target w-[180px] mt-2">
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {analyticsData.uniquePagePaths.map((path: any) => (
                    <SelectItem
                      key={path}
                      className="cursor-target"
                      value={path}
                    >
                      {path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="cursor-target w-[180px] mt-2">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Days">All Days</SelectItem>
                  {/* {analyticsDataI.usersPerDayChartData.map(
                    (data: { day: string; users: number }) => (
                      <SelectItem
                        key={data.day}
                        className="cursor-target"
                        value={data.day}
                      >
                        {new Date(data.day).toLocaleDateString()}
                      </SelectItem>
                    )
                  )} */}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Hero Clicks
              </CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalHeroClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Clicks on the hero section
              </p>
              <Select value={selectedButton} onValueChange={setSelectedButton}>
                <SelectTrigger className="cursor-target w-[180px] mt-2">
                  <SelectValue placeholder="Select a button" />
                </SelectTrigger>
                <SelectContent>
                  {analyticsData.uniqueButtonNames.map((buttonName: string) => (
                    <SelectItem
                      key={buttonName}
                      className="cursor-target"
                      value={buttonName}
                    >
                      {buttonName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* {Array.isArray(connectedWalletsData) &&
        connectedWalletsData.length > 0 && (
          <div>
            <h2 className="text-2xl font-headline font-semibold tracking-tight">
              Key Web3 Metrics
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4">
              {web3KpiData.map((kpi) => (
                <KpiCard key={kpi.title} {...kpi} />
              ))}
            </div>
          </div>
        )} */}

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
        recentTransactions={sampleRecentTransactions}
        allActivities={sampleAllActivities}
        analytics={buildSampleAnalytics(selectedWallet)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <CardTitle className="font-headline flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Regional
                Data
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a Country" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between space-x-2">
            <div>
              <CardTitle className="font-headline flex items-center">
                <Eye className="mr-2 h-5 w-5 text-accent" /> Daily Page Views
              </CardTitle>
              <CardDescription>
                Page views over the last 7 days.
              </CardDescription>
            </div>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="cursor-target w-[180px]">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {analyticsData.uniquePagePaths.map((path: any) => (
                  <SelectItem key={path} className="cursor-target" value={path}>
                    {path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={pageViewsChartData} accessibilityLayer>
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
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-start justify-between space-x-2">
            <div>
              <CardTitle className="font-headline flex items-center">
                <Target className="mr-2 h-5 w-5 text-purple-500" /> Daily Button
                Clicks
              </CardTitle>
              <CardDescription>
                Buttons clicked over the last 7 days.
              </CardDescription>
            </div>
            <Select value={selectedButton} onValueChange={setSelectedButton}>
              <SelectTrigger className="cursor-target w-[180px]">
                <SelectValue placeholder="Select a button" />
              </SelectTrigger>
              <SelectContent>
                {analyticsData.uniqueButtonNames.map((buttonName: string) => (
                  <SelectItem
                    key={buttonName}
                    className="cursor-target"
                    value={buttonName}
                  >
                    {buttonName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={clicksChartData} accessibilityLayer>
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
                  dot={{ r: 5, fill: "purple", strokeWidth: 2, stroke: "red" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

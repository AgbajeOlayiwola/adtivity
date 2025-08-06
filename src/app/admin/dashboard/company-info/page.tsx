"use client"

import KpiCard from "@/components/dashboard/kpi-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Eye,
  FilePlus2,
  Repeat,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import {
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  BarChart as RechartsBarChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCompanyDataQuery,
  useCompanyWeb3EventsQuery,
} from "@/redux/api/queryApi"

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  views: { label: "Page Views", color: "hsl(var(--accent))" },
}

// Helper function to process raw event data from the API and prepare it for the dashboard.
const calculateDashboardMetrics = (events: any) => {
  const sessions = new Set()
  // Find all unique "Hero" and "CTA" button click names
  const heroClicks = events.filter(
    (event: any) =>
      event.event_name.startsWith("Hero:") ||
      event.event_name.startsWith("CTA:")
  )
  const uniqueButtonNames = [
    "All Clicks",
    ...new Set(heroClicks.map((event: any) => event.event_name)),
  ]

  // Extract all unique page paths from the combined events
  const uniquePagePaths = [
    "All Pages",
    ...new Set(
      events
        .filter(
          (event: any) =>
            event.event_name === "Page Viewed" ||
            event.event_name === "Page Loaded"
        )
        .map((event: any) => event.properties?.path)
    ),
  ]

  // Populate the sessions set
  events.forEach((event: any) => {
    if (event.properties?.sessionId) {
      sessions.add(event.properties.sessionId)
    }
  })

  return {
    heroClicks, // Return the full array of hero clicks
    uniqueSessions: sessions.size,
    uniqueButtonNames,
    uniquePagePaths,
  }
}

export default function KpiDashboardPage() {
  const [rawEvents, setRawEvents] = useState([])
  const [analyticsData, setAnalyticsData] = useState({
    uniqueSessions: 0,
    uniqueButtonNames: [],
    uniquePagePaths: [],
  })
  const [selectedButton, setSelectedButton] = useState("All Clicks")
  const [selectedPage, setSelectedPage] = useState("All Pages")
  const { documents }: any = useSelector((store) => store)
  const [salesData, setSalesData] = useState([
    // Placeholder sales data for the BarChart
    { month: "Jan", sales: 1500, revenue: 35000 },
    { month: "Feb", sales: 1800, revenue: 42000 },
    { month: "Mar", sales: 1650, revenue: 38000 },
    { month: "Apr", sales: 1900, revenue: 45000 },
    { month: "May", sales: 2100, revenue: 51000 },
    { month: "Jun", sales: 2050, revenue: 49000 },
  ])

  // --- Use two separate queries to fetch both Web2 and Web3 events ---
  const {
    data: web2Events,
    isLoading: isWeb2Loading,
    isSuccess: isWeb2Success,
    isError: isWeb2Error,
    error: web2Error,
  } = useCompanyDataQuery({ id: documents?.id })

  const {
    data: web3Events,
    isLoading: isWeb3Loading,
    isSuccess: isWeb3Success,
    isError: isWeb3Error,
    error: web3Error,
  } = useCompanyWeb3EventsQuery({ id: documents?.id })

  useEffect(() => {
    // Check if both queries have successfully returned data
    if (isWeb2Success && isWeb3Success) {
      // Combine the events from both API calls into a single array
      const combinedEvents = [...web2Events, ...web3Events]
      setRawEvents(combinedEvents) // Store the combined raw events
      const processedData = calculateDashboardMetrics(combinedEvents)
      setAnalyticsData(processedData)
      setSelectedButton("All Clicks")
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

  // Use a memoized value to calculate the filtered click count to avoid unnecessary re-renders.
  const totalHeroClicks = useMemo(() => {
    if (!rawEvents.length) return 0

    // Filter events based on the selected button
    const filteredClicks = rawEvents.filter((event: any) => {
      if (selectedButton === "All Clicks") {
        return (
          event.event_name.startsWith("Hero:") ||
          event.event_name.startsWith("CTA:")
        )
      }
      return event.event_name === selectedButton
    })

    return filteredClicks.length
  }, [rawEvents, selectedButton])

  // Memoized value for total page views
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

  // Memoized value to calculate daily page views for the chart based on the selected page
  const pageViewsChartData = useMemo(() => {
    if (!rawEvents.length) return []

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

    // Format the daily page views for the Recharts line chart
    return Object.entries(dailyPageViews).map(([date, views]) => ({
      date,
      views,
    }))
  }, [rawEvents, selectedPage])

  // Memoized Web3 KPI calculations
  const web3Kpis = useMemo(() => {
    if (!web3Events || web3Events.length === 0) {
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

    // Calculate unique active wallets
    const uniqueWallets = new Set(
      tokenTransfers.map((event: any) => event.properties?.wallet_address)
    )

    // Calculate total transaction volume for the last 24 hours
    const now = new Date()
    const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000
    let totalVolume = 0
    let tokenSymbol = ""

    tokenTransfers.forEach((event: any) => {
      const eventTimestamp = new Date(event.properties?.timestamp).getTime()
      if (eventTimestamp > oneDayAgo) {
        totalVolume += event.properties?.amount || 0
        if (!tokenSymbol) {
          tokenSymbol = event.properties?.token_symbol || ""
        }
      }
    })

    return {
      totalTokenTransfers: tokenTransfers.length,
      activeWallets: uniqueWallets.size,
      transactionVolume: totalVolume,
      tokenSymbol,
    }
  }, [web3Events])

  // Dynamically create the KPI data based on the fetched analytics
  const kpiData = [
    {
      title: "Total Page Views",
      value: totalPageViews.toLocaleString(),
      icon: Eye,
      iconColorClass: "text-accent",
    },
    {
      title: "Unique Sessions",
      value: analyticsData.uniqueSessions.toLocaleString(),
      icon: Users,
      iconColorClass: "text-green-500",
    },
    {
      title: "Conversion Rate", // This KPI can't be calculated with the provided data, so it's a placeholder.
      value: "N/A",
      icon: TrendingUp,
      iconColorClass: "text-yellow-500",
    },
  ]

  // The Web3 KPIs are now populated with real data
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

  // Use a combined loading state
  const isLoading = isWeb2Loading || isWeb3Loading
  const error = isWeb2Error ? web2Error : isWeb3Error ? web3Error : null

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
      <div>
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          Business Overview
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4">
          {kpiData.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
          {/* Custom Card for Total Hero Clicks with a Select dropdown */}
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
                <SelectTrigger className="w-[180px] mt-2">
                  <SelectValue placeholder="Select a button" />
                </SelectTrigger>
                <SelectContent>
                  {analyticsData.uniqueButtonNames.map((buttonName) => (
                    <SelectItem key={buttonName} value={buttonName}>
                      {buttonName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Sales &
              Revenue Overview
            </CardTitle>
            <CardDescription>
              Monthly sales and revenue for the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsBarChart data={salesData} accessibilityLayer>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border)/0.5)"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="sales"
                  fill="var(--color-sales)"
                  radius={4}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={4}
                />
              </RechartsBarChart>
            </ChartContainer>
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {analyticsData.uniquePagePaths.map((path) => (
                  <SelectItem key={path} value={path}>
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
      </div>
    </div>
  )
}

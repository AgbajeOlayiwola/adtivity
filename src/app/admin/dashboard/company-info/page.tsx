"use client"

import KpiCard from "@/components/dashboard/kpi-card"
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
  RefreshCcw,
  Repeat,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
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
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import {
  useCompanyDataQuery,
  useCompanyWeb3EventsQuery,
  useGetRegionalDataQuery,
  useGetUniqueSessionsQuery,
} from "@/redux/api/queryApi"
import { scaleSequential } from "d3-scale"
import { interpolateReds } from "d3-scale-chromatic"
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  ZoomableGroup,
} from "react-simple-maps"
import { Tooltip } from "react-tooltip"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"

const chartConfig = {
  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  views: { label: "Page Views", color: "hsl(var(--accent))" },
  clicks: { label: "Clicks", color: "hsl(var(--purple-500))" },
}

const calculateDashboardMetrics = (events: any) => {
  const sessions = new Set()
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

const Modal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
}: any) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-sm p-6 bg-card/95 backdrop-blur-sm shadow-xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const RegionalHeatmap = ({
  data,
  selectedCountry,
}: {
  data: any
  selectedCountry: string
}) => {
  const [tooltipContent, setTooltipContent] = useState("")
  const [geos, setGeos] = useState<any>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  useEffect(() => {
    fetch(geoUrl)
      .then((response) => response.json())
      .then((data) => {
        setGeos(data.objects.countries.geometries)
      })
      .catch((error) => console.error("Error fetching geo data:", error))
  }, [])

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

  const countryDataMap = useMemo(() => {
    type CityData = number
    type RegionData = {
      totalEvents: number
      cities: { [city: string]: CityData }
    }
    type CountryData = {
      totalEvents: number
      regions: { [region: string]: RegionData }
    }
    const aggregatedData: { [country: string]: CountryData } = {}
    data.forEach((item: any) => {
      const countryName = isoToCountryNameMap[item.country] || item.country
      if (countryName && item.region && item.city) {
        if (!aggregatedData[countryName]) {
          aggregatedData[countryName] = { totalEvents: 0, regions: {} }
        }
        if (!aggregatedData[countryName].regions[item.region]) {
          aggregatedData[countryName].regions[item.region] = {
            totalEvents: 0,
            cities: {},
          }
        }
        if (
          !aggregatedData[countryName].regions[item.region].cities[item.city]
        ) {
          aggregatedData[countryName].regions[item.region].cities[item.city] = 0
        }
        aggregatedData[countryName].totalEvents += item.event_count
        aggregatedData[countryName].regions[item.region].totalEvents +=
          item.event_count
        aggregatedData[countryName].regions[item.region].cities[item.city] +=
          item.event_count
      }
    })
    return aggregatedData
  }, [data, isoToCountryNameMap])
  // const countryDataMap = useMemo(() => {
  //   const aggregatedData: { [key: string]: any } = {}
  //   data.forEach((item: any) => {
  //     const countryName = isoToCountryNameMap[item.country] || item.country
  //     if (countryName) {
  //       if (!aggregatedData[countryName]) {
  //         aggregatedData[countryName] = {
  //           country: countryName,
  //           totalEvents: 0,
  //           regionalDetails: {},
  //         }
  //       }
  //       aggregatedData[countryName].totalEvents += item.event_count
  //       if (
  //         item.region &&
  //         !aggregatedData[countryName].regionalDetails[item.region]
  //       ) {
  //         aggregatedData[countryName].regionalDetails[item.region] = 0
  //       }
  //       if (item.region) {
  //         aggregatedData[countryName].regionalDetails[item.region] +=
  //           item.event_count
  //       }
  //     }
  //   })
  //   return aggregatedData
  // }, [data, isoToCountryNameMap])

  const colorScale = useMemo(() => {
    const maxEvents = Math.max(
      ...Object.values(countryDataMap).map((d: any) => d.totalEvents),
      0
    )
    return scaleSequential(interpolateReds).domain([0, maxEvents])
  }, [countryDataMap])

  const handleCountryHover = (countryName: string) => {
    setHoveredCountry(countryName)
  }

  const handleCountryLeave = () => {
    setHoveredCountry(null)
  }

  if (!geos) {
    return <p className="text-center text-muted-foreground">Loading map...</p>
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
      <ComposableMap
        height={500}
        projection="geoMercator"
        data-tooltip-id="country-tooltip"
      >
        <Sphere stroke="#E4E5E6" strokeWidth={0.5} id={""} fill={""} />
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const countryName = geo.properties.name
                  const countryMetrics = countryDataMap[countryName]
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        handleCountryHover(countryName)
                        if (countryMetrics) {
                          setTooltipContent(
                            `${countryName}: ${countryMetrics.totalEvents} Events`
                          )
                        } else {
                          setTooltipContent(`${countryName}: No Data`)
                        }
                      }}
                      onMouseLeave={() => {
                        handleCountryLeave()
                        setTooltipContent("")
                      }}
                      style={{
                        default: {
                          fill: countryMetrics
                            ? colorScale(countryMetrics.totalEvents)
                            : "#DEDEDE",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: countryMetrics
                            ? colorScale(countryMetrics.totalEvents)
                            : "#DEDEDE",
                          stroke: "#2C2C2C",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                        pressed: {
                          fill: countryMetrics
                            ? colorScale(countryMetrics.totalEvents)
                            : "#DEDEDE",
                          stroke: "#2C2C2C",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                      }}
                    />
                  )
                })}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip id="country-tooltip" content={tooltipContent} />
      <div className="absolute top-4 left-4 z-10 w-[250px]">
        <Card className="bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>{hoveredCountry}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total Events:{" "}
              {hoveredCountry && countryDataMap[hoveredCountry]?.totalEvents
                ? countryDataMap[hoveredCountry]?.totalEvents
                : "N/A"}
            </p>
            <div className="mt-2">
              {hoveredCountry &&
                Object.entries(
                  countryDataMap[hoveredCountry]?.regions || {}
                ).map(([region, regionData]) => (
                  <div key={region} className="mb-2">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {region}: {regionData.totalEvents} Events
                    </p>
                    <ul className="pl-4">
                      {Object.entries(regionData.cities || {}).map(
                        ([city, count]) => (
                          <li
                            key={city}
                            className="text-xs text-muted-foreground list-disc"
                          >
                            {city}: {count} Events
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function KpiDashboardPage() {
  const [rawEvents, setRawEvents] = useState<any>([])
  const [analyticsData, setAnalyticsData] = useState({
    uniqueSessions: 0,
    uniqueButtonNames: [],
    uniquePagePaths: [],
    uniquePageEventNames: [],
  })
  const [selectedButton, setSelectedButton] = useState("All Clicks")
  const [selectedPage, setSelectedPage] = useState("All Pages")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)

  const [startDate, setStartDate] = useState<Date | String | null>("2025-01-01")
  const [endDate, setEndDate] = useState<Date | String | null>(null)

  const [selectedCountry, setSelectedCountry] = useState("World View")

  const { documents }: any = useSelector((store) => store)
  const { apikey }: any = useSelector((store) => store)
  const [salesData, setSalesData] = useState([
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
  // Inside your KpiDashboardPage component
  const [analyticsDataI, setAnalyticsDataI] = useState<any>({
    uniqueSessions: 0,
    uniqueButtonNames: [],
    uniquePagePaths: [],
    uniquePageEventNames: [],
    usersPerDayChartData: [], // Add a state for daily user data
  })

  const [selectedDay, setSelectedDay] = useState("All Days") // New state for the selected day

  // Use a new useEffect to process the data from the endpoint
  useEffect(() => {
    if (getUniqueSessionsSuccess && getUniqueSessionsData) {
      // Process data for the chart or daily breakdown
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

  // ... rest of your component
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
    return Object.entries(dailyPageViews).map(([date, views]) => ({
      date,
      views,
    }))
  }, [rawEvents, selectedPage])

  const clicksChartData = useMemo(() => {
    if (!rawEvents.length) return []
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
    if (!web3Events || web3Events.length === 0) {
      return {
        totalTokenTransfers: 0,
        activeWallets: 0,
        transactionVolume: 0,
        tokenSymbol: "N/A",
      }
    }
    const tokenTransfers = web3Events.filter(
      (event) => event.event_name === "Token Transferred"
    )
    const uniqueWallets = new Set(
      tokenTransfers.map((event) => event.properties?.wallet_address)
    )
    const now = new Date()
    const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000
    let totalVolume = 0
    let tokenSymbol = ""

    tokenTransfers.forEach((event) => {
      const eventTimestamp = new Date(event.timestamp).getTime()
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

  const kpiData = [
    // {
    //   title: "Unique Sessions",
    //   value: analyticsData.uniqueSessions.toLocaleString(),
    //   icon: Users,
    //   iconColorClass: "text-green-500",
    // },
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
                className="text-purple-500 hover:text-purple-600 border-purple-500"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="destructive"
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
                <SelectTrigger className="w-[180px] mt-2">
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {analyticsData.uniquePagePaths.map((path: any) => (
                    <SelectItem key={path} value={path}>
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
                  : analyticsDataI.usersPerDayChartData.find(
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
                <SelectTrigger className="w-[180px] mt-2">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Days">All Days</SelectItem>
                  {analyticsDataI.usersPerDayChartData.map((data: any) => (
                    <SelectItem key={data.day} value={data.day}>
                      {new Date(data.day).toLocaleDateString()}
                    </SelectItem>
                  ))}
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
                              : startDate instanceof String
                              ? startDate.toString()
                              : startDate
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
                              : startDate instanceof String
                              ? startDate.toString()
                              : startDate
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
                      "w-[140px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? format(
                          new Date(
                            typeof endDate === "string"
                              ? endDate
                              : endDate instanceof String
                              ? endDate.toString()
                              : endDate
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
                              : endDate instanceof String
                              ? endDate.toString()
                              : endDate
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
              <SelectTrigger className="w-[180px]">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

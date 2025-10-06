"use client"

import { TrendingUp } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

import { ChartContainer } from "@/components/ui/chart"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

/** ----------------------------------------------------------------
 * Types (aligns with the call site you shared)
 * ----------------------------------------------------------------*/
export type GrowthImageProps = {
  dateRange: { startDate: string | null; endDate: string | null }
  selected: {
    pagePath: string
    buttonName: string
    country: string
  }
  options: {
    pagePaths: string[] // include "All Pages"
    buttonNames: string[] // include "All Clicks"
  }
  datasets: {
    web2: {
      pageViewsPerDay: Array<{ date: string; views: number }> // optional (we recompute from rawEvents anyway)
      clicksPerDay: Array<{ date: string; clicks: number }>
      usersPerDay: Array<{ day: string; users: number }>
      totalUniqueUsers: number
      regional: Array<any>
      rawEvents: Array<any> // authoritative source for page/click charts
    }
    web3: {
      events: Array<any> // expects event_name + timestamp at least; "Token Transferred" for transfers
      connectedWallets: Array<any>
    }
  }
  onImageGenerated?: (dataUrl: string) => void
  onShare?: (dataUrl: string) => void
}

/** Available sources to render */
type ImageSource = "pageViews" | "clicks" | "web3Transfers"
/** Filter type within the modal */
type FilterType = "page" | "button" | "none"

const chartConfig = {
  views: { label: "Page Views", color: "hsl(var(--accent))" },
  clicks: { label: "Clicks", color: "hsl(var(--purple-500))" },
  transfers: { label: "Transfers", color: "hsl(var(--chart-2))" },
}

function toDayKey(ts: string | number | Date) {
  const d = new Date(ts)
  // uses locale-free MM/DD format for display
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
}

function withinRange(ts: string, from?: string, to?: string) {
  const t = new Date(ts).getTime()
  const f = from ? new Date(from).getTime() : -Infinity
  const e = to ? new Date(to).getTime() : Infinity
  return t >= f && t <= e
}

export default function GrowthImage(props: GrowthImageProps) {
  const { dateRange, selected, options, datasets, onImageGenerated, onShare } =
    props

  /** -------------------------
   * UI State
   * ------------------------- */
  const [shareOpen, setShareOpen] = useState(false)
  const [generatedImg, setGeneratedImg] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [source, setSource] = useState<ImageSource>("pageViews")
  const [filterType, setFilterType] = useState<FilterType>(
    source === "pageViews" ? "page" : source === "clicks" ? "button" : "none"
  )
  const [filterValue, setFilterValue] = useState<string>(
    source === "pageViews"
      ? selected.pagePath || "All Pages"
      : source === "clicks"
      ? selected.buttonName || "All Clicks"
      : "All"
  )
  const [dateFrom, setDateFrom] = useState<string>(dateRange.startDate ?? "")
  const [dateTo, setDateTo] = useState<string>(dateRange.endDate ?? "")

  // capture target inside the modal preview
  const captureRef = useRef<HTMLDivElement | null>(null)

  /** Keep filter type/value in sync when source changes */
  const onChangeSource = (v: ImageSource) => {
    setSource(v)
    if (v === "pageViews") {
      setFilterType("page")
      setFilterValue(selected.pagePath || "All Pages")
    } else if (v === "clicks") {
      setFilterType("button")
      setFilterValue(selected.buttonName || "All Clicks")
    } else {
      setFilterType("none")
      setFilterValue("All")
    }
  }

  /** -------------------------
   * Data builders (from raw events)
   * ------------------------- */

  const previewData = useMemo(() => {
    const raw = datasets.web2.rawEvents || []
    const key =
      source === "pageViews"
        ? "views"
        : source === "clicks"
        ? "clicks"
        : "transfers"

    // page views / clicks from web2 rawEvents
    if (source === "pageViews" || source === "clicks") {
      const filtered = raw.filter((ev: any) => {
        if (!withinRange(ev.timestamp, dateFrom, dateTo)) return false
        if (source === "pageViews") {
          const okName =
            ev.event_name === "Page Viewed" || ev.event_name === "Page Loaded"
          if (!okName) return false
          if (filterType !== "page") return false
          if (
            !filterValue ||
            filterValue === "All" ||
            filterValue === "All Pages"
          )
            return true
          return ev.properties?.path === filterValue
        } else {
          // clicks
          const okClick =
            ev.event_name?.startsWith("Button:") ||
            ev.event_name?.startsWith("Hero:")
          if (!okClick) return false
          if (filterType !== "button") return false
          if (
            !filterValue ||
            filterValue === "All" ||
            filterValue === "All Clicks"
          )
            return true
          return ev.event_name === filterValue
        }
      })

      const daily = filtered.reduce((acc: Record<string, number>, ev: any) => {
        const d = toDayKey(ev.timestamp)
        acc[d] = (acc[d] || 0) + 1
        return acc
      }, {})

      return Object.entries(daily).map(([date, val]) => ({ date, [key]: val }))
    }

    // web3 transfers from web3.events
    const w3 = datasets.web3.events || []
    const filteredW3 = w3.filter((ev: any) => {
      if (!withinRange(ev.timestamp, dateFrom, dateTo)) return false
      // if there's a specific name for transfers in your events, adjust here:
      // using "Token Transferred" as per your page logic
      return ev.event_name === "Token Transferred"
    })

    const daily = filteredW3.reduce((acc: Record<string, number>, ev: any) => {
      const d = toDayKey(ev.timestamp)
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})

    return Object.entries(daily).map(([date, val]) => ({ date, [key]: val }))
  }, [
    datasets.web2.rawEvents,
    datasets.web3.events,
    source,
    filterType,
    filterValue,
    dateFrom,
    dateTo,
  ])

  /** -------------------------
   * Export / Share helpers
   * ------------------------- */
  const dataUrlToFile = async (dataUrl: string, filename: string) => {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
  }

  const generateImage = async () => {
    const node = captureRef.current
    if (!node) return
    setIsGenerating(true)
    try {
      const { default: html2canvas } = await import("html2canvas")
      const prevBg = node.style.background
      node.style.background = "#ffffff"
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      })
      node.style.background = prevBg
      const dataUrl = canvas.toDataURL("image/png")
      setGeneratedImg(dataUrl)
      onImageGenerated?.(dataUrl)
      setShareOpen(false)
    } catch (e) {
      console.error("Failed to generate image", e)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareOnX = async () => {
    if (!generatedImg) return

    try {
      const file = await dataUrlToFile(generatedImg, "growth.png")
      const canShare = (navigator as any).canShare?.({ files: [file] })
      if ((navigator as any).share && canShare) {
        const label =
          source === "pageViews"
            ? "Page Views"
            : source === "clicks"
            ? "Button Clicks"
            : "Web3 Transfers"

        await (navigator as any).share({
          text: `Our growth looks great! ${label}${
            filterType === "page"
              ? ` — ${filterValue}`
              : filterType === "button"
              ? ` — ${filterValue}`
              : ""
          }`,
          files: [file],
        })
        onShare?.(generatedImg)
        return
      }
    } catch (e) {
      console.warn("Web Share with files not supported or failed", e)
    }

    // Fallback: download + open tweet compose
    const a = document.createElement("a")
    a.href = generatedImg
    a.download = "growth.png"
    document.body.appendChild(a)
    a.click()
    a.remove()

    const label =
      source === "pageViews"
        ? "Page Views"
        : source === "clicks"
        ? "Button Clicks"
        : "Web3 Transfers"

    const tweetText = encodeURIComponent(
      `Our growth looks great! ${label}${
        filterType === "page"
          ? ` — ${filterValue}`
          : filterType === "button"
          ? ` — ${filterValue}`
          : ""
      }`
    )
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`
    window.open(tweetUrl, "_blank")
    onShare?.(generatedImg)
  }

  /** -------------------------
   * Render
   * ------------------------- */
  const filterOptions =
    filterType === "page"
      ? options.pagePaths
      : filterType === "button"
      ? options.buttonNames
      : ["All"]

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="font-headline flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Share Growth
          Image
        </CardTitle>

        <div className="flex items-center gap-2">
          <Button
            className="cursor-target"
            onClick={() => {
              // initialize modal fields from current page state each time it opens
              onChangeSource(source) // re-sync filterType/value
              setDateFrom(dateRange.startDate ?? "")
              setDateTo(dateRange.endDate ?? "")
              setShareOpen(true)
            }}
          >
            Open Share Modal
          </Button>

          <Button
            className="cursor-target"
            onClick={shareOnX}
            disabled={!generatedImg}
          >
            Share on X (Twitter)
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {generatedImg ? (
          <div className="space-y-2">
            <img
              src={generatedImg}
              alt="Growth preview"
              className="w-full max-w-2xl rounded-xl border"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!generatedImg) return
                  const a = document.createElement("a")
                  a.href = generatedImg
                  a.download = "growth.png"
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                }}
              >
                Download PNG
              </Button>
              <Button onClick={shareOnX}>Share on X (Twitter)</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium">Open Share Modal</span> to
            choose a date range and filter, then generate a shareable image.
            After generating, come back here to download or share.
          </p>
        )}
      </CardContent>

      {/* Modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Shareable Growth Image</DialogTitle>
            <DialogDescription>
              Choose a data source, date range, and filter. We'll render a
              preview and export a PNG you can share.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Source + Dates */}
            <div className="grid md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-1">
                <label className="text-xs text-muted-foreground">
                  Data Source
                </label>
                <Select
                  value={source}
                  onValueChange={(v) => onChangeSource(v as ImageSource)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pageViews">Daily Page Views</SelectItem>
                    <SelectItem value="clicks">Daily Button Clicks</SelectItem>
                    <SelectItem value="web3Transfers">
                      Web3 Token Transfers
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Filter */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">
                  Filter Type
                </label>
                <Select
                  value={filterType}
                  onValueChange={(v) => setFilterType(v as FilterType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page" disabled={source !== "pageViews"}>
                      Page Path
                    </SelectItem>
                    <SelectItem value="button" disabled={source !== "clicks"}>
                      Button Name
                    </SelectItem>
                    <SelectItem
                      value="none"
                      disabled={source !== "web3Transfers"}
                    >
                      None
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Filter Value
                </label>
                <Select
                  value={filterValue}
                  onValueChange={(v) => setFilterValue(v)}
                  disabled={filterType === "none"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Live capture area */}
            <div className="mt-2">
              <div ref={captureRef} className="p-4 rounded-xl bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {dateFrom || "Start"} → {dateTo || "End"}
                  </span>
                  <span className="text-xs font-medium">
                    {source === "pageViews" && (filterValue || "All Pages")}
                    {source === "clicks" && (filterValue || "All Clicks")}
                    {source === "web3Transfers" && "Token Transfers"}
                  </span>
                </div>

                <ChartContainer
                  config={chartConfig as any}
                  className="h-[260px] w-full"
                >
                  <LineChart data={previewData} accessibilityLayer>
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
                    {source === "pageViews" && (
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="var(--color-views)"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "var(--color-views)",
                          strokeWidth: 2,
                          stroke: "hsl(var(--background))",
                        }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {source === "clicks" && (
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="purple"
                        strokeWidth={4}
                        dot={{
                          r: 4,
                          fill: "purple",
                          strokeWidth: 2,
                          stroke: "red",
                        }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {source === "web3Transfers" && (
                      <Line
                        type="monotone"
                        dataKey="transfers"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={4}
                        dot={{
                          r: 4,
                          fill: "hsl(var(--chart-2))",
                          strokeWidth: 2,
                          stroke: "hsl(var(--background))",
                        }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                  </LineChart>
                </ChartContainer>

                <div className="mt-2 text-[10px] text-gray-400">
                  Generated by Adtivity —{" "}
                  {source === "pageViews"
                    ? "Page Views"
                    : source === "clicks"
                    ? "Button Clicks"
                    : "Web3 Token Transfers"}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setShareOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateImage} disabled={isGenerating}>
              {isGenerating ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

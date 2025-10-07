// app/admin/dashboard/ai-analytics/page.tsx
"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSelector } from "react-redux"
import { useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Loader2, Sparkles, Target, Users } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

// ---------- Suspense wrapper page ----------
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">
          Loading analytics…
        </div>
      }
    >
      <AIAnalyticsClient />
    </Suspense>
  )
}

// ---------- Your original client logic moved here ----------
function AIAnalyticsClient() {
  const searchParams = useSearchParams()

  // Fallback lightweight helpers
  function toSeries(
    arr: Array<{ date: string; clicks?: number; views?: number }>
  ) {
    return (arr || [])
      .map(({ date, clicks, views }) => ({
        date,
        value: Number(clicks ?? views ?? 0),
      }))
      .sort((a, b) => {
        const [am, ad] = a.date.split("/").map(Number)
        const [bm, bd] = b.date.split("/").map(Number)
        if (am === bm) return ad - bd
        return am - bm
      })
  }

  function summarize(series: Array<{ value: number }>) {
    const values = series.map((d) => d.value)
    const total = values.reduce((a, b) => a + b, 0)
    const avg = values.length ? total / values.length : 0
    const last = values.at(-1) ?? 0
    const max = Math.max(...values, 0)
    const min = Math.min(...values, 0)
    const trend =
      values.length >= 2 ? (last - values[0]) / Math.max(values[0], 1) : 0
    return { total, avg, last, max, min, trend }
  }

  function buildGrowthPrompt(input: any) {
    const clicksSeries = input.datasets?.clicks
      ? toSeries(input.datasets.clicks)
      : null
    const pageViewsSeries = input.datasets?.pageViews
      ? toSeries(input.datasets.pageViews)
      : null
    const clicksStats = clicksSeries ? summarize(clicksSeries) : null
    const pvStats = pageViewsSeries ? summarize(pageViewsSeries) : null

    return `
You are a growth analyst. Based on the telemetry, produce concrete, prioritized growth suggestions.
- Output: 5–8 bullet points. Each: [Insight] + [Action] + [Expected impact].
- Optimize for small startup constraints (low eng lift where possible).

Context:
- Company: ${input.companyId || "N/A"}
- Timeframe: ${input.timeRange?.startDate || "?"} to ${
      input.timeRange?.endDate || "now"
    }
- Filters: ${JSON.stringify(input.filters || {})}

${
  clicksSeries
    ? `Clicks (date,value)
${clicksSeries.map((d: any) => `- ${d.date}: ${d.value}`).join("\n")}
Summary: total=${clicksStats!.total}, avg=${clicksStats!.avg.toFixed(
        2
      )}, last=${clicksStats!.last}, max=${clicksStats!.max}, min=${
        clicksStats!.min
      }, trend_vs_first=${(clicksStats!.trend * 100).toFixed(1)}%`
    : "Clicks: none"
}

${
  pageViewsSeries
    ? `Page Views (date,value)
${pageViewsSeries.map((d: any) => `- ${d.date}: ${d.value}`).join("\n")}
Summary: total=${pvStats!.total}, avg=${pvStats!.avg.toFixed(2)}, last=${
        pvStats!.last
      }, max=${pvStats!.max}, min=${pvStats!.min}, trend_vs_first=${(
        pvStats!.trend * 100
      ).toFixed(1)}%`
    : "Page Views: none"
}

${
  input.datasets?.usersPerDay?.users_per_day?.length
    ? `Users Per Day
${input.datasets.usersPerDay.users_per_day
  .map((u: any) => `- ${u.day}: ${u.users}`)
  .join("\n")}`
    : "Users Per Day: none"
}
  `.trim()
  }

  // ✅ payload from Redux (abalyticsData slice) or localStorage
  const reduxPayload = useSelector(
    (state: any) => state?.abalyticsData?.payload
  )
  const [lsPayload, setLsPayload] = React.useState<any>(null)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("ai_analytics_payload")
      if (raw) setLsPayload(JSON.parse(raw))
    } catch {}
  }, [])
  const payload = reduxPayload || lsPayload || {}

  const selectedKeys = React.useMemo(() => {
    const fromUrl = (searchParams.get("selected") || "")
      .split(",")
      .filter(Boolean)
    if (fromUrl.length) return fromUrl
    return payload.selected || []
  }, [searchParams, payload.selected])

  const [extraNotes, setExtraNotes] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)

  async function generateSuggestions() {
    setLoading(true)
    setSuggestions("")
    const prompt = buildGrowthPrompt({ ...payload, notes: extraNotes })
    try {
      const res = await fetch("/api/growth-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      setSuggestions(data.suggestions || "")
    } catch (e: any) {
      setSuggestions(`Error: ${e?.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const ds = payload.datasets || {}
  const tiles: Array<{
    key: string
    title: string
    icon: any
    data?: any[]
    valueKey: string
  }> = [
    {
      key: "pageViews",
      title: "Daily Page Views",
      icon: Eye,
      data: ds.pageViews,
      valueKey: "views",
    },
    {
      key: "clicks",
      title: "Daily Button Clicks",
      icon: Target,
      data: ds.clicks,
      valueKey: "clicks",
    },
  ]

  // ----- UI -----
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            AI Analytics
          </h1>
          <p className="text-muted-foreground">
            Review selected datasets and generate data-driven growth
            suggestions.
          </p>
        </div>
        <Badge variant="secondary">Company: {payload.companyId || "N/A"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
          <CardDescription>
            Time range and filters sent from the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <Stat label="Start" value={payload.timeRange?.startDate || "—"} />
          <Stat label="End" value={payload.timeRange?.endDate || "Now"} />
          <Stat
            label="Selected datasets"
            value={selectedKeys.length ? selectedKeys.join(", ") : "None"}
          />
          <Stat
            label="Filters"
            value={
              <code className="text-xs">
                {JSON.stringify(payload.filters || {})}
              </code>
            }
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiles
          .filter(
            (t) =>
              selectedKeys.includes(t.key) &&
              Array.isArray(t.data) &&
              t.data.length
          )
          .map((t) => {
            const Icon = t.icon
            return (
              <Card
                key={t.key}
                className="bg-card/50 backdrop-blur-sm border-border/50"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" /> {t.title}
                  </CardTitle>
                  <Badge variant="outline">{t.data!.length} pts</Badge>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={t.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey={t.valueKey}
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {selectedKeys.includes("usersPerDay") &&
      payload.datasets?.usersPerDay?.users_per_day?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Users Per Day
            </CardTitle>
            <CardDescription>
              Total unique users:{" "}
              {payload.datasets.usersPerDay.total_unique_users}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {payload.datasets.usersPerDay.users_per_day.map((u: any) => (
                <div
                  key={u.day}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span className="text-muted-foreground">{u.day}</span>
                  <span className="font-medium">{u.users}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Growth Suggestions (AI)
          </CardTitle>
          <CardDescription>
            Optionally add notes for context, then generate suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='Add optional notes for the AI (e.g., "KPI is trial signups", "We launched a new landing page on 09/28").'
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button onClick={generateSuggestions} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate Suggestions"
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              The selected datasets above will be summarized and sent as
              context.
            </span>
          </div>

          {suggestions ? (
            <div className="rounded-md border p-4 whitespace-pre-wrap text-sm">
              {suggestions}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedKeys.includes("rawEvents") &&
      Array.isArray(ds.rawEvents) &&
      ds.rawEvents.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Raw Events</CardTitle>
            <CardDescription>Showing first 50 rows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    {Array.isArray(ds.rawEvents) && ds.rawEvents.length > 0
                      ? Object.keys(ds.rawEvents[0])
                          .slice(0, 8)
                          .map((k) => (
                            <th
                              key={k}
                              className="px-3 py-2 text-left font-medium"
                            >
                              {k}
                            </th>
                          ))
                      : null}
                  </tr>
                </thead>
                <tbody>
                  {ds.rawEvents.slice(0, 50).map((row: any, i: number) => (
                    <tr key={i} className="border-t">
                      {Object.keys(ds.rawEvents[0])
                        .slice(0, 8)
                        .map((k) => (
                          <td key={k} className="px-3 py-2 align-top">
                            {String(row[k])}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

// UI helper
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-medium">{value}</span>
    </div>
  )
}

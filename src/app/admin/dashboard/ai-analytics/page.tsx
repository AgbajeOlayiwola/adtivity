// app/admin/dashboard/ai-analytics/page.tsx
"use client"

import * as React from "react"
import { useSelector } from "react-redux"

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
import { Loader2, Sparkles, TrendingUp } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

// ---------- Helpers ----------
type Point = { date: string; value: number }

function toSeries(
  arr: Array<{ date: string; clicks?: number; views?: number }>
): Point[] {
  return (arr || [])
    .map(({ date, clicks, views }) => ({
      date,
      value: Number(clicks ?? views ?? 0),
    }))
    .filter((d) => !Number.isNaN(d.value))
    .sort((a, b) => {
      const [am, ad] = a.date.split("/").map(Number)
      const [bm, bd] = b.date.split("/").map(Number)
      if (am === bm) return ad - bd
      return am - bm
    })
}

function summarize(series: Array<{ value: number }>) {
  const values = series.map((d) => d.value)
  if (!values.length)
    return { total: 0, avg: 0, last: 0, max: 0, min: 0, trend: 0 }
  const total = values.reduce((a, b) => a + b, 0)
  const avg = total / values.length
  const last = values.at(-1) ?? 0
  const max = Math.max(...values)
  const min = Math.min(...values)
  const trend =
    values.length >= 2 ? (last - values[0]) / Math.max(values[0], 1) : 0
  return { total, avg, last, max, min, trend }
}

// Parse "[Expected impact] +5–12%" or "+7-15%" or "+10%" → {min, max, mean}
function parseImpactRange(
  text: string
): { min: number; max: number; mean: number } | null {
  if (!text) return null
  // capture +5–12% / +5-12% / 5–12% / 10%
  const re = /([+−-]?\s*\d+(?:\.\d+)?)\s*(?:[–-]\s*(\d+(?:\.\d+)?))?\s*%/g
  let m: RegExpExecArray | null
  const ranges: Array<{ min: number; max: number }> = []
  while ((m = re.exec(text)) !== null) {
    const a = Number(String(m[1]).replace(/[^\d.-]/g, ""))
    const b = m[2] ? Number(m[2]) : undefined
    if (Number.isFinite(a)) {
      const min = Math.max(0, a)
      const max = Number.isFinite(b as number)
        ? Math.max(min, b as number)
        : min
      ranges.push({ min, max })
    }
  }
  if (!ranges.length) return null
  const min = ranges.reduce((p, r) => p + r.min, 0) / ranges.length
  const max = ranges.reduce((p, r) => p + r.max, 0) / ranges.length
  const mean = (min + max) / 2
  return { min, max, mean }
}

function mdToDate(mmdd: string): Date {
  const [m, d] = mmdd.split("/").map(Number)
  const now = new Date()
  return new Date(now.getFullYear(), (m || 1) - 1, d || 1)
}
function dateToMD(d: Date): string {
  const m = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  return `${m}/${day}`
}
function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

// Build a simple 14-day projection using last 7-day avg as baseline
type ProjectionPoint = {
  date: string
  baseline?: number | null
  low?: number | null
  mean?: number | null
  high?: number | null
}
function buildProjection(
  series: Point[],
  liftPct: { min: number; max: number; mean: number } | null,
  horizon = 14
): ProjectionPoint[] {
  if (!series.length) return []
  const recent = series.slice(-14) // show recent baseline
  const lastDate = mdToDate(series.at(-1)!.date)
  const last7 = series.slice(-7)
  const base = last7.length
    ? last7.reduce((a, b) => a + b.value, 0) / last7.length
    : series.at(-1)!.value

  const out: ProjectionPoint[] = recent.map((p) => ({
    date: p.date,
    baseline: p.value,
    low: null,
    mean: null,
    high: null,
  }))
  for (let i = 1; i <= horizon; i++) {
    const d = addDays(lastDate, i)
    const date = dateToMD(d)
    const low = liftPct ? Math.max(0, base * (1 + liftPct.min / 100)) : base
    const mean = liftPct ? Math.max(0, base * (1 + liftPct.mean / 100)) : base
    const high = liftPct ? Math.max(0, base * (1 + liftPct.max / 100)) : base
    out.push({ date, baseline: null, low, mean, high })
  }
  return out
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
- Extra notes from user: ${input.notes || "-"}

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
  `.trim()
}

// ---------- Page ----------
export default function Page() {
  // Pull payload from Redux; fallback to localStorage
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

  const [extraNotes, setExtraNotes] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string>("")
  const [impact, setImpact] = React.useState<{
    min: number
    max: number
    mean: number
  } | null>(null)
  const [projClicks, setProjClicks] = React.useState<ProjectionPoint[]>([])
  const [projViews, setProjViews] = React.useState<ProjectionPoint[]>([])
  const [loading, setLoading] = React.useState(false)

  async function generateSuggestions(auto = false) {
    if (auto && suggestions) return
    setLoading(true)
    if (!auto) setSuggestions("")
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

  // Auto-generate once payload is available
  React.useEffect(() => {
    if (payload && (payload.datasets || payload.selected)) {
      generateSuggestions(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!payload])

  // Recompute projections when suggestions or datasets change
  React.useEffect(() => {
    const parsed = parseImpactRange(suggestions || "")
    setImpact(parsed)

    const clicksSeries = payload.datasets?.clicks
      ? toSeries(payload.datasets.clicks)
      : []
    const pageViewsSeries = payload.datasets?.pageViews
      ? toSeries(payload.datasets.pageViews)
      : []

    setProjClicks(
      clicksSeries.length ? buildProjection(clicksSeries, parsed, 14) : []
    )
    setProjViews(
      pageViewsSeries.length ? buildProjection(pageViewsSeries, parsed, 14) : []
    )
  }, [suggestions, payload.datasets])

  const ImpactBadge = () =>
    impact ? (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">
          Expected impact (avg): {impact.mean.toFixed(1)}%
        </Badge>
        <Badge variant="secondary">
          Range: {impact.min.toFixed(1)}% – {impact.max.toFixed(1)}%
        </Badge>
      </div>
    ) : (
      <Badge variant="outline">Expected impact: n/a</Badge>
    )

  const ChartBlock = ({
    title,
    data,
  }: {
    title: string
    data: ProjectionPoint[]
  }) => {
    if (!data.length) return null
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex items-center justify-between gap-2 sm:flex-row sm:items-center">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> {title}
          </CardTitle>
          <ImpactBadge />
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              {/* Baseline (past) */}
              <Line
                type="monotone"
                dataKey="baseline"
                strokeWidth={2}
                dot={false}
              />
              {/* Projections (future) */}
              <Line type="monotone" dataKey="low" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="mean"
                strokeWidth={3}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="high"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-[10px] text-muted-foreground mt-2">
            Baseline shows recent history; projections show next 14 days using
            the AI’s expected impact.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            AI Growth Suggestions & Projections
          </h1>
          <p className="text-muted-foreground">
            We summarize your datasets, generate insights, then chart potential
            growth based on the AI’s expected impact.
          </p>
        </div>
        <Badge variant="secondary">Company: {payload.companyId || "N/A"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Suggestions
          </CardTitle>
          <CardDescription>
            Add optional context and regenerate if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='Optional notes — e.g. "Primary KPI is free-to-paid conversion", "New hero launched 09/28".'
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => generateSuggestions(false)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate / Regenerate"
              )}
            </Button>
            <ImpactBadge />
          </div>

          <Separator />

          <div className="rounded-md border p-4 whitespace-pre-wrap text-sm min-h-[120px]">
            {suggestions || "No suggestions yet."}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChartBlock title="Projected Clicks (next 14 days)" data={projClicks} />
        <ChartBlock
          title="Projected Page Views (next 14 days)"
          data={projViews}
        />
      </div>
    </div>
  )
}

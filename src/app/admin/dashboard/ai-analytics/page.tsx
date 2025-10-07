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
import { Loader2, TrendingUp } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

// ---------- Types ----------
type Point = { date: string; value: number }
type ProjectionPoint = {
  date: string
  baseline?: number | null
  low?: number | null
  mean?: number | null
  high?: number | null
}

// ---------- Helpers ----------
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

// Pearson correlation (for relations)
function correlation(a: Point[], b: Point[]) {
  // align by date
  const mapB = new Map(b.map((p) => [p.date, p.value]))
  const pairs: Array<[number, number]> = a
    .filter((p) => mapB.has(p.date))
    .map((p) => [p.value, mapB.get(p.date)!])

  if (pairs.length < 2) return NaN
  const xs = pairs.map((p) => p[0])
  const ys = pairs.map((p) => p[1])
  const mean = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
  const mx = mean(xs),
    my = mean(ys)
  const num = pairs.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0)
  const denX = Math.sqrt(xs.reduce((s, x) => s + Math.pow(x - mx, 2), 0))
  const denY = Math.sqrt(ys.reduce((s, y) => s + Math.pow(y - my, 2), 0))
  return denX && denY ? num / (denX * denY) : NaN
}

// Parse "[Expected impact] +5–12%" or "+7-15%" or "+10%"
function parseImpactRange(
  text: string
): { min: number; max: number; mean: number } | null {
  if (!text) return null
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

// 14-day projection using last 7-day avg as baseline
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

  const activeFilters = input.activeFilters
    ? JSON.stringify(input.activeFilters)
    : "{}"

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
- AI Filters (user-selected): ${activeFilters}
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
  // payload from Redux; fallback to localStorage
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
  const ds = payload.datasets || {}

  // ----- AI Filters state -----
  const initialSelected = (payload.selected || []) as string[]
  const [includeClicks, setIncludeClicks] = React.useState(
    initialSelected.includes("clicks")
  )
  const [includePageViews, setIncludePageViews] = React.useState(
    initialSelected.includes("pageViews")
  )
  const [includeUsers, setIncludeUsers] = React.useState(
    initialSelected.includes("usersPerDay")
  )
  const [alignDates, setAlignDates] = React.useState(true)
  const allDates = React.useMemo(() => {
    const set = new Set<string>()
    ;(ds.clicks || []).forEach((d: any) => set.add(d.date))
    ;(ds.pageViews || []).forEach((d: any) => set.add(d.date))
    return Array.from(set).sort((a, b) => {
      const [am, ad] = a.split("/").map(Number)
      const [bm, bd] = b.split("/").map(Number)
      return am === bm ? ad - bd : am - bm
    })
  }, [ds.clicks, ds.pageViews])
  const [selectedDates, setSelectedDates] = React.useState<string[]>([])

  // Optional context filters from raw data
  const rawEvents: any[] = Array.isArray(ds.rawEvents) ? ds.rawEvents : []
  const regional: any[] = Array.isArray(ds.regional)
    ? ds.regional
    : payload.datasets?.regional || []

  const uniqueButtons = React.useMemo(() => {
    const s = new Set<string>()
    rawEvents.forEach((e: any) => {
      const n = e?.event_name
      if (typeof n === "string" && n.startsWith("Button:")) s.add(n)
    })
    return Array.from(s).sort()
  }, [rawEvents])

  const uniquePages = React.useMemo(() => {
    const s = new Set<string>()
    rawEvents.forEach((e: any) => {
      const p = e?.properties?.path
      if (p) s.add(p)
    })
    return Array.from(s).sort()
  }, [rawEvents])

  const uniqueCountries = React.useMemo(() => {
    const s = new Set<string>()
    regional.forEach((r: any) => {
      const c = r?.country || r?.code || r?.name
      if (c) s.add(c)
    })
    return Array.from(s).sort()
  }, [regional])

  const [selectedButtons, setSelectedButtons] = React.useState<string[]>([])
  const [selectedPages, setSelectedPages] = React.useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>([])

  // ----- Derived datasets based on filters -----
  function applyFiltersToSeries(series: Point[]): Point[] {
    let out = series
    if (selectedDates.length) {
      const set = new Set(selectedDates)
      out = out.filter((p) => set.has(p.date))
    }
    return out
  }

  function alignSeries(a: Point[], b: Point[]): [Point[], Point[]] {
    if (!alignDates) return [a, b]
    const inter = new Set(
      a.map((p) => p.date).filter((d) => b.some((q) => q.date === d))
    )
    return [
      a.filter((p) => inter.has(p.date)),
      b.filter((p) => inter.has(p.date)),
    ]
  }

  const clicksSeries = includeClicks
    ? applyFiltersToSeries(toSeries(ds.clicks || []))
    : []
  const pageViewsSeries = includePageViews
    ? applyFiltersToSeries(toSeries(ds.pageViews || []))
    : []

  const [clicksAligned, pageViewsAligned] = React.useMemo(
    () => alignSeries(clicksSeries, pageViewsSeries),
    [clicksSeries, pageViewsSeries, alignDates]
  )

  // Correlation for relations
  const corr = React.useMemo(() => {
    if (!includeClicks || !includePageViews) return NaN
    return correlation(clicksAligned, pageViewsAligned)
  }, [includeClicks, includePageViews, clicksAligned, pageViewsAligned])

  // ----- Suggestions + projections -----
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

  const activeAIFilters = React.useMemo(
    () => ({
      include: {
        clicks: includeClicks,
        pageViews: includePageViews,
        usersPerDay: includeUsers,
      },
      alignDates,
      selectedDates,
      selectedButtons,
      selectedPages,
      selectedCountries,
    }),
    [
      includeClicks,
      includePageViews,
      includeUsers,
      alignDates,
      selectedDates,
      selectedButtons,
      selectedPages,
      selectedCountries,
    ]
  )

  async function generate(promptPayload: any) {
    setLoading(true)
    try {
      const res = await fetch("/api/growth-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildGrowthPrompt(promptPayload) }),
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

  // Build prompt payload from current filters
  function makePromptInput() {
    const selectedDatasets: any = {}
    if (includeClicks) selectedDatasets.clicks = ds.clicks
    if (includePageViews) selectedDatasets.pageViews = ds.pageViews
    if (includeUsers) selectedDatasets.usersPerDay = ds.usersPerDay

    // Limit by selected dates for clicks/pageViews
    if (selectedDatasets.clicks && selectedDates.length) {
      const set = new Set(selectedDates)
      selectedDatasets.clicks = (selectedDatasets.clicks as any[]).filter((d) =>
        set.has(d.date)
      )
    }
    if (selectedDatasets.pageViews && selectedDates.length) {
      const set = new Set(selectedDates)
      selectedDatasets.pageViews = (selectedDatasets.pageViews as any[]).filter(
        (d) => set.has(d.date)
      )
    }

    // Context-only filters (affect AI reasoning)
    const contextFilters = {
      selectedButtons,
      selectedPages,
      selectedCountries,
    }

    return {
      companyId: payload.companyId ?? null,
      timeRange: payload.timeRange ?? { startDate: null, endDate: null },
      filters: payload.filters ?? {},
      datasets: selectedDatasets,
      activeFilters: { ...activeAIFilters, context: contextFilters },
      notes: extraNotes,
    }
  }

  // Auto-generate on page load (once payload is available)
  React.useEffect(() => {
    if (payload && (payload.datasets || payload.selected)) {
      generate(makePromptInput())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!payload])

  // Regenerate when AI filters change
  React.useEffect(() => {
    if (!payload) return
    generate(makePromptInput())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    includeClicks,
    includePageViews,
    includeUsers,
    alignDates,
    selectedDates,
    selectedButtons,
    selectedPages,
    selectedCountries,
  ])

  // Recompute projections when suggestions or filtered series change
  React.useEffect(() => {
    const parsed = parseImpactRange(suggestions || "")
    setImpact(parsed)
    setProjClicks(
      includeClicks ? buildProjection(clicksAligned, parsed, 14) : []
    )
    setProjViews(
      includePageViews ? buildProjection(pageViewsAligned, parsed, 14) : []
    )
  }, [
    suggestions,
    clicksAligned,
    pageViewsAligned,
    includeClicks,
    includePageViews,
  ])

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
              <Line
                type="monotone"
                dataKey="baseline"
                strokeWidth={2}
                dot={false}
              />
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

  // ----- UI -----
  const corrLabel = Number.isNaN(corr) ? "n/a" : corr.toFixed(2)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            AI Growth Suggestions & Projections
          </h1>
          <p className="text-muted-foreground">
            We analyze your selected datasets, generate insights, and chart
            potential growth. Adjust filters to explore relations— suggestions
            regenerate automatically.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="secondary">
            Company: {payload.companyId || "N/A"}
          </Badge>
          <Badge variant="outline">Clicks↔Views corr: {corrLabel}</Badge>
        </div>
      </div>

      {/* AI Filters */}
      <Card>
        <CardHeader>
          <CardTitle>AI Filters</CardTitle>
          <CardDescription>
            Choose datasets and context to guide the AI and projections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Datasets</div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeClicks}
                  onChange={(e) => setIncludeClicks(e.target.checked)}
                />
                Clicks
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includePageViews}
                  onChange={(e) => setIncludePageViews(e.target.checked)}
                />
                Page Views
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeUsers}
                  onChange={(e) => setIncludeUsers(e.target.checked)}
                />
                Users Per Day
              </label>

              <label className="flex items-center gap-2 text-sm mt-3">
                <input
                  type="checkbox"
                  checked={alignDates}
                  onChange={(e) => setAlignDates(e.target.checked)}
                />
                Align dates across datasets
              </label>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Dates</div>
              <div className="text-xs text-muted-foreground">
                Filter by specific dates (optional)
              </div>
              <div className="max-h-32 overflow-auto rounded border p-2 space-y-1">
                {allDates.map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedDates.includes(d)}
                      onChange={(e) =>
                        setSelectedDates((prev) =>
                          e.target.checked
                            ? [...prev, d]
                            : prev.filter((x) => x !== d)
                        )
                      }
                    />
                    {d}
                  </label>
                ))}
                {!allDates.length && (
                  <div className="text-xs text-muted-foreground">No dates</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Context filters</div>
              <div className="text-xs text-muted-foreground">
                These don’t slice aggregates but guide the AI.
              </div>

              {/* Buttons */}
              <div className="text-xs mt-1">Buttons</div>
              <div className="max-h-16 overflow-auto rounded border p-2 space-y-1">
                {uniqueButtons.length ? (
                  uniqueButtons.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedButtons.includes(b)}
                        onChange={(e) =>
                          setSelectedButtons((prev) =>
                            e.target.checked
                              ? [...prev, b]
                              : prev.filter((x) => x !== b)
                          )
                        }
                      />
                      {b}
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No button data
                  </div>
                )}
              </div>

              {/* Pages */}
              <div className="text-xs mt-2">Pages</div>
              <div className="max-h-16 overflow-auto rounded border p-2 space-y-1">
                {uniquePages.length ? (
                  uniquePages.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(p)}
                        onChange={(e) =>
                          setSelectedPages((prev) =>
                            e.target.checked
                              ? [...prev, p]
                              : prev.filter((x) => x !== p)
                          )
                        }
                      />
                      {p}
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No page data
                  </div>
                )}
              </div>

              {/* Countries */}
              <div className="text-xs mt-2">Countries</div>
              <div className="max-h-16 overflow-auto rounded border p-2 space-y-1">
                {uniqueCountries.length ? (
                  uniqueCountries.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(c)}
                        onChange={(e) =>
                          setSelectedCountries((prev) =>
                            e.target.checked
                              ? [...prev, c]
                              : prev.filter((x) => x !== c)
                          )
                        }
                      />
                      {c}
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No regional data
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Extra notes</div>
            <Textarea
              placeholder="Optional — e.g. “Primary KPI is trials → paid”, “Mobile hero A/B launching next week”."
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={() => generate(makePromptInput())}
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
              <span className="text-xs text-muted-foreground">
                Suggestions also regenerate automatically when filters change.
              </span>
            </div>
          </div>

          <Separator />

          <div className="rounded-md border p-4 whitespace-pre-wrap text-sm min-h-[120px]">
            {suggestions || (loading ? "Generating…" : "No suggestions yet.")}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {includeClicks ? (
          <ChartCard
            title="Projected Clicks (next 14 days)"
            data={projClicks}
            ImpactBadge={<ImpactBadge impact={impact} />}
          />
        ) : null}
        {includePageViews ? (
          <ChartCard
            title="Projected Page Views (next 14 days)"
            data={projViews}
            ImpactBadge={<ImpactBadge impact={impact} />}
          />
        ) : null}
      </div>
    </div>
  )
}

// Small components
function ImpactBadge({
  impact,
}: {
  impact: { min: number; max: number; mean: number } | null
}) {
  return impact ? (
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
}

function ChartCard({
  title,
  data,
  ImpactBadge,
}: {
  title: string
  data: ProjectionPoint[]
  ImpactBadge: React.ReactNode
}) {
  if (!data.length) return null
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex items-center justify-between gap-2 sm:flex-row sm:items-center">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" /> {title}
        </CardTitle>
        {ImpactBadge}
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Line
              type="monotone"
              dataKey="baseline"
              strokeWidth={2}
              dot={false}
            />
            <Line type="monotone" dataKey="low" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="mean"
              strokeWidth={3}
              dot={{ r: 2 }}
            />
            <Line type="monotone" dataKey="high" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-muted-foreground mt-2">
          Baseline shows recent history; projections show next 14 days using the
          AI’s expected impact.
        </div>
      </CardContent>
    </Card>
  )
}

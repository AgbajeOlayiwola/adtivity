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
import {
  CheckCircle2,
  Clipboard,
  Lightbulb,
  Loader2,
  Rocket,
  Star,
  Target,
  TrendingUp,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

// Optional Shadcn date-range picker (falls back to input[type=date] if not available)
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// ---------- Types ----------
type Point = { date: string; value: number }
type ProjectionPoint = {
  date: string
  baseline?: number | null
  low?: number | null
  mean?: number | null
  high?: number | null
}
type DateRange = { from: Date | null; to: Date | null }
type Web3Event = {
  timestamp?: string
  network?: string
  token_symbol?: string
  amount_usd?: number | string
  [k: string]: any
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
    .filter((d) => Number.isFinite(d.value))
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

function correlation(a: Point[], b: Point[]) {
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

// Parse impact ranges like "+5–12%" or "+7-15%" or "+10%"
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

// date helpers for "MM/DD"
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
function inRangeMD(mmdd: string, from: Date | null, to: Date | null): boolean {
  if (!from && !to) return true
  const x = mdToDate(mmdd).getTime()
  const lo = from ? from.getTime() : -Infinity
  const hi = to ? to.getTime() : Infinity
  return x >= lo && x <= hi
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
  const recent = series.slice(-14)
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

// ---------- Web3 helpers (events -> per-day aggregates) ----------
function groupWeb3DailyCount(
  events: Web3Event[],
  opts: {
    range?: DateRange
    networks?: string[]
    tokenSymbols?: string[]
    minUsd?: number
  } = {}
): Point[] {
  const map = new Map<string, number>()
  const netSet = opts.networks?.length ? new Set(opts.networks) : null
  const tokSet = opts.tokenSymbols?.length
    ? new Set(opts.tokenSymbols.map((s) => s.toLowerCase()))
    : null
  const minUsd = Number.isFinite(opts.minUsd as number)
    ? Number(opts.minUsd)
    : 0

  for (const e of events || []) {
    if (!e?.timestamp) continue
    const t = new Date(e.timestamp)
    if (opts.range?.from && t < opts.range.from) continue
    if (opts.range?.to && t > opts.range.to) continue
    if (netSet && e.network && !netSet.has(e.network)) continue
    if (
      tokSet &&
      e.token_symbol &&
      !tokSet.has(String(e.token_symbol).toLowerCase())
    )
      continue
    const usd = Number(e.amount_usd || 0) || 0
    if (usd < minUsd) continue
    const key = dateToMD(t)
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => mdToDate(a.date).getTime() - mdToDate(b.date).getTime())
}

function groupWeb3DailyUsd(
  events: Web3Event[],
  opts: {
    range?: DateRange
    networks?: string[]
    tokenSymbols?: string[]
    minUsd?: number
  } = {}
): Point[] {
  const map = new Map<string, number>()
  const netSet = opts.networks?.length ? new Set(opts.networks) : null
  const tokSet = opts.tokenSymbols?.length
    ? new Set(opts.tokenSymbols.map((s) => s.toLowerCase()))
    : null
  const minUsd = Number.isFinite(opts.minUsd as number)
    ? Number(opts.minUsd)
    : 0

  for (const e of events || []) {
    if (!e?.timestamp) continue
    const t = new Date(e.timestamp)
    if (opts.range?.from && t < opts.range.from) continue
    if (opts.range?.to && t > opts.range.to) continue
    if (netSet && e.network && !netSet.has(e.network)) continue
    if (
      tokSet &&
      e.token_symbol &&
      !tokSet.has(String(e.token_symbol).toLowerCase())
    )
      continue
    const usd = Number(e.amount_usd || 0) || 0
    if (usd < minUsd) continue
    const key = dateToMD(t)
    map.set(key, (map.get(key) || 0) + usd)
  }
  return Array.from(map.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => mdToDate(a.date).getTime() - mdToDate(b.date).getTime())
}

// ---------- Prompt ----------
function buildGrowthPrompt(input: any) {
  const clicksSeries = input.datasets?.clicks
    ? (input.datasets.clicks as Point[])
    : null
  const pageViewsSeries = input.datasets?.pageViews
    ? (input.datasets.pageViews as Point[])
    : null
  const web3TxSeries = input.datasets?.web3Tx
    ? (input.datasets.web3Tx as Point[])
    : null
  const web3UsdSeries = input.datasets?.web3Usd
    ? (input.datasets.web3Usd as Point[])
    : null

  const clicksStats = clicksSeries ? summarize(clicksSeries) : null
  const pvStats = pageViewsSeries ? summarize(pageViewsSeries) : null
  const w3TxStats = web3TxSeries ? summarize(web3TxSeries) : null
  const w3UsdStats = web3UsdSeries ? summarize(web3UsdSeries) : null

  const activeFilters = input.activeFilters
    ? JSON.stringify(input.activeFilters)
    : "{}"

  const list = (title: string, s: Point[] | null, sum: any) =>
    s
      ? `${title}
${s.map((d: any) => `- ${d.date}: ${d.value}`).join("\n")}
Summary: total=${sum.total}, avg=${sum.avg.toFixed(2)}, last=${sum.last}, max=${
          sum.max
        }, min=${sum.min}, trend_vs_first=${(sum.trend * 100).toFixed(1)}%`
      : `${title}: none`

  return `
You are a growth analyst. Based on the telemetry (web, product, and web3), produce concrete, prioritized growth suggestions.
- Output: 6–10 bullet points. Each: [Insight] + [Action] + [Expected impact].
- Include at least one suggestion connecting Web and Web3 if data correlates.
- Optimize for low eng lift where possible.

Context:
- Company: ${input.companyId || "N/A"}
- Timeframe: ${input.timeRange?.startDate || "?"} to ${
    input.timeRange?.endDate || "now"
  }
- Filters: ${JSON.stringify(input.filters || {})}
- AI Filters (user-selected): ${activeFilters}
- Extra notes from user: ${input.notes || "-"}

${list("Clicks (date,value)", clicksSeries, clicksStats)}
${list("Page Views (date,value)", pageViewsSeries, pvStats)}
${list("Web3 TX Count (date,value)", web3TxSeries, w3TxStats)}
${list("Web3 USD Volume (date,value)", web3UsdSeries, w3UsdStats)}
  `.trim()
}

// ---------- Suggestions parsing / UI ----------
type ParsedSuggestion = {
  id: string
  raw: string
  impact: { min: number; max: number; mean: number } | null
  tags: string[]
}

function splitSuggestions(text: string): string[] {
  if (!text?.trim()) return []
  const lines = text.replace(/\r\n/g, "\n").split("\n")

  const bullets: string[] = []
  const startRe = /^\s*(?:[-•–—]\s+|\d{1,2}[.)]\s+)/ // - • – — or 1. / 1)
  let current = ""

  for (const line of lines) {
    if (startRe.test(line)) {
      if (current.trim()) bullets.push(current.trim())
      current = line.replace(startRe, "").trim()
    } else {
      // continuation of the current bullet
      current += (current ? " " : "") + line.trim()
    }
  }
  if (current.trim()) bullets.push(current.trim())

  // Fallback: if we didn't detect bullets, split by double newlines
  if (bullets.length === 0) {
    return text
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return bullets
}

function parseSuggestionsToCards(text: string): ParsedSuggestion[] {
  const items = splitSuggestions(text)
  return items.map((raw, idx) => {
    const imp = parseImpactRange(raw)
    const tagSet = new Set<string>()
    if (
      /web3|onchain|on-chain|wallet|token|nft|solana|ethereum|polygon|bsc|arbitrum|base|optimism/i.test(
        raw
      )
    )
      tagSet.add("Web3")
    if (/seo|organic|search|content/i.test(raw)) tagSet.add("SEO")
    if (/email|newsletter/i.test(raw)) tagSet.add("Email")
    if (/paid|cpc|cpm|ads?|campaign/i.test(raw)) tagSet.add("Paid")
    if (/conversion|activate|trial|signup|onboarding|landing/i.test(raw))
      tagSet.add("Activation")
    if (/retention|churn|cohort/i.test(raw)) tagSet.add("Retention")
    return {
      id: `sg-${idx}`,
      raw,
      impact: imp,
      tags: Array.from(tagSet),
    }
  })
}

function impactTone(imp: ParsedSuggestion["impact"]) {
  if (!imp) return { intent: "neutral", classes: "border-border" }
  const m = imp.mean
  if (m >= 15) return { intent: "hot", classes: "border-rose-400/50" }
  if (m >= 8) return { intent: "good", classes: "border-emerald-400/50" }
  if (m > 0) return { intent: "mild", classes: "border-sky-400/50" }
  return { intent: "neutral", classes: "border-border" }
}

function SuggestionCard({
  sug,
  onCopy,
  featured = false,
}: {
  sug: ParsedSuggestion
  onCopy: (id: string) => void
  featured?: boolean
}) {
  const tone = impactTone(sug.impact)
  return (
    <Card
      className={cn(
        "relative transition hover:shadow-md border-2",
        featured ? "bg-card/60 backdrop-blur-sm" : "bg-card/40",
        tone.classes
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug flex items-center gap-2">
            {featured ? (
              <Rocket className="h-4 w-4" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
            Idea
          </CardTitle>
          <div className="flex items-center gap-2">
            {sug.impact ? (
              <Badge variant="secondary">
                Impact ~ {sug.impact.mean.toFixed(1)}%{" "}
                {sug.impact.min !== sug.impact.max
                  ? `(${sug.impact.min.toFixed(0)}–${sug.impact.max.toFixed(
                      0
                    )}%)`
                  : ""}
              </Badge>
            ) : (
              <Badge variant="outline">Impact n/a</Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onCopy(sug.id)}
              title="Copy"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {sug.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
          {sug.tags.length === 0 && <Badge variant="outline">General</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{sug.raw}</p>
      </CardContent>
    </Card>
  )
}

function SuggestionsPanel({
  text,
  loading,
}: {
  text: string
  loading: boolean
}) {
  const [copied, setCopied] = React.useState<string | null>(null)
  const [sortBy, setSortBy] = React.useState<"impact" | "original">("impact")
  const parsed = React.useMemo(() => parseSuggestionsToCards(text), [text])

  const sorted = React.useMemo(() => {
    if (sortBy === "original") return parsed
    // sort by mean impact desc; items without impact go to end
    return [...parsed].sort((a, b) => {
      const am = a.impact ? a.impact.mean : -Infinity
      const bm = b.impact ? b.impact.mean : -Infinity
      return bm - am
    })
  }, [parsed, sortBy])

  const top = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  const onCopy = async (id: string) => {
    const s = parsed.find((x) => x.id === id)
    if (!s) return
    try {
      await navigator.clipboard.writeText(s.raw)
      setCopied(id)
      setTimeout(() => setCopied(null), 1200)
    } catch {}
  }

  if (loading) {
    return (
      <div className="rounded-md border p-6 text-sm flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating…
      </div>
    )
  }

  if (!text?.trim()) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        No suggestions yet. Pick datasets and click <strong>Generate</strong>.
      </div>
    )
  }

  // Error passthrough
  if (text.startsWith("Error:")) {
    return (
      <div className="rounded-md border border-red-300/60 p-4 text-sm text-red-600 bg-red-50">
        {text}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">Suggestions</span>
          <Badge variant="outline">{parsed.length}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort:</span>
          <Button
            size="sm"
            variant={sortBy === "impact" ? "default" : "outline"}
            onClick={() => setSortBy("impact")}
          >
            <Star className="h-4 w-4 mr-1" /> Highest impact
          </Button>
          <Button
            size="sm"
            variant={sortBy === "original" ? "default" : "outline"}
            onClick={() => setSortBy("original")}
          >
            Original order
          </Button>
        </div>
      </div>

      {/* Top picks */}
      {top.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Top picks
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {top.map((s) => (
              <div key={s.id} className="relative">
                <SuggestionCard sug={s} onCopy={onCopy} featured />
                {copied === s.id && (
                  <div className="absolute top-2 right-2 text-emerald-600 flex items-center gap-1 text-xs bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Copied
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* More ideas */}
      {rest.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            More ideas
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {rest.map((s) => (
              <div key={s.id} className="relative">
                <SuggestionCard sug={s} onCopy={onCopy} />
                {copied === s.id && (
                  <div className="absolute top-2 right-2 text-emerald-600 flex items-center gap-1 text-xs bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Copied
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw (collapsible) */}
      <details className="rounded-md border p-3 bg-muted/20">
        <summary className="cursor-pointer text-sm font-medium">
          Show raw AI output
        </summary>
        <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
          {text}
        </pre>
      </details>
    </div>
  )
}

// ---------- UI helpers ----------
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
  impact,
}: {
  title: string
  data: ProjectionPoint[]
  impact: { min: number; max: number; mean: number } | null
}) {
  if (!data.length) return null
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex items-center justify-between gap-2 sm:flex-row sm:items-center">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" /> {title}
        </CardTitle>
        <ImpactBadge impact={impact} />
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

// ---------- Page ----------
export default function Page() {
  // 1) Payload from Redux; 2) fallback to localStorage
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

  // ----- Date range state -----
  const inferFirstDate = React.useMemo(() => {
    const all = [...(ds.clicks || []), ...(ds.pageViews || [])]
    if (!all.length) return null
    const sorted = [...all].sort(
      (a: any, b: any) =>
        mdToDate(a.date).getTime() - mdToDate(b.date).getTime()
    )
    return mdToDate(sorted[0].date)
  }, [ds.clicks, ds.pageViews])

  const inferLastDate = React.useMemo(() => {
    const all = [...(ds.clicks || []), ...(ds.pageViews || [])]
    if (!all.length) return null
    const sorted = [...all].sort(
      (a: any, b: any) =>
        mdToDate(b.date).getTime() - mdToDate(a.date).getTime()
    )
    return mdToDate(sorted[0].date)
  }, [ds.clicks, ds.pageViews])

  const initialFrom = payload.timeRange?.startDate
    ? new Date(payload.timeRange.startDate)
    : inferFirstDate || null
  const initialTo = payload.timeRange?.endDate
    ? new Date(payload.timeRange.endDate)
    : inferLastDate || null

  const [range, setRange] = React.useState<DateRange>({
    from: initialFrom,
    to: initialTo,
  })

  // ----- Dataset selection (derived from Redux) -----
  const selectedSet = React.useMemo(
    () =>
      new Set<string>(Array.isArray(payload.selected) ? payload.selected : []),
    [payload.selected]
  )
  const includeClicks = selectedSet.has("clicks")
  const includePageViews = selectedSet.has("pageViews")
  const includeUsers = selectedSet.has("usersPerDay")
  // allow either "web3Events" or "web3Tx" as keys for tx count
  const includeWeb3Tx =
    selectedSet.has("web3Events") || selectedSet.has("web3Tx")
  const includeWeb3Usd = selectedSet.has("web3Usd")

  // Web3 filters
  const web3Events: Web3Event[] = Array.isArray(ds.web3Events)
    ? ds.web3Events
    : []
  const showWeb3Section =
    includeWeb3Tx || includeWeb3Usd || web3Events.length > 0

  const web3Networks = React.useMemo(() => {
    const s = new Set<string>()
    web3Events.forEach((e) => {
      if (e.network) s.add(e.network)
    })
    return Array.from(s).sort()
  }, [web3Events])

  const web3TokenSymbols = React.useMemo(() => {
    const s = new Set<string>()
    web3Events.forEach((e) => {
      if (e.token_symbol) s.add(String(e.token_symbol))
    })
    return Array.from(s).sort((a, b) => a.localeCompare(b))
  }, [web3Events])

  const [selectedNetworks, setSelectedNetworks] = React.useState<string[]>([])
  const [selectedTokens, setSelectedTokens] = React.useState<string[]>([])
  const [minUsd, setMinUsd] = React.useState<number>(0)

  // ----- Derived series by filters -----
  const clicksSeriesAll = includeClicks ? toSeries(ds.clicks || []) : []
  const pageViewsSeriesAll = includePageViews
    ? toSeries(ds.pageViews || [])
    : []

  const clicksSeries = React.useMemo(
    () =>
      clicksSeriesAll.filter((p) => inRangeMD(p.date, range.from, range.to)),
    [clicksSeriesAll, range]
  )
  const pageViewsSeries = React.useMemo(
    () =>
      pageViewsSeriesAll.filter((p) => inRangeMD(p.date, range.from, range.to)),
    [pageViewsSeriesAll, range]
  )

  const web3TxSeries = React.useMemo(
    () =>
      includeWeb3Tx
        ? groupWeb3DailyCount(web3Events, {
            range,
            networks: selectedNetworks,
            tokenSymbols: selectedTokens,
            minUsd,
          })
        : [],
    [includeWeb3Tx, web3Events, range, selectedNetworks, selectedTokens, minUsd]
  )
  const web3UsdSeries = React.useMemo(
    () =>
      includeWeb3Usd
        ? groupWeb3DailyUsd(web3Events, {
            range,
            networks: selectedNetworks,
            tokenSymbols: selectedTokens,
            minUsd,
          })
        : [],
    [
      includeWeb3Usd,
      web3Events,
      range,
      selectedNetworks,
      selectedTokens,
      minUsd,
    ]
  )

  // Correlations
  const corrCV = React.useMemo(
    () =>
      includeClicks && includePageViews
        ? correlation(clicksSeries, pageViewsSeries)
        : NaN,
    [includeClicks, includePageViews, clicksSeries, pageViewsSeries]
  )
  const corrCW3 = React.useMemo(
    () =>
      includeClicks && includeWeb3Tx
        ? correlation(clicksSeries, web3TxSeries)
        : NaN,
    [includeClicks, includeWeb3Tx, clicksSeries, web3TxSeries]
  )
  const corrVW3 = React.useMemo(
    () =>
      includePageViews && includeWeb3Tx
        ? correlation(pageViewsSeries, web3TxSeries)
        : NaN,
    [includePageViews, includeWeb3Tx, pageViewsSeries, web3TxSeries]
  )

  // ----- Suggestions & generation -----
  const [extraNotes, setExtraNotes] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)

  const activeAIFilters = React.useMemo(
    () => ({
      include: {
        clicks: includeClicks,
        pageViews: includePageViews,
        usersPerDay: includeUsers,
        web3Tx: includeWeb3Tx,
        web3Usd: includeWeb3Usd,
      },
      dateRange: {
        from: range.from ? range.from.toISOString().slice(0, 10) : null,
        to: range.to ? range.to.toISOString().slice(0, 10) : null,
      },
      web3: {
        networks: selectedNetworks,
        tokens: selectedTokens,
        minUsd,
      },
    }),
    [
      includeClicks,
      includePageViews,
      includeUsers,
      includeWeb3Tx,
      includeWeb3Usd,
      range,
      selectedNetworks,
      selectedTokens,
      minUsd,
    ]
  )

  function makePromptInput() {
    const datasets: any = {}
    if (includeClicks) datasets.clicks = clicksSeries
    if (includePageViews) datasets.pageViews = pageViewsSeries
    if (includeWeb3Tx) datasets.web3Tx = web3TxSeries
    if (includeWeb3Usd) datasets.web3Usd = web3UsdSeries

    return {
      companyId: payload.companyId ?? null,
      timeRange: {
        startDate: activeAIFilters.dateRange.from,
        endDate: activeAIFilters.dateRange.to,
      },
      filters: payload.filters ?? {},
      datasets,
      activeFilters: activeAIFilters,
      notes: extraNotes,
    }
  }

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

  // Auto-generate when payload arrives
  React.useEffect(() => {
    if (payload && (payload.datasets || payload.selected)) {
      generate(makePromptInput())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!payload])

  // Regenerate when any filter OR Redux selection changes
  const selectedKey = React.useMemo(
    () => JSON.stringify(payload?.selected || []),
    [payload?.selected]
  )
  React.useEffect(() => {
    if (!payload) return
    generate(makePromptInput())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    range.from?.getTime(),
    range.to?.getTime(),
    selectedNetworks.join(","),
    selectedTokens.join(","),
    minUsd,
    selectedKey, // 🔁 regenerate on Redux selection change
  ])

  // ----- Impact & projections — memoized -----
  const impact = React.useMemo(
    () => parseImpactRange(suggestions || ""),
    [suggestions]
  )

  const projClicks = React.useMemo(
    () => (includeClicks ? buildProjection(clicksSeries, impact, 14) : []),
    [includeClicks, clicksSeries, impact]
  )
  const projViews = React.useMemo(
    () =>
      includePageViews ? buildProjection(pageViewsSeries, impact, 14) : [],
    [includePageViews, pageViewsSeries, impact]
  )
  const projW3Tx = React.useMemo(
    () => (includeWeb3Tx ? buildProjection(web3TxSeries, impact, 14) : []),
    [includeWeb3Tx, web3TxSeries, impact]
  )
  const projW3Usd = React.useMemo(
    () => (includeWeb3Usd ? buildProjection(web3UsdSeries, impact, 14) : []),
    [includeWeb3Usd, web3UsdSeries, impact]
  )

  // ----- UI -----
  const corrFmt = (x: number) => (Number.isNaN(x) ? "n/a" : x.toFixed(2))

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            AI Growth Suggestions & Projections
          </h1>
          <p className="text-muted-foreground">
            We analyze your selected web & web3 datasets, generate insights, and
            chart potential growth. Adjust filters—suggestions regenerate
            automatically.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="secondary">
            Company: {payload.companyId || "N/A"}
          </Badge>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">Clicks↔Views: {corrFmt(corrCV)}</Badge>
            <Badge variant="outline">Clicks↔Web3 TX: {corrFmt(corrCW3)}</Badge>
            <Badge variant="outline">Views↔Web3 TX: {corrFmt(corrVW3)}</Badge>
          </div>
        </div>
      </div>

      {/* AI Filters */}
      <Card>
        <CardHeader>
          <CardTitle>AI Filters</CardTitle>
          <CardDescription>
            Pick a date range, review selected datasets (controlled by your data
            panel), and optionally filter Web3 for deeper analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Date Range</div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[260px] justify-start text-left font-normal",
                        !range.from && "text-muted-foreground"
                      )}
                    >
                      {range.from ? (
                        range.to ? (
                          <>
                            {range.from.toISOString().slice(0, 10)} —{" "}
                            {range.to.toISOString().slice(0, 10)}
                          </>
                        ) : (
                          range.from.toISOString().slice(0, 10)
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: range.from ?? undefined,
                        to: range.to ?? undefined,
                      }}
                      onSelect={(v: any) =>
                        setRange({ from: v?.from ?? null, to: v?.to ?? null })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Fallback native inputs */}
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm"
                  value={
                    range.from ? range.from.toISOString().slice(0, 10) : ""
                  }
                  onChange={(e) =>
                    setRange((r) => ({
                      ...r,
                      from: e.target.value ? new Date(e.target.value) : null,
                    }))
                  }
                />
                <span className="text-muted-foreground text-xs">to</span>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm"
                  value={range.to ? range.to.toISOString().slice(0, 10) : ""}
                  onChange={(e) =>
                    setRange((r) => ({
                      ...r,
                      to: e.target.value ? new Date(e.target.value) : null,
                    }))
                  }
                />
              </div>
              <div className="text-xs text-muted-foreground">
                We’ll slice series to this window before sending to the AI.
              </div>
            </div>

            {/* Redux-driven dataset selection (read-only here) */}
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Datasets (from selection)
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeClicks} disabled />
                  Clicks
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includePageViews} disabled />
                  Page Views
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeUsers} disabled />
                  Users Per Day (context)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeWeb3Tx} disabled />
                  Web3 TX Count
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={includeWeb3Usd} disabled />
                  Web3 USD Volume
                </label>
              </div>
              <div className="text-xs text-muted-foreground">
                Change dataset selection in your main data panel; this view
                mirrors it automatically.
              </div>
            </div>
          </div>

          {/* Web3 filters — only when analyzing Web3 */}
          {showWeb3Section && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Web3 Networks</div>
                <div className="max-h-28 overflow-auto rounded border p-2 space-y-1 text-sm">
                  {web3Networks.length ? (
                    web3Networks.map((n) => (
                      <label key={n} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedNetworks.includes(n)}
                          onChange={(e) =>
                            setSelectedNetworks((prev) =>
                              e.target.checked
                                ? [...prev, n]
                                : prev.filter((x) => x !== n)
                            )
                          }
                        />
                        {n}
                      </label>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      No networks in data
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Token Symbols</div>
                <div className="max-h-28 overflow-auto rounded border p-2 space-y-1 text-sm">
                  {web3TokenSymbols.length ? (
                    web3TokenSymbols.map((t) => (
                      <label key={t} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTokens.includes(t)}
                          onChange={(e) =>
                            setSelectedTokens((prev) =>
                              e.target.checked
                                ? [...prev, t]
                                : prev.filter((x) => x !== t)
                            )
                          }
                        />
                        {t}
                      </label>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      No token symbols in data
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">
                  Min USD (per event)
                </div>
                <input
                  type="number"
                  className="border rounded px-2 py-1 text-sm w-full"
                  value={minUsd}
                  min={0}
                  onChange={(e) => setMinUsd(Number(e.target.value || 0))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Only include web3 events with amount_usd ≥ this value.
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Extra notes</div>
            <Textarea
              placeholder="Optional — e.g. “Primary KPI is trials”, “We launched a web3 reward on 09/28”, “Focus on Polygon only”."
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

          {/* Suggestions panel */}
          <SuggestionsPanel text={suggestions} loading={loading} />
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {includeClicks && (
          <ChartCard
            title="Projected Clicks (next 14 days)"
            data={projClicks}
            impact={impact}
          />
        )}
        {includePageViews && (
          <ChartCard
            title="Projected Page Views (next 14 days)"
            data={projViews}
            impact={impact}
          />
        )}
        {includeWeb3Tx && (
          <ChartCard
            title="Projected Web3 TX Count (next 14 days)"
            data={projW3Tx}
            impact={impact}
          />
        )}
        {includeWeb3Usd && (
          <ChartCard
            title="Projected Web3 USD Volume (next 14 days)"
            data={projW3Usd}
            impact={impact}
          />
        )}
      </div>
    </div>
  )
}

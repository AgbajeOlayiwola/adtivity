import {
  BarChartBig,
  Bird,
  BookOpenText,
  Boxes,
  Bug,
  Compass,
  Cpu,
  Database,
  FileText,
  Flag,
  Flame,
  FlaskConical,
  Gauge,
  Layers3,
  LineChart,
  Link2,
  Megaphone,
  MessageSquare,
  MessageSquareMore,
  MousePointerClick,
  Network,
  PenLine,
  Rocket,
  SearchCode,
  ShieldCheck,
  TestTubes,
  Wrench,
} from "lucide-react"
import { useMemo, useState } from "react"

/**
 * Drop-in replacement for your FeaturesSection with:
 *  - Category filter (All, Product, Marketing, Support, Sales, AI, Data, Engineering, Web3)
 *  - Status filter (All, Available, In Development, Coming Soon)
 *  - "Coming Soon" highlight mode
 *  - PostHog-style product areas
 *
 * TailwindCSS required. No external UI lib usage.
 * If you already have a <FeatureCard /> component, you can remove the inline one below and keep your import.
 */

// Inline FeatureCard (minimal). Remove if you prefer your own.
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  status,
  categories,
  highlight,
}: any) => {
  return (
    <div
      className={[
        "group relative rounded-2xl border bg-card p-6 shadow-sm transition",
        "hover:shadow-md hover:-translate-y-0.5",
        highlight ? "ring-2 ring-yellow-400/60" : "ring-0",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl border p-3">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-xl tracking-tight">{title}</h3>
            <StatusBadge status={status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c: any) => (
              <span
                key={c}
                className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type StatusType = "Available" | "In Development" | "Coming Soon"

const StatusBadge = ({ status }: { status: StatusType }) => {
  const map: Record<StatusType, string> = {
    Available: "bg-emerald-500/10 text-emerald-700 border-emerald-600/20",
    "In Development": "bg-amber-500/10 text-amber-700 border-amber-600/20",
    "Coming Soon": "bg-slate-500/10 text-slate-700 border-slate-600/20",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

const CATEGORIES = [
  "All",
  "Product",
  "Marketing",
  "Support",
  "Sales",
  "AI",
  "Data",
  "Engineering",
  "Web3",
]

const STATUSES = ["All", "Available", "In Development", "Coming Soon"]

// Unified feature registry (PostHog-style groups + your existing Web3 features)
const FEATURE_REGISTRY = [
  // == CURRENTLY AVAILABLE ==
  {
    icon: MousePointerClick,
    title: "Web Analytics",
    description:
      "Capture clicks, page views, sessions, and users out-of-the-box.",
    status: "Available",
    categories: ["Marketing"],
  },
  {
    icon: BarChartBig,
    title: "Unified Web3 KPI Dashboard",
    description:
      "Track key on-chain and off-chain metrics for EVM and Solana ecosystems with a comprehensive dashboard.",
    status: "Available",
    categories: ["Web3"],
  },
  {
    icon: SearchCode,
    title: "Smart Contract Analytics",
    description:
      "Deep dive into smart contract interactions, user behavior, and transaction patterns across supported chains.",
    status: "Available",
    categories: ["Web3"],
  },
  {
    icon: Network,
    title: "Solana dApp Integration",
    description:
      "Track user activity and on-chain events for Solana apps with first-class adapters.",
    status: "Available",
    categories: ["Web3"],
  },
  {
    icon: Link2,
    title: "Multi-Channel Attribution",
    description:
      "Understand which channels drive acquisition and engagement across Solana and EVM.",
    status: "Available",
    categories: ["Web3", "Marketing"],
  },
  {
    icon: FileText,
    title: "Custom Cross-Chain Reports",
    description:
      "Generate and export customizable reports on users, token flows, and campaigns.",
    status: "Available",
    categories: ["Web3", "Data"],
  },
  {
    icon: Cpu,
    title: "NFT & DeFi Insights",
    description:
      "Modules for NFT performance and DeFi protocol engagement, including Solana-based assets.",
    status: "Available",
    categories: ["Web3"],
  },
  {
    icon: Bird,
    title: "Twitter Analytics",
    description:
      "Profile and post analytics to measure growth and engagement for Web3 and community campaigns.",
    status: "Available",
    categories: ["Marketing"],
  },
  {
    icon: PenLine,
    title: "Content Generation",
    description:
      "AI-assisted captions, threads, and creative ideas tailored to your audiences.",
    status: "Available",
    categories: ["Marketing", "AI"],
  },

  // == IN DEVELOPMENT ==
  {
    icon: LineChart,
    title: "Product Analytics",
    description:
      "Funnels, cohorts, retention, and usage analytics across platforms.",
    status: "In Development",
    categories: ["Product"],
  },
  {
    icon: Gauge,
    title: "Experiments",
    description:
      "A/B and multivariate testing with guardrails and metrics you trust.",
    status: "In Development",
    categories: ["Product", "Marketing"],
  },
  {
    icon: Rocket,
    title: "Product Tours",
    description:
      "Guide new users with contextual tours and checklists inside your app.",
    status: "In Development",
    categories: ["Product"],
  },
  {
    icon: TestTubes,
    title: "LLM Analytics",
    description:
      "Track prompts, latencies, costs, and outcomes across providers and models.",
    status: "In Development",
    categories: ["AI"],
  },
  {
    icon: FlaskConical,
    title: "Prompt Evaluation",
    description:
      "Offline/online evals, regressions, and synthetic tests for your AI features.",
    status: "In Development",
    categories: ["AI"],
  },
  {
    icon: Wrench,
    title: "Prompt Management",
    description:
      "Versioning, review flows, and safe rollout for prompts and templates.",
    status: "In Development",
    categories: ["AI"],
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    description:
      "Lifecycle messages and event-triggered outreach across email and in-app.",
    status: "In Development",
    categories: ["Marketing"],
  },
  {
    icon: Flag,
    title: "Feature Flags",
    description: "Targeted rollouts and kill switches with audit trails.",
    status: "In Development",
    categories: ["Engineering"],
  },
  {
    icon: BookOpenText,
    title: "AI Docs Chat",
    description:
      "Let users chat with your docs using retrieval and grounded answers.",
    status: "In Development",
    categories: ["Support", "AI"],
  },

  // == COMING SOON ==
  {
    icon: Compass,
    title: "Session Replay",
    description: "Watch anonymized sessions to debug UX and find friction.",
    status: "Coming Soon",
    categories: ["Product", "Engineering"],
  },
  {
    icon: MessageSquareMore,
    title: "Surveys",
    description:
      "Collect qualitative feedback with targeted, in-product surveys.",
    status: "Coming Soon",
    categories: ["Product", "Marketing"],
  },
  {
    icon: Layers3,
    title: "Product Roadmaps",
    description: "Publish public/partner roadmaps and collect votes.",
    status: "Coming Soon",
    categories: ["Product"],
  },
  {
    icon: Boxes,
    title: "CDP",
    description: "Unified profiles and audiences across tools and channels.",
    status: "Coming Soon",
    categories: ["Data"],
  },
  {
    icon: Database,
    title: "Data Warehouse",
    description: "Warehouse-native modeling and reverse ETL.",
    status: "Coming Soon",
    categories: ["Data"],
  },
  {
    icon: BarChartBig,
    title: "Embedded Analytics",
    description:
      "Bring dashboards into your product with SSO and row-level security.",
    status: "Coming Soon",
    categories: ["Data", "Product"],
  },
  {
    icon: LineChart,
    title: "Revenue Analytics",
    description: "Self-serve revenue and unit economics for GTM teams.",
    status: "Coming Soon",
    categories: ["Sales"],
  },
  {
    icon: ShieldCheck,
    title: "CRM",
    description: "Lightweight CRM geared for product-led motions.",
    status: "Coming Soon",
    categories: ["Sales"],
  },
  {
    icon: Bug,
    title: "Error Tracking",
    description: "Catch, alert, and triage exceptions tied to user impact.",
    status: "Coming Soon",
    categories: ["Engineering"],
  },
  {
    icon: Flame,
    title: "MCP Server",
    description:
      "Model Context Protocol server to integrate tools and memory safely.",
    status: "Coming Soon",
    categories: ["AI", "Engineering"],
  },
  {
    icon: MessageSquare,
    title: "Issue Tracker",
    description: "From bug to shipped with triage, ownership, and SLA views.",
    status: "Coming Soon",
    categories: ["Support", "Engineering"],
  },
  {
    icon: Megaphone,
    title: "No‑code A/B Testing",
    description:
      "Launch experiments without touching code for selected surfaces.",
    status: "Coming Soon",
    categories: ["Marketing", "Product"],
  },
  {
    icon: MessageSquareMore,
    title: "Heatmaps",
    description:
      "Visualize attention and scroll depth across pages and screens.",
    status: "Coming Soon",
    categories: ["Marketing"],
  },
]

const Pill = ({ active, children, onClick }: any) => (
  <button
    onClick={onClick}
    className={[
      "rounded-full border px-3 py-1 text-sm transition",
      active ? "bg-foreground text-background" : "hover:bg-muted",
    ].join(" ")}
  >
    {children}
  </button>
)

const FeaturesSection = () => {
  const [category, setCategory] = useState("All")
  const [status, setStatus] = useState("All")

  const showComingSoonHighlight = status === "Coming Soon"

  const filtered = useMemo(() => {
    return FEATURE_REGISTRY.filter((f) => {
      const categoryOk = category === "All" || f.categories.includes(category)
      const statusOk = status === "All" || f.status === status
      return categoryOk && statusOk
    })
  }, [category, status])

  const counts = useMemo(() => {
    const byStatus = FEATURE_REGISTRY.reduce(
      (acc: any, f) => {
        acc.total += 1
        acc[f.status] = (acc[f.status] || 0) + 1
        return acc
      },
      { total: 0 }
    )
    return byStatus // { total, Available, 'In Development', 'Coming Soon' }
  }, [])

  return (
    <section id="features" className="py-20 md:py-28 z-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Unlock{" "}
            <span className="bg-clip-text text-transparent bg-futuristic-gradient">
              Cross-Chain Growth
            </span>{" "}
            with Adtivity
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Measure, attribute, and optimize across Web, AI, and Web3 — inspired
            by PostHog’s clarity, built for modern stacks.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Pill
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </Pill>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {STATUSES.map((s) => (
              <Pill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s}
                {s !== "All" && (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[10px]">
                    {counts[s] || 0}
                  </span>
                )}
              </Pill>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <StatusBadge status="Available" />
            <StatusBadge status="In Development" />
            <StatusBadge status="Coming Soon" />
          </div>
          <div className="opacity-80">
            Showing <span className="font-medium">{filtered.length}</span> of{" "}
            <span className="font-medium">{counts.total}</span> features
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((feature, i) => (
            <FeatureCard
              key={`${feature.title}-${i}`}
              {...feature}
              highlight={
                showComingSoonHighlight && feature.status === "Coming Soon"
              }
            />
          ))}
        </div>

        {/* Helper text for Coming Soon selection */}
        {showComingSoonHighlight && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            You’ve selected <span className="font-medium">Coming Soon</span>. We
            highlighted roadmap items so you can scan fast.
          </p>
        )}
      </div>
    </section>
  )
}

export default FeaturesSection

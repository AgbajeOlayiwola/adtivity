"use client"

import { Modal } from "@/components/modal"
import { MultiStepForm } from "@/components/MultiStepForm"
import { Button } from "@/components/ui/button"
import {
  useCreatedtweetersQuery,
  useTwitterMentionsAnalyticsQuery,
  useTwitterFollowersQuery,
  useTweetsQuery,
} from "@/redux/api/queryApi"
import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { z } from "zod"
import KOLAnalysisModal from "@/components/kol-analysis-modal"

// ---------------------- helpers ----------------------
const transformMentions = (
  mentionsByDate: Record<string, number> | Array<any> | undefined
) => {
  // Handle array format from API
  if (Array.isArray(mentionsByDate)) {
    return mentionsByDate.map((item) => ({
      date: item.date || "Unknown",
      mentions: item.mentions ?? 0,
      likes: item.likes ?? 0,
    }))
  }
  // Handle object format
  if (!mentionsByDate || Object.keys(mentionsByDate).length === 0) return []
  return Object.keys(mentionsByDate).map((date) => ({
    date,
    mentions: mentionsByDate[date] ?? 0,
  }))
}

const transformFollowers = (
  followersByDate: Record<string, number> | Array<any> | undefined
) => {
  // Handle array format from API
  if (Array.isArray(followersByDate)) {
    return followersByDate.map((item) => ({
      date: item.date || "Unknown",
      followers: item.followers ?? 0,
    }))
  }
  // Handle object format
  if (!followersByDate || Object.keys(followersByDate).length === 0) return []
  return Object.keys(followersByDate).map((date) => ({
    date,
    followers: followersByDate[date] ?? 0,
  }))
}

const percent = (num?: number, denom?: number) => {
  if (!denom || denom <= 0 || !Number.isFinite(denom)) return "N/A"
  const v = ((num || 0) / denom) * 100
  return `${v.toFixed(2)}%`
}

const safeToLocale = (n?: number) =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString() : "N/A"

// ---------------------- schema ----------------------
const loginSchema = z.object({
  userName: z.string().min(1, { message: "Username cannot be empty." }),
})

// ---------------------- types ----------------------
type TweetIdea = {
  id: string
  text: string
  estimates?: {
    mentions?: number
    likes?: number
    retweets?: number
  }
}

export default function TwitterAnalyticsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [kolModalOpen, setKolModalOpen] = useState(false)
  const { profile }: any = useSelector((store) => store)
  const [tweetIdeas, setTweetIdeas] = useState<TweetIdea[]>([])
  const [count, setCount] = useState(5)
  const [tone, setTone] = useState(
    "Excited, friendly, community-first, with one clear CTA"
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTweetsModal, setShowTweetsModal] = useState(false)
  const [tweetLimit, setTweetLimit] = useState(10)

  // Date range state - default to start of month to current date
  const getDefaultStartDate = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return firstDay.toISOString().split("T")[0]
  }

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(getCurrentDate())

  // Validate date range (max 30 days)
  const handleStartDateChange = (newStartDate: string) => {
    const start = new Date(newStartDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 30) {
      // Adjust end date to be 30 days from start
      const maxEnd = new Date(start)
      maxEnd.setDate(maxEnd.getDate() + 30)
      const today = new Date()
      setEndDate(
        maxEnd > today ? getCurrentDate() : maxEnd.toISOString().split("T")[0]
      )
    }
    setStartDate(newStartDate)
  }

  const handleEndDateChange = (newEndDate: string) => {
    const start = new Date(startDate)
    const end = new Date(newEndDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 30) {
      // Adjust start date to be 30 days before end
      const minStart = new Date(end)
      minStart.setDate(minStart.getDate() - 30)
      setStartDate(minStart.toISOString().split("T")[0])
    }
    setEndDate(newEndDate)
  }

  const dispatch = useDispatch()

  const {
    data: createdTweeterData,
    isLoading: createdTweeterLoad,
    isSuccess: createdTweeterSuccess,
    refetch: createdTweeterRefetch,
  }: any = useCreatedtweetersQuery({})

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => {
    setIsModalOpen(false)
    createdTweeterRefetch()
  }

  // ---------- Robust twitterId and companyId resolver ----------
  const twitterId: string | undefined = useMemo(() => {
    const fromProfile =
      profile?.twitter_profile?.id ??
      profile?.twitter?.id ??
      profile?.twitter_id ??
      (Array.isArray(profile?.twitter_profiles)
        ? profile.twitter_profiles[0]?.id
        : profile?.twitter_profiles?.id)

    const fromCreated =
      createdTweeterData?.twitter_profile_id ??
      createdTweeterData?.twitter_id ??
      createdTweeterData?.profile?.twitter_profile_id

    return fromProfile ?? fromCreated ?? undefined
  }, [profile, createdTweeterData])

  const companyId: string | undefined = useMemo(() => {
    // Extract company ID from twitter_companies array
    const companies = createdTweeterData?.twitter_companies
    if (Array.isArray(companies) && companies.length > 0) {
      return companies[0]?.id
    }
    return undefined
  }, [createdTweeterData])

  // console.log({ profile, createdTweeterData, twitterId })

  const {
    data: analyticsData,
    isLoading: analyticsLoad,
    isSuccess: analyticsSuccess,
  }: any = useTwitterMentionsAnalyticsQuery(
    { twitterId: twitterId as string, companyId, startDate, endDate },
    {
      skip: !twitterId,
    }
  )

  // Fetch Twitter followers
  const {
    data: followersData,
    isLoading: followersLoad,
    isSuccess: followersSuccess,
  }: any = useTwitterFollowersQuery(
    { twitterId: twitterId as string },
    {
      skip: !twitterId,
    }
  )

  // Fetch Twitter tweets - only when modal is open
  const {
    data: tweetsData,
    isLoading: tweetsLoad,
    isSuccess: tweetsSuccess,
  }: any = useTweetsQuery(
    { twitterId: twitterId as string },
    {
      skip: !twitterId || !showTweetsModal,
    }
  )

  console.log({ followersData, tweetsData })

  const hasTwitterIntegration =
    createdTweeterData?.has_twitter_integration === true
  const noTwitterIntegration =
    createdTweeterData?.has_twitter_integration === false

  // -------- Derived series --------
  const mentionsSeries = useMemo(
    () => transformMentions(analyticsData?.mentions_by_date),
    [analyticsData]
  )

  const followerSeries = useMemo(
    () => transformFollowers(analyticsData?.followers_by_date),
    [analyticsData]
  )

  // -------- Derived KPIs (guarded) --------
  const totals = useMemo(() => {
    const totalsObj = analyticsData?.totals || analyticsData || {}
    const totalMentions =
      totalsObj.total_mentions ??
      (Array.isArray(mentionsSeries)
        ? mentionsSeries.reduce((s: number, d: any) => s + (d.mentions || 0), 0)
        : undefined)

    const posts: any[] = Array.isArray(analyticsData?.posts)
      ? analyticsData.posts
      : Array.isArray(analyticsData?.top_posts)
      ? analyticsData.top_posts
      : []

    const postCount = posts.length || analyticsData?.post_count
    const sum = (k: string) =>
      posts.reduce((acc, p) => acc + (Number(p?.[k]) || 0), 0)

    const totalLikes =
      totalsObj.total_likes ?? (posts.length ? sum("likes") : undefined)
    const totalReplies =
      totalsObj.total_replies ?? (posts.length ? sum("replies") : undefined)
    const totalReposts =
      totalsObj.total_reposts ?? (posts.length ? sum("reposts") : undefined)
    const totalEngagements =
      Number(totalLikes || 0) +
        Number(totalReplies || 0) +
        Number(totalReposts || 0) || undefined

    const impressions =
      totalsObj.total_impressions ??
      (posts.length ? sum("impressions") : undefined)

    const totalFollowers =
      totalsObj.total_followers ?? analyticsData?.total_followers

    const linkClicks =
      totalsObj.link_clicks ??
      analyticsData?.link_clicks ??
      (posts.length ? sum("link_clicks") : undefined)

    const engagementRate =
      postCount && Number(postCount) > 0
        ? ((Number(totalEngagements || 0) / Number(postCount)) * 100).toFixed(2)
        : undefined

    const clickThroughRate =
      impressions && impressions > 0
        ? ((Number(linkClicks || 0) / impressions) * 100).toFixed(2)
        : undefined

    const engagementToFollowerRatio =
      totalFollowers && totalFollowers > 0
        ? ((Number(totalEngagements || 0) / totalFollowers) * 100).toFixed(2)
        : undefined

    const followerGrowth = (() => {
      if (!analyticsData?.followers_by_date) return undefined
      const points = followerSeries
      if (!points.length) return undefined
      const first = points[0]?.followers
      const last = points[points.length - 1]?.followers
      if (
        typeof first !== "number" ||
        typeof last !== "number" ||
        !Number.isFinite(first) ||
        !Number.isFinite(last)
      ) {
        return undefined
      }
      return {
        abs: last - first,
        pct:
          first > 0 ? (((last - first) / first) * 100).toFixed(2) : undefined,
      }
    })()

    const activeEngagersUnique =
      analyticsData?.active_engagers_unique ??
      analyticsData?.engagers_unique_count ??
      undefined

    const influentialMentionsCount =
      analyticsData?.influential_mentions_count ?? undefined

    const sentiment = analyticsData?.sentiment ?? undefined

    return {
      totalMentions,
      totalLikes,
      totalReplies,
      totalReposts,
      totalEngagements,
      postCount,
      impressions,
      linkClicks,
      totalFollowers,
      engagementRate,
      clickThroughRate,
      engagementToFollowerRatio,
      followerGrowth,
      activeEngagersUnique,
      influentialMentionsCount,
      sentiment,
      postsForRanking: posts,
    }
  }, [analyticsData, mentionsSeries, followerSeries])

  const topPosts = useMemo(() => {
    const posts = totals.postsForRanking
    if (!Array.isArray(posts) || posts.length === 0) return []
    const withScore = posts.map((p: any) => ({
      ...p,
      engagement:
        Number(p?.likes || 0) +
        Number(p?.replies || 0) +
        Number(p?.reposts || 0),
    }))
    return withScore
      .sort((a: any, b: any) => b.engagement - a.engagement)
      .slice(0, 10)
  }, [totals.postsForRanking])

  const handleGenerate = async () => {
    if (!twitterId) return
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-buzz-tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterId,
          tone,
          count,
          analytics: analyticsData,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTweetIdeas(Array.isArray(data?.items) ? data.items : [])
    } catch (e) {
      console.error("Failed to generate tweets", e)
      setTweetIdeas([])
    } finally {
      setIsGenerating(false)
    }
  }

  const openTwitterCompose = (
    text: string,
    opts?: { url?: string; hashtags?: string[]; via?: string }
  ) => {
    const safeText = text.length > 280 ? text.slice(0, 277) + "…" : text
    const u = new URL("https://twitter.com/intent/tweet")
    u.searchParams.set("text", safeText)
    if (opts?.url) u.searchParams.set("url", opts.url)
    if (opts?.via) u.searchParams.set("via", opts.via)
    if (opts?.hashtags?.length)
      u.searchParams.set("hashtags", opts.hashtags.join(","))
    window.open(u.toString(), "_blank", "noopener,noreferrer")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error("Clipboard error", e)
    }
  }

  // ---------- Loading & gating ----------
  if (createdTweeterLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-white mx-auto"
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
          <p className="mt-4 text-lg">Loading account…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* No Twitter integration */}
      {createdTweeterSuccess && noTwitterIntegration && (
        <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="mb-4 text-gray-600">
            Looks like you haven't integrated a Twitter account yet.
          </p>
          <Button onClick={handleOpenModal} className="w-full">
            Create Twitter Account
          </Button>
        </div>
      )}

      {/* Integration present but no twitterId resolved */}
      {createdTweeterSuccess && hasTwitterIntegration && !twitterId && (
        <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="mb-2 text-gray-300">
            We detected a Twitter integration, but couldn't find the account ID.
          </p>
          <p className="text-sm text-gray-400">
            Try re-opening the account modal or re-authenticating your Twitter
            connection.
          </p>
          <div className="mt-4">
            <Button onClick={handleOpenModal}>Fix Connection</Button>
          </div>
        </div>
      )}

      {/* With Twitter integration and resolved twitterId */}
      {createdTweeterSuccess &&
        hasTwitterIntegration &&
        twitterId &&
        (analyticsLoad ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="text-center">
              <svg
                className="animate-spin h-10 w-10 text-white mx-auto"
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
              <p className="mt-4 text-lg">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <div className="min-h-screen text-white p-4 md:p-8 font-sans bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Header with Glassmorphism Effect */}
            <div className="backdrop-blur-md bg-gray-900/50 rounded-3xl border border-gray-800/50 p-6 mb-8 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Social Analytics Dashboard
                  </h1>
                  <p className="text-sm text-gray-400 mt-2">
                    Track your Twitter performance and engagement
                  </p>
                </div>

                {/* KOL Analysis Button & Date Range Selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Button
                    onClick={() => setKolModalOpen(true)}
                    className="cursor-target bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2.5 shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
                  >
                    KOL Analysis
                  </Button>
                  <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur rounded-xl p-2.5 border border-gray-700/50 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="start-date"
                          className="text-xs text-gray-400 font-medium"
                        >
                          From:
                        </label>
                        <input
                          id="start-date"
                          type="date"
                          value={startDate}
                          max={getCurrentDate()}
                          onChange={(e) =>
                            handleStartDateChange(e.target.value)
                          }
                          className="bg-gray-900/90 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        />
                      </div>
                      <span className="text-gray-500 hidden sm:block">→</span>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="end-date"
                          className="text-xs text-gray-400 font-medium"
                        >
                          To:
                        </label>
                        <input
                          id="end-date"
                          type="date"
                          value={endDate}
                          max={getCurrentDate()}
                          onChange={(e) => handleEndDateChange(e.target.value)}
                          className="bg-gray-900/90 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800/50 rounded-lg px-3 py-1.5">
                    <span className="text-primary">⏱</span>
                    <span>Max 30 days</span>
                  </div>
                </div>
              </div>

              {/* Empty State Banner */}
              {totals.totalMentions === 0 && totals.totalLikes === 0 && (
                <div className="mt-6 bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-blue-900/20 border border-blue-700/30 rounded-2xl p-4 text-center backdrop-blur">
                  <p className="text-blue-200 flex items-center justify-center gap-2">
                    <span className="text-2xl">📊</span>
                    <span>
                      Your analytics data is being collected. Check back soon to
                      see your Twitter performance metrics!
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left: Stats + Charts */}
              <div className="lg:col-span-3 space-y-6">
                {/* KPIs */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Mentions - Always show */}
                  <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                    <h2 className="text-lg font-semibold text-gray-400">
                      Total Mentions
                    </h2>
                    <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50">
                      {safeToLocale(totals.totalMentions)}
                    </p>
                    {totals.totalMentions > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
                        <span>↗</span>
                        <span>Active</span>
                      </div>
                    )}
                  </div>

                  {/* Total Likes */}
                  {typeof totals.totalLikes === "number" && (
                    <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-accent/50 transition-all duration-300 hover:scale-105">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
                      <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                        Total Likes
                      </h2>
                      <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                        {safeToLocale(totals.totalLikes)}
                      </p>
                      {totals.totalLikes > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-green-400 text-sm font-medium relative z-10">
                          <span>↗</span>
                          <span>Growing</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Total Followers */}
                  {typeof totals.totalFollowers === "number" && (
                    <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
                      <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                        Total Followers
                      </h2>
                      <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                        {safeToLocale(totals.totalFollowers)}
                      </p>
                      {totals.followerGrowth?.abs !== undefined && (
                        <p className="text-sm text-gray-400 mt-1 relative z-10">
                          {totals.followerGrowth.abs >= 0 ? (
                            <span className="text-green-400 flex items-center gap-1 font-medium">
                              <span>↗</span>+
                              {safeToLocale(totals.followerGrowth.abs)}
                              {totals.followerGrowth.pct &&
                                ` (${totals.followerGrowth.pct}%)`}
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1 font-medium">
                              <span>↘</span>
                              {safeToLocale(totals.followerGrowth.abs)}
                              {totals.followerGrowth.pct &&
                                ` (${totals.followerGrowth.pct}%)`}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Engagement Rate */}
                  {analyticsSuccess &&
                    typeof totals.engagementRate === "string" && (
                      <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-accent/50 transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
                        <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                          Engagement Rate
                        </h2>
                        <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                          {totals.engagementRate}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">
                          Per post average
                        </p>
                      </div>
                    )}

                  {/* Total Engagements */}
                  {typeof totals.totalEngagements === "number" &&
                    totals.totalEngagements > 0 && (
                      <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
                        <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                          Total Engagements
                        </h2>
                        <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                          {safeToLocale(totals.totalEngagements)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">
                          Likes + Replies + Reposts
                        </p>
                      </div>
                    )}

                  {/* Link Clicks */}
                  {typeof totals.linkClicks === "number" &&
                    totals.linkClicks > 0 && (
                      <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-accent/50 transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
                        <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                          Link Clicks
                        </h2>
                        <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                          {safeToLocale(totals.linkClicks)}
                        </p>
                        {totals.clickThroughRate && (
                          <p className="text-xs text-gray-400 mt-1 relative z-10">
                            CTR: {totals.clickThroughRate}%
                          </p>
                        )}
                      </div>
                    )}

                  {/* Active Engagers */}
                  {typeof totals.activeEngagersUnique === "number" &&
                    totals.activeEngagersUnique > 0 && (
                      <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
                        <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                          Active Engagers
                        </h2>
                        <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                          {safeToLocale(totals.activeEngagersUnique)}
                        </p>
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1 font-medium relative z-10">
                          <span>↗</span>
                          Community growth signal
                        </p>
                      </div>
                    )}

                  {/* Impressions */}
                  {typeof totals.impressions === "number" &&
                    totals.impressions > 0 && (
                      <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
                        <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                          Impressions
                        </h2>
                        <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                          {safeToLocale(totals.impressions)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">
                          Total views
                        </p>
                      </div>
                    )}

                  {/* Post Count */}
                  {typeof totals.postCount === "number" &&
                    totals.postCount > 0 && (
                      <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gray-700/50 hover:border-accent/50 transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
                        <h2 className="text-lg font-semibold text-gray-400 relative z-10">
                          Posts
                        </h2>
                        <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50 relative z-10">
                          {safeToLocale(totals.postCount)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 relative z-10">
                          In this period
                        </p>
                      </div>
                    )}
                </section>

                {/* Charts */}
                <section className="grid grid-cols-1 gap-6">
                  {/* Mentions Over Time */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-200">
                        Mentions Over Time
                      </h2>
                      <span className="text-xs text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full">
                        📈 Trend Analysis
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={mentionsSeries}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorMentions"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8884d8"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8884d8"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          stroke="#6b7280"
                        />
                        <YAxis className="text-xs" stroke="#6b7280" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Area
                          type="monotone"
                          dataKey="mentions"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorMentions)"
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          wrapperStyle={{ top: -20, left: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Followers Over Time */}
                  {followerSeries.length > 0 && (
                    <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                      <h2 className="text-xl font-semibold mb-4 text-gray-200">
                        Followers Over Time
                      </h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={followerSeries}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="date"
                            className="text-xs"
                            stroke="#6b7280"
                          />
                          <YAxis className="text-xs" stroke="#6b7280" />
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ top: -20, left: 0 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="followers"
                            stroke="#82ca9d"
                            strokeWidth={3}
                            dot={{ stroke: "#82ca9d", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Engagement Breakdown */}
                  {Array.isArray(analyticsData?.engagement_by_type) && (
                    <section className="bg-gray-800 rounded-2xl p-6 shadow-xl mb-2">
                      <h2 className="text-xl font-semibold mb-4 text-gray-200">
                        Engagement Breakdown
                      </h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={analyticsData?.engagement_by_type}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="name"
                            className="text-xs"
                            stroke="#6b7280"
                          />
                          <YAxis className="text-xs" stroke="#6b7280" />
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ top: -20, left: 0 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#82ca9d"
                            strokeWidth={3}
                            dot={{ stroke: "#82ca9d", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </section>
                  )}
                </section>

                {/* Top Performing Posts */}
                <section className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    Top Performing Posts (by engagement)
                  </h2>
                  {topPosts.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No post data available.
                    </p>
                  ) : (
                    <div className="overflow-auto rounded-xl border border-gray-700">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-900/40">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-300">
                              Post
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-300">
                              Engagement
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-300">
                              Likes
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-300">
                              Replies
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-300">
                              Reposts
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-300">
                              Impressions
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-300">
                              Clicks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {topPosts.map((p: any) => (
                            <tr key={p.id} className="border-t border-gray-700">
                              <td className="px-4 py-3 max-w-[360px]">
                                {p.url ? (
                                  <a
                                    href={p.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-300 hover:text-indigo-200 underline"
                                  >
                                    {p.text?.slice(0, 120) || "View post"}
                                    {p.text?.length > 120 ? "…" : ""}
                                  </a>
                                ) : (
                                  <span className="text-gray-200">
                                    {p.text?.slice(0, 120) || "—"}
                                    {p.text?.length > 120 ? "…" : ""}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {safeToLocale(p.engagement)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {safeToLocale(p.likes)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {safeToLocale(p.replies)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {safeToLocale(p.reposts)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {safeToLocale(p.impressions)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {safeToLocale(p.link_clicks)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* Influential Mentions / Sentiment / Top Topics */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold mb-2 text-gray-200">
                      Influential Mentions
                    </h2>
                    {typeof totals.influentialMentionsCount === "number" ? (
                      <p className="text-4xl font-bold text-gray-50">
                        {totals.influentialMentionsCount.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-gray-400">No data available</p>
                    )}
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold mb-2 text-gray-200">
                      Sentiment Analysis
                    </h2>
                    {totals.sentiment ? (
                      <div className="text-sm text-gray-300 space-y-1">
                        {"positive" in totals.sentiment && (
                          <div>
                            Positive:{" "}
                            {percent(
                              totals.sentiment.positive,
                              totals.sentiment.total
                            )}
                          </div>
                        )}
                        {"neutral" in totals.sentiment && (
                          <div>
                            Neutral:{" "}
                            {percent(
                              totals.sentiment.neutral,
                              totals.sentiment.total
                            )}
                          </div>
                        )}
                        {"negative" in totals.sentiment && (
                          <div>
                            Negative:{" "}
                            {percent(
                              totals.sentiment.negative,
                              totals.sentiment.total
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">No data available</p>
                    )}
                  </div>
                </section>

                {/* Top Topics */}
                {Array.isArray(analyticsData?.top_topics) &&
                  analyticsData.top_topics.length > 0 && (
                    <section className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                      <h2 className="text-xl font-semibold mb-4 text-gray-200">
                        Top Topics
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analyticsData.top_topics.map(
                          (topic: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-900/60 border border-gray-700 rounded-lg p-4"
                            >
                              <span className="text-gray-200 font-medium">
                                {topic.name}
                              </span>
                              <span className="text-2xl font-bold text-primary">
                                {topic.mentions}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  )}

                {/* View Tweets Button */}
                <section className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-700/50">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-200 mb-3">
                      Your Recent Tweets
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                      View your latest tweets with engagement metrics
                    </p>
                    <Button
                      onClick={() => setShowTweetsModal(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                    >
                      View Tweets
                    </Button>
                  </div>
                </section>
              </div>

              {/* Right: Generated Tweets */}
              <aside className="lg:col-span-1 bg-gray-800 rounded-2xl p-4 md:p-6 shadow-xl h-fit sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">
                    Generated Tweets
                  </h3>
                  <Button
                    variant="secondary"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating…" : "Generate"}
                  </Button>
                </div>

                {tweetIdeas.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    Use <span className="font-semibold">Generate</span> to fetch
                    ideas from your backend.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {tweetIdeas.map((t) => (
                      <li
                        key={t.id}
                        className="bg-gray-900/60 border border-gray-700 rounded-xl p-4"
                      >
                        <p className="whitespace-pre-wrap text-gray-100 leading-relaxed">
                          {t.text}
                        </p>
                        {t.estimates &&
                          (t.estimates.mentions ||
                            t.estimates.likes ||
                            t.estimates.retweets) && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              {typeof t.estimates.mentions === "number" && (
                                <span className="px-2 py-1 rounded-full bg-indigo-900/40 border border-indigo-700">
                                  Est. Mentions:{" "}
                                  <span className="font-semibold">
                                    {t.estimates.mentions.toLocaleString()}
                                  </span>
                                </span>
                              )}
                              {typeof t.estimates.likes === "number" && (
                                <span className="px-2 py-1 rounded-full bg-emerald-900/40 border border-emerald-700">
                                  Est. Likes:{" "}
                                  <span className="font-semibold">
                                    {t.estimates.likes.toLocaleString()}
                                  </span>
                                </span>
                              )}
                              {typeof t.estimates.retweets === "number" && (
                                <span className="px-2 py-1 rounded-full bg-cyan-900/40 border border-cyan-700">
                                  Est. Retweets:{" "}
                                  <span className="font-semibold">
                                    {t.estimates.retweets.toLocaleString()}
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(t.text)}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openTwitterCompose(t.text)}
                          >
                            Post…
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            </div>
          </div>
        ))}

      {/* Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <MultiStepForm onClose={handleCloseModal} />
      </Modal>

      {/* Tweets Modal */}
      <Modal open={showTweetsModal} onClose={() => setShowTweetsModal(false)}>
        <div className="bg-gray-900 rounded-2xl p-6 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-200">Recent Tweets</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="tweet-limit" className="text-sm text-gray-400">
                Show:
              </label>
              <select
                id="tweet-limit"
                value={tweetLimit}
                onChange={(e) => setTweetLimit(Number(e.target.value))}
                className="bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value={10}>10 tweets</option>
                <option value={25}>25 tweets</option>
                <option value={50}>50 tweets</option>
                <option value={100}>100 tweets</option>
              </select>
            </div>
          </div>

          {tweetsLoad ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg
                  className="animate-spin h-12 w-12 mx-auto mb-4 text-primary"
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
                <p className="text-gray-400">Loading tweets...</p>
              </div>
            </div>
          ) : Array.isArray(tweetsData) && tweetsData.length > 0 ? (
            <div className="overflow-y-auto pr-2 space-y-4">
              {tweetsData.slice(0, tweetLimit).map((tweet: any) => (
                <div
                  key={tweet.id}
                  className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
                >
                  <p className="text-gray-200 text-sm mb-3">{tweet.text}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-red-400">♥</span>
                        <span>{tweet.like_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-400">↻</span>
                        <span>{tweet.retweet_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400">💬</span>
                        <span>{tweet.reply_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">⎙</span>
                        <span>{tweet.quote_count || 0}</span>
                      </div>
                    </div>
                    <div className="text-gray-500">
                      {new Date(tweet.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {tweet.mentions && tweet.mentions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tweet.mentions
                        .slice(0, 5)
                        .map((mention: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                          >
                            @{mention}
                          </span>
                        ))}
                    </div>
                  )}
                  {tweet.hashtags && tweet.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tweet.hashtags
                        .slice(0, 5)
                        .map((hashtag: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full"
                          >
                            #{hashtag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No tweets available</p>
            </div>
          )}
        </div>
      </Modal>

      {/* KOL Analysis Modal */}
      <KOLAnalysisModal
        open={kolModalOpen}
        onClose={() => setKolModalOpen(false)}
      />
    </div>
  )
}

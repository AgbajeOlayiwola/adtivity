"use client"
import { Modal } from "@/components/modal"
import { MultiStepForm } from "@/components/MultiStepForm"
import { Button } from "@/components/ui/button"
import {
  useCreatedtweetersQuery,
  useTwitterMentionsAnalyticsQuery,
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

// ---------------------- helpers ----------------------
// Transform mentions_by_date into a format that Recharts can use.
const transformMentions = (
  mentionsByDate: Record<string, number> | undefined
) => {
  if (!mentionsByDate || Object.keys(mentionsByDate).length === 0) return []
  return Object.keys(mentionsByDate).map((date) => ({
    date,
    mentions: mentionsByDate[date] ?? 0,
  }))
}

const loginSchema = z.object({
  userName: z.string().min(1, { message: "Username cannot be empty." }),
})

// Types for the tweet generator
type TweetIdea = {
  id: string
  text: string
  estimates?: {
    mentions?: number
    likes?: number
    retweets?: number
  }
}

const TwitterAnalytics = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { profile }: any = useSelector((store) => store)
  const [tweetIdeas, setTweetIdeas] = useState<TweetIdea[]>([])
  const [count, setCount] = useState(5)
  const [tone, setTone] = useState(
    "Excited, friendly, community-first, with one clear CTA"
  )
  const [isGenerating, setIsGenerating] = useState(false)

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
  const {
    data: analyticsData,
    isLoading: analyticsLoad,
    isSuccess: analyticsSuccess,
  }: any = useTwitterMentionsAnalyticsQuery({
    twitterId: profile?.twitter_profiles[0]?.id,
  })

  const hasTwitterIntegration =
    createdTweeterData?.has_twitter_integration === true
  const noTwitterIntegration =
    createdTweeterData?.has_twitter_integration === false

  // Combine backend data for charts
  const mentionsSeries = useMemo(
    () => transformMentions(analyticsData?.mentions_by_date || {}),
    [analyticsData]
  )

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-buzz-tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterId: profile?.twitter_profiles[0]?.id,
          tone,
          count,
          analytics: analyticsData, // ← send your server response directly
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
    // Trim to X's 280-char limit (basic safeguard; links count differently server-side)
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

  if (analyticsLoad) {
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
          <p className="mt-4 text-lg">Loading analytics data...</p>
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

      {/* With Twitter integration */}
      {createdTweeterSuccess && hasTwitterIntegration && (
        <div className="min-h-screen text-white p-4 md:p-8 font-sans">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-100">
              Social Analytics Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <span className="bg-gray-800 rounded-full px-3 py-1">
                {analyticsData?.date_range?.start_date} -{" "}
                {analyticsData?.date_range?.end_date}
              </span>
            </div>
          </header>

          {/* Controls: Tweet generator (no mocks) */}
          {/* <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-2">
                  Tone / Guidance (optional)
                </label>
                <textarea
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-gray-900/70 border border-gray-700 rounded-xl p-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  rows={2}
                  placeholder="Tell the generator how to sound (e.g., witty, professional, educational)…"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  How many?
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="bg-gray-900/70 border border-gray-700 rounded-xl p-2 text-gray-100"
                >
                  {[3, 5, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? "Generating…" : "Generate Buzz Tweets"}
                </Button>
              </div>
            </div>
          </section> */}

          {/* Layout grid: charts + generated tweets sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Stats + Charts (span 2) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Stats */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl transform transition-transform duration-300 hover:scale-105">
                  <h2 className="text-lg font-semibold text-gray-400">
                    Total Mentions
                  </h2>
                  <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50">
                    {analyticsData?.total_mentions?.toLocaleString?.() || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl transform transition-transform duration-300 hover:scale-105">
                  <h2 className="text-lg font-semibold text-gray-400">
                    Total Likes
                  </h2>
                  <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50">
                    {analyticsData?.total_likes?.toLocaleString?.() || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl transform transition-transform duration-300 hover:scale-105">
                  <h2 className="text-lg font-semibold text-gray-400">
                    Total Followers
                  </h2>
                  <p className="text-4xl md:text-5xl font-bold mt-2 text-gray-50">
                    {analyticsData?.total_followers?.toLocaleString?.() ||
                      "N/A"}
                  </p>
                </div>
              </section>
              {/* update */}
              {/* Charts Section */}
              <section className="grid grid-cols-1 gap-6">
                {/* Mentions Over Time Chart (no mocked likes) */}
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    Mentions Over Time
                  </h2>
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

                {/* Engagement Chart (uses backend engagement_by_type as-is) */}
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
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
              </section>
            </div>

            {/* Right: Generated Tweets (from backend only) */}
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
                  Use{" "}
                  <span className="font-semibold">Generate Buzz Tweets</span> to
                  fetch ideas from your backend. Each item can include
                  server-calculated estimates for mentions, likes, and retweets.
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
      )}

      {/* The Modal Component remains the same, used by both buttons */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <MultiStepForm onClose={handleCloseModal} />
      </Modal>
    </div>
  )
}

export default TwitterAnalytics

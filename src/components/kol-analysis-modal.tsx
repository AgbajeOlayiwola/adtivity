"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  useAutocompleteTwitterUserQuery,
  useTweetsQuery,
  useTwitterFollowersQuery,
  useTwitterMentionsAnalyticsQuery,
} from "@/redux/api/queryApi"
import { useCreateTwitterAccountsMutation } from "@/redux/api/mutationApi"
import { AlertCircle, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
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

// ---------------------- helpers ----------------------
const transformMentions = (
  mentionsByDate: Record<string, number> | Array<any> | undefined
) => {
  if (Array.isArray(mentionsByDate)) {
    return mentionsByDate.map((item) => ({
      date: item.date || "Unknown",
      mentions: item.mentions ?? 0,
      likes: item.likes ?? 0,
    }))
  }
  if (!mentionsByDate || Object.keys(mentionsByDate).length === 0) return []
  return Object.keys(mentionsByDate).map((date) => ({
    date,
    mentions: mentionsByDate[date] ?? 0,
  }))
}

const transformFollowers = (
  followersByDate: Record<string, number> | Array<any> | undefined
) => {
  if (Array.isArray(followersByDate)) {
    return followersByDate.map((item) => ({
      date: item.date || "Unknown",
      followers: item.followers ?? 0,
    }))
  }
  if (!followersByDate || Object.keys(followersByDate).length === 0) return []
  return Object.keys(followersByDate).map((date) => ({
    date,
    followers: followersByDate[date] ?? 0,
  }))
}

const safeToLocale = (n?: number) =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString() : "N/A"

interface KOLAnalysisModalProps {
  open: boolean
  onClose: () => void
}

export default function KOLAnalysisModal({
  open,
  onClose,
}: KOLAnalysisModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTwitterId, setSelectedTwitterId] = useState<string | null>(
    null
  )
  const [selectedUsername, setSelectedUsername] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  )
  const [selectedCompanyName, setSelectedCompanyName] =
    useState("Select a company")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  // Get companies from profile slice
  const { profile }: any = useSelector((store) => store)
  const companies = profile?.companies || []

  // Create Twitter Account mutation
  const [
    createTwitterAccounts,
    {
      isLoading: createTwitterAccountsLoad,
      isSuccess: createTwitterAccountsSuccess,
      isError: createTwitterAccountsFalse,
      error: createTwitterAccountsErr,
    },
  ]: any = useCreateTwitterAccountsMutation()

  // Debug companies
  useEffect(() => {
    console.log("Companies from profile:", {
      profile,
      companies,
      twitter_companies: profile?.twitter_companies,
    })
  }, [profile, companies])

  // Autocomplete search
  const { data: autocompleteData, isLoading: autocompleteLoading }: any =
    useAutocompleteTwitterUserQuery(
      { query: searchQuery },
      {
        skip: !searchQuery || searchQuery.length < 2,
      }
    )

  // Fetch analytics for selected user
  const {
    data: analyticsData,
    isLoading: analyticsLoad,
    isSuccess: analyticsSuccess,
    isError: analyticsError,
    error: analyticsErrorData,
  }: any = useTwitterMentionsAnalyticsQuery(
    { twitterId: selectedTwitterId, startDate, endDate },
    {
      skip: !selectedTwitterId,
    }
  )

  const { data: followersData, isLoading: followersLoad, isError: followersError, error: followersErrorData }: any =
    useTwitterFollowersQuery(
      { twitterId: selectedTwitterId },
      {
        skip: !selectedTwitterId,
      }
    )

  const { data: tweetsData, isLoading: tweetsLoad, isError: tweetsError, error: tweetsErrorData }: any = useTweetsQuery(
    { twitterId: selectedTwitterId },
    {
      skip: !selectedTwitterId,
    }
  )

  console.log("=== QUERY STATUS ===", {
    selectedTwitterId,
    analyticsQuery: {
      data: analyticsData,
      isLoading: analyticsLoad,
      isSuccess: analyticsSuccess,
      isError: analyticsError,
      error: analyticsErrorData,
    },
    followersQuery: {
      data: followersData,
      isLoading: followersLoad,
      isError: followersError,
      error: followersErrorData,
    },
    tweetsQuery: {
      data: tweetsData,
      isLoading: tweetsLoad,
      isError: tweetsError,
      error: tweetsErrorData,
    },
  })

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
    setSelectedUsername(user.username)
    setSearchQuery("")
    setShowCompanyDropdown(true)
    setErrorMessage(null)
  }

  const handleAnalyzeAccount = async () => {
    if (!selectedCompanyId) {
      setErrorMessage("Please select a company to add the account to.")
      return
    }

    if (!selectedUser) {
      setErrorMessage("Please select a Twitter user first.")
      return
    }

    console.log("=== DEBUG: handleAnalyzeAccount ===")
    console.log("selectedUser:", selectedUser)
    console.log("selectedCompanyId:", selectedCompanyId)
    console.log("selectedUsername:", selectedUsername)

    try {
      // Create Twitter account with the selected company
      const payload = {
        twitter_handle: selectedUsername,
        description: selectedUser.description || selectedUser.name || "",
        company_id: selectedCompanyId,
      }

      console.log("Creating Twitter account with payload:", payload)

      const response = await createTwitterAccounts(payload).unwrap()

      console.log("=== CREATE TWITTER ACCOUNT RESPONSE ===")
      console.log("Full response:", response)
      console.log("twitter_id from response:", response?.id || response?.twitter_id)

      // Extract twitter_id from response
      const twitterId = response?.id || response?.twitter_id

      if (!twitterId) {
        console.error("No twitter_id found in response:", response)
        setErrorMessage(
          "Failed to create Twitter account. No twitter_id returned."
        )
        return
      }

      // Set the twitter_id to trigger analytics fetching
      console.log("Setting selectedTwitterId to:", twitterId)
      setSelectedTwitterId(twitterId)
      setShowCompanyDropdown(false)
      setErrorMessage(null)
    } catch (error: any) {
      console.error("Error creating Twitter account:", error)
      setErrorMessage(
        error?.data?.message ||
          error?.message ||
          "Failed to create Twitter account. Please try again."
      )
    }
  }

  const handleClearSelection = () => {
    setSelectedTwitterId(null)
    setSelectedUsername("")
    setSelectedUser(null)
    setShowCompanyDropdown(false)
    setSelectedCompanyId(null)
    setSelectedCompanyName("Select a company")
    setErrorMessage(null)
  }

  const handleClose = () => {
    // Reset all state
    handleClearSelection()
    setSearchQuery("")

    // Call the parent onClose
    onClose()
  }

  // -------- Derived series --------
  const mentionsSeries = useMemo(
    () => transformMentions(analyticsData?.mentions_by_date),
    [analyticsData]
  )

  const followerSeries = useMemo(
    () => transformFollowers(analyticsData?.followers_by_date),
    [analyticsData]
  )

  // -------- Derived KPIs --------
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
      followerGrowth,
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="w-[95%] max-w-7xl max-h-[90vh] overflow-hidden bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            KOL Analysis Dashboard
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Search for any Twitter user to analyze their social performance
          </p>

          {/* Search Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by Twitter username or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary"
            />

            {/* Autocomplete Results */}
            {autocompleteLoading && searchQuery.length >= 2 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-20">
                <p className="text-sm text-gray-400">Searching...</p>
              </div>
            )}

            {!autocompleteLoading &&
              searchQuery.length >= 2 &&
              autocompleteData &&
              autocompleteData.users &&
              Array.isArray(autocompleteData.users) &&
              autocompleteData.users.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                  {autocompleteData.users.map((user: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleUserSelect(user)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {user.profile_image_url && (
                          <img
                            src={user.profile_image_url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {user.name || user.username}
                          </p>
                          <p className="text-sm text-gray-400">
                            @{user.username}
                          </p>
                          {user.followers_count !== undefined && (
                            <p className="text-xs text-gray-500">
                              {user.followers_count.toLocaleString()} followers
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            {!autocompleteLoading &&
              searchQuery.length >= 2 &&
              autocompleteData &&
              autocompleteData.users &&
              Array.isArray(autocompleteData.users) &&
              autocompleteData.users.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-20">
                  <p className="text-sm text-gray-400">No users found</p>
                </div>
              )}
          </div>

          {/* Selected User Display & Company Selection */}
          {selectedUsername && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div>
                  <p className="text-white font-medium">
                    {selectedTwitterId ? "Analyzing: " : "Selected: "}
                    <span className="text-primary">@{selectedUsername}</span>
                  </p>
                  {selectedUser && !selectedTwitterId && (
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedUser.followers_count?.toLocaleString()} followers
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear
                </Button>
              </div>

              {/* Company Selection List */}
              {showCompanyDropdown && !selectedTwitterId && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    To view analytics, please add this account to a company:
                  </p>

                  {/* Company List */}
                  <div className="space-y-2">
                    {companies && companies.length > 0 ? (
                      companies.map((company: any) => (
                        <button
                          key={company.id}
                          onClick={() => {
                            setSelectedCompanyId(company.id)
                            setSelectedCompanyName(company.name)
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                            selectedCompanyId === company.id
                              ? "bg-primary/20 border-primary text-white"
                              : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{company.name}</span>
                            {selectedCompanyId === company.id && (
                              <span className="text-primary text-sm">✓</span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No companies available
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleAnalyzeAccount}
                    disabled={!selectedCompanyId || createTwitterAccountsLoad}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {createTwitterAccountsLoad ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
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
                        Creating Account...
                      </span>
                    ) : (
                      "View Analytics"
                    )}
                  </Button>

                  {errorMessage && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p>{errorMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analytics Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {!selectedTwitterId ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-400">
                Search for a Twitter user to view their analytics
              </p>
            </div>
          ) : analyticsLoad ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg
                  className="animate-spin h-12 w-12 text-primary mx-auto mb-4"
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
                <p className="text-gray-400">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date Range */}
              <div className="flex items-center gap-3 bg-gray-800/80 backdrop-blur rounded-xl p-3 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 font-medium">
                    From:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={getCurrentDate()}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-900/90 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <span className="text-gray-500">→</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 font-medium">
                    To:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    max={getCurrentDate()}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-900/90 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* KPIs */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-400">
                    Total Mentions
                  </h3>
                  <p className="text-4xl font-bold mt-2 text-gray-50">
                    {safeToLocale(totals.totalMentions)}
                  </p>
                </div>

                {typeof totals.totalLikes === "number" && (
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-gray-400">
                      Total Likes
                    </h3>
                    <p className="text-4xl font-bold mt-2 text-gray-50">
                      {safeToLocale(totals.totalLikes)}
                    </p>
                  </div>
                )}

                {typeof totals.totalFollowers === "number" && (
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-gray-400">
                      Total Followers
                    </h3>
                    <p className="text-4xl font-bold mt-2 text-gray-50">
                      {safeToLocale(totals.totalFollowers)}
                    </p>
                    {totals.followerGrowth?.abs !== undefined && (
                      <p className="text-sm text-gray-400 mt-1">
                        {totals.followerGrowth.abs >= 0 ? (
                          <span className="text-green-400">
                            ↗ +{safeToLocale(totals.followerGrowth.abs)}
                            {totals.followerGrowth.pct &&
                              ` (${totals.followerGrowth.pct}%)`}
                          </span>
                        ) : (
                          <span className="text-red-400">
                            ↘ {safeToLocale(totals.followerGrowth.abs)}
                            {totals.followerGrowth.pct &&
                              ` (${totals.followerGrowth.pct}%)`}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {typeof totals.engagementRate === "string" && (
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-gray-400">
                      Engagement Rate
                    </h3>
                    <p className="text-4xl font-bold mt-2 text-gray-50">
                      {totals.engagementRate}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Per post average
                    </p>
                  </div>
                )}

                {typeof totals.totalEngagements === "number" &&
                  totals.totalEngagements > 0 && (
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-gray-400">
                        Total Engagements
                      </h3>
                      <p className="text-4xl font-bold mt-2 text-gray-50">
                        {safeToLocale(totals.totalEngagements)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Likes + Replies + Reposts
                      </p>
                    </div>
                  )}

                {typeof totals.impressions === "number" &&
                  totals.impressions > 0 && (
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-gray-400">
                        Impressions
                      </h3>
                      <p className="text-4xl font-bold mt-2 text-gray-50">
                        {safeToLocale(totals.impressions)}
                      </p>
                    </div>
                  )}

                {typeof totals.postCount === "number" &&
                  totals.postCount > 0 && (
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-gray-400">
                        Posts
                      </h3>
                      <p className="text-4xl font-bold mt-2 text-gray-50">
                        {safeToLocale(totals.postCount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        In this period
                      </p>
                    </div>
                  )}
              </section>

              {/* Charts */}
              <section className="grid grid-cols-1 gap-6">
                {/* Mentions Over Time */}
                <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-200">
                    Mentions Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mentionsSeries}>
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
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Followers Over Time */}
                {followerSeries.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-4 text-gray-200">
                      Followers Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={followerSeries}>
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          stroke="#6b7280"
                        />
                        <YAxis className="text-xs" stroke="#6b7280" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="followers"
                          stroke="#82ca9d"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              {/* Top Performing Posts */}
              {topPosts.length > 0 && (
                <section className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-200">
                    Top Performing Posts
                  </h3>
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
                                  className="text-primary hover:text-primary/80 underline"
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

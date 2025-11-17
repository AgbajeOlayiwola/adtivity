"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  useAutocompleteTwitterUserQuery,
} from "@/redux/api/queryApi"
import { useAnalyzeKOLMutation, useGetKOLRecommendationMutation } from "@/redux/api/mutationApi"
import { AlertCircle, X, Sparkles } from "lucide-react"
import { useState, useMemo } from "react"
import { filterRetweetsFromAnalytics } from "@/lib/utils"

// ---------------------- helpers ----------------------
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
  const [selectedUsername, setSelectedUsername] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // KOL Analysis state
  const [maxTweets, setMaxTweets] = useState(10)
  const [maxMentions, setMaxMentions] = useState(20)
  const [kolAnalysisData, setKolAnalysisData] = useState<any>(null)

  // AI Recommendation state
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [additionalContext, setAdditionalContext] = useState("")
  const [aiRecommendation, setAiRecommendation] = useState<any>(null)
  const [showGoalsSection, setShowGoalsSection] = useState(false)

  // KOL Analysis mutation
  const [
    analyzeKOL,
    {
      isLoading: analyzeKOLLoading,
      isSuccess: analyzeKOLSuccess,
      isError: analyzeKOLError,
      error: analyzeKOLErrorData,
    },
  ]: any = useAnalyzeKOLMutation()

  // AI Recommendation mutation
  const [
    getKOLRecommendation,
    {
      isLoading: recommendationLoading,
      isError: recommendationError,
    },
  ]: any = useGetKOLRecommendationMutation()

  // Autocomplete search
  const { data: autocompleteData, isLoading: autocompleteLoading }: any =
    useAutocompleteTwitterUserQuery(
      { query: searchQuery },
      {
        skip: !searchQuery || searchQuery.length < 2,
      }
    )

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
    setSelectedUsername(user.username)
    setSearchQuery("")
    setErrorMessage(null)
  }

  const handleClearSelection = () => {
    setSelectedUsername("")
    setSelectedUser(null)
    setErrorMessage(null)
    setKolAnalysisData(null)
    setSearchQuery("")
    setAiRecommendation(null)
    setSelectedGoals([])
    setAdditionalContext("")
    setShowGoalsSection(false)
  }

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    )
  }

  const handleGetAIRecommendation = async () => {
    if (!kolAnalysisData) {
      setErrorMessage("Please analyze a KOL first.")
      return
    }

    if (selectedGoals.length === 0) {
      setErrorMessage("Please select at least one brand goal.")
      return
    }

    try {
      // Use filtered data for AI recommendation
      const dataToSend = filterRetweetsFromAnalytics(kolAnalysisData)
      const response = await getKOLRecommendation({
        kol_data: dataToSend,
        brand_goals: selectedGoals,
        additional_context: additionalContext || undefined,
      }).unwrap()

      setAiRecommendation(response)
      setErrorMessage(null)
      setShowGoalsSection(false)
    } catch (error: any) {
      console.error("Error getting AI recommendation:", error)
      setErrorMessage(
        error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          "Failed to get AI recommendation. Please try again."
      )
    }
  }

  const handleAnalyzeKOL = async () => {
    if (!selectedUsername) {
      setErrorMessage("Please select a Twitter user first.")
      return
    }

    try {
      console.log("=== ANALYZING KOL ===")
      console.log("Username:", selectedUsername)
      console.log("Max Tweets:", maxTweets)
      console.log("Max Mentions:", maxMentions)

      const response = await analyzeKOL({
        username: selectedUsername,
        max_tweets: maxTweets,
        max_mentions: maxMentions,
      }).unwrap()

      console.log("=== KOL ANALYSIS RESPONSE ===")
      console.log("Full response:", response)

      setKolAnalysisData(response)
      setErrorMessage(null)
    } catch (error: any) {
      console.error("Error analyzing KOL:", error)
      setErrorMessage(
        error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          "Failed to analyze KOL. Please try again."
      )
    }
  }

  const handleClose = () => {
    // Reset all state
    handleClearSelection()
    setSearchQuery("")

    // Call the parent onClose
    onClose()
  }

  // Filter out retweets from KOL analysis data
  const filteredKolAnalysisData = useMemo(() => {
    if (!kolAnalysisData) return null
    return filterRetweetsFromAnalytics(kolAnalysisData)
  }, [kolAnalysisData])

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
          {selectedUsername && !kolAnalysisData && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div>
                  <p className="text-white font-medium">
                    Selected: <span className="text-primary">@{selectedUsername}</span>
                  </p>
                  {selectedUser && (
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

              {/* KOL Analysis Section */}
              <div className="space-y-3 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <h3 className="text-white font-semibold">AI-Powered KOL Analysis</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Analyze this user's Twitter activity, engagement, and influence.
                </p>

                {/* Tweet Count Selector */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <span>Number of Tweets to Analyze</span>
                    <span className="text-xs text-gray-500">(min: 10, max: 100)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={maxTweets}
                      onChange={(e) => setMaxTweets(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-white font-semibold min-w-[40px] text-center">
                      {maxTweets}
                    </span>
                  </div>
                </div>

                {/* Mentions Count Selector */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 flex items-center gap-2">
                    <span>Number of Mentions to Analyze</span>
                    <span className="text-xs text-gray-500">(max: 20)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="20"
                      step="10"
                      value={maxMentions}
                      onChange={(e) => setMaxMentions(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-white font-semibold min-w-[40px] text-center">
                      {maxMentions}
                    </span>
                  </div>
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyzeKOL}
                  disabled={!selectedUsername || analyzeKOLLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {analyzeKOLLoading ? (
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
                      Analyzing...
                    </span>
                  ) : (
                    "🤖 Analyze KOL"
                  )}
                </Button>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Analytics Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* KOL Analysis Results */}
          {filteredKolAnalysisData && (
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🤖</span> KOL Analysis Results
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setKolAnalysisData(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Clear Results
                </Button>
              </div>

              {/* Profile Information */}
              {filteredKolAnalysisData.profile && (
                <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {filteredKolAnalysisData.profile.profile_image_url && (
                        <img
                          src={filteredKolAnalysisData.profile.profile_image_url}
                          alt={filteredKolAnalysisData.profile.name}
                          className="w-16 h-16 rounded-full border-2 border-primary"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">
                            {filteredKolAnalysisData.profile.name}
                          </h3>
                          {filteredKolAnalysisData.profile.verified && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </div>
                        <p className="text-gray-400">@{filteredKolAnalysisData.profile.username}</p>
                        {filteredKolAnalysisData.profile.description && (
                          <p className="text-gray-300 mt-2">{filteredKolAnalysisData.profile.description}</p>
                        )}
                        <div className="flex gap-6 mt-3 text-sm">
                          <div>
                            <span className="text-gray-400">Followers:</span>
                            <span className="text-white font-semibold ml-1">
                              {safeToLocale(filteredKolAnalysisData.profile.followers_count)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Following:</span>
                            <span className="text-white font-semibold ml-1">
                              {safeToLocale(filteredKolAnalysisData.profile.following_count)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Tweets:</span>
                            <span className="text-white font-semibold ml-1">
                              {safeToLocale(filteredKolAnalysisData.profile.tweets_count)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Analysis Summary */}
              {filteredKolAnalysisData.analysis_summary && Object.keys(filteredKolAnalysisData.analysis_summary).length > 0 && (
                <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/30">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span>📊</span> Analysis Summary (Retweets Excluded)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(filteredKolAnalysisData.analysis_summary)
                        .filter(([key]) => !['top_performing_tweets', 'top_hashtags', 'errors'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="bg-gray-800/50 rounded-lg p-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-lg font-semibold text-white mt-1">
                              {typeof value === 'number' ? safeToLocale(value) :
                               typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                               String(value)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Tweets & Mentions Count */}
              <div className="grid grid-cols-2 gap-4">
                {filteredKolAnalysisData.user_tweets && (
                  <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-700/30">
                    <div className="p-6">
                      <h3 className="text-sm text-gray-400">Analyzed Tweets (Original Only)</h3>
                      <p className="text-3xl font-bold text-white mt-2">
                        {Array.isArray(filteredKolAnalysisData.user_tweets) ? filteredKolAnalysisData.user_tweets.length : 0}
                      </p>
                    </div>
                  </Card>
                )}
                {filteredKolAnalysisData.mentions && (
                  <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-700/30">
                    <div className="p-6">
                      <h3 className="text-sm text-gray-400">Analyzed Mentions</h3>
                      <p className="text-3xl font-bold text-white mt-2">
                        {Array.isArray(filteredKolAnalysisData.mentions) ? filteredKolAnalysisData.mentions.length : 0}
                      </p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Top Performing Tweets */}
              {filteredKolAnalysisData.analysis_summary?.top_performing_tweets &&
                Array.isArray(filteredKolAnalysisData.analysis_summary.top_performing_tweets) &&
                filteredKolAnalysisData.analysis_summary.top_performing_tweets.length > 0 && (
                <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span>🔥</span> Top Performing Tweets (Original Content)
                    </h3>
                    <div className="space-y-3">
                      {filteredKolAnalysisData.analysis_summary.top_performing_tweets.map((tweet: any, index: number) => (
                        <div key={tweet.tweet_id || index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-purple-400 font-semibold text-sm">#{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-300 text-sm mb-3 line-clamp-3">{tweet.text}</p>
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400">❤️</span>
                                  <span className="text-white font-medium">{safeToLocale(tweet.likes)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400">🔄</span>
                                  <span className="text-white font-medium">{safeToLocale(tweet.retweets)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Error Display */}
              {filteredKolAnalysisData.error && (
                <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Note:</p>
                    <p>{filteredKolAnalysisData.error}</p>
                  </div>
                </div>
              )}

              {/* AI Recommendation Button */}
              {!aiRecommendation && !showGoalsSection && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowGoalsSection(true)}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Brand Fit Recommendation
                  </Button>
                </div>
              )}

              {/* Goals Selection Section */}
              {showGoalsSection && !aiRecommendation && (
                <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-700/30">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      What are your brand goals?
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Select your primary goals to get a personalized AI recommendation
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {[
                        { id: "brand_awareness", label: "Brand Awareness", icon: "👁️" },
                        { id: "engagement", label: "Engagement", icon: "💬" },
                        { id: "customer_acquisition", label: "Customer Acquisition", icon: "🎯" },
                        { id: "sales_conversion", label: "Sales & Conversion", icon: "💰" },
                        { id: "community_growth", label: "Community Growth", icon: "🌱" },
                        { id: "thought_leadership", label: "Thought Leadership", icon: "🧠" },
                      ].map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => handleGoalToggle(goal.id)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedGoals.includes(goal.id)
                              ? "bg-purple-600/30 border-purple-500 text-white"
                              : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-purple-700/50"
                          }`}
                        >
                          <div className="text-2xl mb-1">{goal.icon}</div>
                          <div className="text-xs font-medium">{goal.label}</div>
                        </button>
                      ))}
                    </div>

                    <div className="mb-4">
                      <label className="text-sm text-gray-300 mb-2 block">
                        Additional Context (Optional)
                      </label>
                      <textarea
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        placeholder="e.g., We're a tech startup targeting Gen Z, looking for authentic voices in crypto/web3..."
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleGetAIRecommendation}
                        disabled={selectedGoals.length === 0 || recommendationLoading}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {recommendationLoading ? (
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
                            Analyzing...
                          </span>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Get AI Recommendation
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowGoalsSection(false)
                          setSelectedGoals([])
                          setAdditionalContext("")
                        }}
                        variant="outline"
                        className="text-gray-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* AI Recommendation Display */}
              {aiRecommendation && (
                <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-green-400" />
                        AI Brand Fit Analysis
                      </h3>
                      <Button
                        onClick={() => {
                          setAiRecommendation(null)
                          setSelectedGoals([])
                          setAdditionalContext("")
                        }}
                        variant="outline"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        Get New Recommendation
                      </Button>
                    </div>

                    {aiRecommendation.recommendation && (
                      <div className="prose prose-invert max-w-none">
                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {aiRecommendation.recommendation}
                          </p>
                        </div>
                      </div>
                    )}

                    {aiRecommendation.fit_score !== undefined && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Brand Fit Score</span>
                          <span className="text-lg font-bold text-white">
                            {aiRecommendation.fit_score}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(aiRecommendation.fit_score / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {aiRecommendation.strengths && aiRecommendation.strengths.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Strengths</h4>
                        <ul className="space-y-1">
                          {aiRecommendation.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiRecommendation.concerns && aiRecommendation.concerns.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-amber-400 mb-2">⚠ Concerns</h4>
                        <ul className="space-y-1">
                          {aiRecommendation.concerns.map((concern: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {!kolAnalysisData && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-400">
                Search for a Twitter user and analyze their KOL metrics
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Twitter Analytics Utilities

interface Tweet {
  tweet_id?: string
  text: string
  like_count?: number
  retweet_count?: number
  reply_count?: number
  quote_count?: number
  likes?: number
  retweets?: number
  [key: string]: any
}

interface AnalysisSummary {
  total_tweets_analyzed?: number
  total_mentions_fetched?: number
  total_likes_received?: number
  total_retweets_received?: number
  total_replies_received?: number
  total_quotes_received?: number
  total_engagement?: number
  avg_likes_per_tweet?: number
  avg_retweets_per_tweet?: number
  avg_engagement_per_tweet?: number
  engagement_rate_percent?: number
  avg_engagement_mentions?: number
  top_performing_tweets?: Tweet[]
  [key: string]: any
}

interface KOLData {
  username?: string
  profile?: any
  user_tweets?: Tweet[]
  mentions?: Tweet[]
  analysis_summary?: AnalysisSummary
  [key: string]: any
}

/**
 * Checks if a tweet text is a retweet (starts with "RT ")
 */
export function isRetweet(text: string): boolean {
  return text.trim().startsWith("RT @")
}

/**
 * Filters out retweets from an array of tweets
 */
export function filterOutRetweets(tweets: Tweet[]): Tweet[] {
  if (!Array.isArray(tweets)) return []
  return tweets.filter(tweet => !isRetweet(tweet.text || ""))
}

/**
 * Recalculates analytics summary by filtering out retweets from user_tweets
 * This ensures that retweet engagement is not counted in the analytics
 */
export function filterRetweetsFromAnalytics(kolData: KOLData): KOLData {
  if (!kolData) return kolData

  // Clone the data to avoid mutation
  const filteredData = { ...kolData }

  // Filter user_tweets to exclude retweets
  const originalTweets = Array.isArray(kolData.user_tweets) ? kolData.user_tweets : []
  const filteredTweets = filterOutRetweets(originalTweets)

  filteredData.user_tweets = filteredTweets

  // Recalculate analysis_summary if it exists
  if (kolData.analysis_summary && filteredTweets.length > 0) {
    const summary = { ...kolData.analysis_summary }

    // Update total tweets analyzed (only non-RT tweets)
    summary.total_tweets_analyzed = filteredTweets.length

    // Recalculate engagement metrics from filtered tweets
    let totalLikes = 0
    let totalRetweets = 0
    let totalReplies = 0
    let totalQuotes = 0

    filteredTweets.forEach(tweet => {
      totalLikes += tweet.like_count || tweet.likes || 0
      totalRetweets += tweet.retweet_count || tweet.retweets || 0
      totalReplies += tweet.reply_count || 0
      totalQuotes += tweet.quote_count || 0
    })

    // Update totals
    summary.total_likes_received = totalLikes
    summary.total_retweets_received = totalRetweets
    summary.total_replies_received = totalReplies
    summary.total_quotes_received = totalQuotes
    summary.total_engagement = totalLikes + totalRetweets + totalReplies + totalQuotes

    // Recalculate averages
    if (filteredTweets.length > 0) {
      summary.avg_likes_per_tweet = totalLikes / filteredTweets.length
      summary.avg_retweets_per_tweet = totalRetweets / filteredTweets.length
      summary.avg_engagement_per_tweet = summary.total_engagement / filteredTweets.length
    } else {
      summary.avg_likes_per_tweet = 0
      summary.avg_retweets_per_tweet = 0
      summary.avg_engagement_per_tweet = 0
    }

    // Recalculate engagement rate
    // Engagement rate = (total engagement / total tweets) or (total engagement / followers) * 100
    const profile = kolData.profile
    if (profile?.followers_count && profile.followers_count > 0) {
      summary.engagement_rate_percent = (summary.total_engagement / profile.followers_count) * 100
    } else if (filteredTweets.length > 0) {
      summary.engagement_rate_percent = (summary.avg_engagement_per_tweet / filteredTweets.length) * 100
    }

    // Filter top_performing_tweets to exclude retweets
    if (Array.isArray(summary.top_performing_tweets)) {
      const filteredTopTweets = filterOutRetweets(summary.top_performing_tweets)

      // Recalculate engagement for each tweet and re-sort
      const tweetsWithEngagement = filteredTopTweets.map(tweet => ({
        ...tweet,
        totalEngagement:
          (tweet.like_count || tweet.likes || 0) +
          (tweet.retweet_count || tweet.retweets || 0) +
          (tweet.reply_count || 0) +
          (tweet.quote_count || 0)
      }))

      // Sort by engagement and take top 5
      summary.top_performing_tweets = tweetsWithEngagement
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, 5)
        .map(({ totalEngagement, ...tweet }) => tweet) // Remove the temp field
    }

    filteredData.analysis_summary = summary
  }

  return filteredData
}

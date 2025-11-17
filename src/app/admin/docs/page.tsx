"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Rocket,
  Target,
  BarChart3,
  Users,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Search,
  FileText,
  ArrowRight,
  Code,
  Zap,
  MousePointer,
  MapPin,
  Eye,
  Shield,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started")

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen text-white font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-64 fixed left-0 top-0 h-screen border-r border-gray-700/50 bg-gray-900/50 p-6 overflow-y-auto">
        <div className="mb-8">
          <BookOpen className="h-8 w-8 text-primary mb-2" />
          <h2 className="text-lg font-bold text-white">Documentation</h2>
        </div>

        <nav className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Platform</p>
            <div className="space-y-1">
              <button
                onClick={() => scrollToSection("getting-started")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "getting-started"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Getting Started
              </button>
              <button
                onClick={() => scrollToSection("campaigns")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "campaigns"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Campaign Management
              </button>
              <button
                onClick={() => scrollToSection("twitter-analytics")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "twitter-analytics"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Twitter Analytics
              </button>
              <button
                onClick={() => scrollToSection("kol-analysis")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "kol-analysis"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                KOL Analysis
              </button>
              <button
                onClick={() => scrollToSection("teams")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "teams"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Team Collaboration
              </button>
              <button
                onClick={() => scrollToSection("best-practices")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "best-practices"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Best Practices
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">SDK</p>
            <div className="space-y-1">
              <button
                onClick={() => scrollToSection("sdk-installation")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "sdk-installation"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Installation
              </button>
              <button
                onClick={() => scrollToSection("sdk-initialization")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "sdk-initialization"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Initialization
              </button>
              <button
                onClick={() => scrollToSection("sdk-tracking")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "sdk-tracking"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Click Tracking
              </button>
              <button
                onClick={() => scrollToSection("sdk-page-tracking")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "sdk-page-tracking"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Page Tracking
              </button>
              <button
                onClick={() => scrollToSection("sdk-location")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "sdk-location"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Location Tracking
              </button>
              <button
                onClick={() => scrollToSection("sdk-identity")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "sdk-identity"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Identity Management
              </button>
              <button
                onClick={() => scrollToSection("sdk-data")}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === "sdk-data"
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Auto-Captured Data
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-6 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Adtivity Documentation
          </h1>
        </div>
        <p className="text-lg text-gray-300">
          Learn how to leverage Adtivity's powerful analytics and KOL analysis
          tools to supercharge your social media campaigns.
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="max-w-6xl mx-auto mb-12">
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => scrollToSection("getting-started")}
              className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors text-left"
            >
              <Rocket className="h-4 w-4" />
              Getting Started
            </button>
            <button
              onClick={() => scrollToSection("campaigns")}
              className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors text-left"
            >
              <Target className="h-4 w-4" />
              Campaign Management
            </button>
            <button
              onClick={() => scrollToSection("twitter-analytics")}
              className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors text-left"
            >
              <BarChart3 className="h-4 w-4" />
              Twitter Analytics
            </button>
            <button
              onClick={() => scrollToSection("kol-analysis")}
              className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors text-left"
            >
              <Sparkles className="h-4 w-4" />
              KOL Analysis
            </button>
            <button
              onClick={() => scrollToSection("sdk-installation")}
              className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors text-left"
            >
              <Code className="h-4 w-4" />
              SDK Installation
            </button>
            <button
              onClick={() => scrollToSection("sdk-tracking")}
              className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors text-left"
            >
              <MousePointer className="h-4 w-4" />
              Click Tracking
            </button>
          </div>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Getting Started Section */}
        <section id="getting-started">
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="h-8 w-8 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">Getting Started</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  What is Adtivity?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Adtivity is a comprehensive social media analytics and
                  influencer analysis platform designed to help brands and
                  marketers make data-driven decisions. With powerful Twitter
                  analytics, AI-powered KOL (Key Opinion Leader)
                  recommendations, and campaign management tools, Adtivity
                  provides everything you need to run successful social media
                  campaigns.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          Real-time Analytics
                        </h4>
                        <p className="text-sm text-gray-400">
                          Track mentions, engagement, and sentiment in real-time
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-accent mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          AI-Powered KOL Analysis
                        </h4>
                        <p className="text-sm text-gray-400">
                          Find perfect influencer matches with AI recommendations
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-green-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          Campaign Management
                        </h4>
                        <p className="text-sm text-gray-400">
                          Create and manage multiple campaigns with ease
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-purple-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          Team Collaboration
                        </h4>
                        <p className="text-sm text-gray-400">
                          Work together with your team on campaigns
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  First Steps
                </h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">
                      1
                    </span>
                    <span>
                      Create your first campaign from the dashboard
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">
                      2
                    </span>
                    <span>Connect your Twitter account for analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">
                      3
                    </span>
                    <span>
                      Start analyzing influencers with the KOL Analysis tool
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">
                      4
                    </span>
                    <span>
                      Monitor your campaign performance on the KPI Dashboard
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>
        </section>

        {/* Campaign Management Section */}
        <section id="campaigns">
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-green-400" />
              <h2 className="text-3xl font-bold text-white">
                Campaign Management
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Creating a Campaign
                </h3>
                <p className="text-gray-300 mb-4">
                  Campaigns are the foundation of your analytics workflow in
                  Adtivity. Each campaign represents a distinct marketing
                  initiative with its own tracking and analytics.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">To create a campaign:</strong>
                  </p>
                  <ol className="space-y-2 text-gray-300 text-sm pl-4">
                    <li>1. Navigate to the Campaigns dashboard</li>
                    <li>2. Click the "Create a Campaign" card</li>
                    <li>3. Enter your campaign name (e.g., "Summer Product Launch")</li>
                    <li>4. Add the campaign URL (optional - your campaign landing page)</li>
                    <li>5. Click "Create Campaign"</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Campaign Dashboard
                </h3>
                <p className="text-gray-300 mb-4">
                  Once created, each campaign has its own dedicated dashboard
                  with:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      KPI Dashboard
                    </h4>
                    <p className="text-xs text-gray-400">
                      Overview of key performance indicators
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Twitter Analytics
                    </h4>
                    <p className="text-xs text-gray-400">
                      Detailed social media metrics and insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Twitter Analytics Section */}
        <section id="twitter-analytics">
          <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-8 w-8 text-cyan-400" />
              <h2 className="text-3xl font-bold text-white">
                Twitter Analytics
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Connecting Your Twitter Account
                </h3>
                <p className="text-gray-300 mb-4">
                  Before accessing analytics, you'll need to connect your
                  Twitter account to Adtivity:
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li>1. Go to any campaign's Twitter Analytics page</li>
                    <li>2. Click "Create Twitter Account" if not connected</li>
                    <li>3. Authenticate with your Twitter credentials</li>
                    <li>4. Grant necessary permissions for analytics data</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Understanding Your Metrics
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Total Mentions
                    </h4>
                    <p className="text-sm text-gray-400">
                      The number of times your account or campaign hashtags were
                      mentioned across Twitter
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Engagement Rate
                    </h4>
                    <p className="text-sm text-gray-400">
                      Average engagement (likes, retweets, replies) per post as a
                      percentage. Higher rates indicate stronger audience
                      connection.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Top Performing Posts
                    </h4>
                    <p className="text-sm text-gray-400">
                      Your highest-engagement tweets, ranked by total interactions.
                      Note: Retweets are excluded from analytics to show only
                      original content performance.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Date Range Filtering
                </h3>
                <p className="text-gray-300 mb-3">
                  Analyze your data over custom time periods (up to 30 days):
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Use the date range selector in the header to choose your
                        time period
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Maximum range is 30 days for optimal performance
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Data updates automatically when you change the range
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* KOL Analysis Section */}
        <section id="kol-analysis">
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">
                KOL Analysis & AI Recommendations
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  What is KOL Analysis?
                </h3>
                <p className="text-gray-300 mb-4">
                  KOL (Key Opinion Leader) Analysis helps you identify the
                  perfect influencers for your brand partnerships. Adtivity's
                  AI-powered system analyzes Twitter users' engagement, content
                  quality, and audience fit to provide data-driven
                  recommendations.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  How to Analyze an Influencer
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Step-by-step process:</strong>
                  </p>
                  <ol className="space-y-2 text-gray-300 text-sm pl-4">
                    <li>1. Click "KOL Analysis" from the Twitter Analytics page</li>
                    <li>2. Search for a Twitter user by username or handle</li>
                    <li>3. Select the number of tweets to analyze (10-100)</li>
                    <li>4. Set mentions to analyze (max 20 for optimal performance)</li>
                    <li>5. Click "Analyze KOL" and wait for results</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Understanding Analysis Results
                </h3>
                <p className="text-gray-300 mb-4">
                  The analysis provides comprehensive metrics, excluding retweets
                  to show only original content performance:
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Engagement Metrics
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Total likes, retweets, and replies (original content only)</li>
                      <li>• Average engagement per tweet</li>
                      <li>• Engagement rate percentage</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Top Performing Tweets
                    </h4>
                    <p className="text-sm text-gray-400">
                      See the influencer's highest-performing original content,
                      ranked by total engagement. This helps you understand their
                      content style and audience preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  AI Brand Fit Recommendation
                </h3>
                <p className="text-gray-300 mb-4">
                  After analyzing a KOL, get AI-powered insights on whether
                  they're a good fit for your brand:
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">To get recommendations:</strong>
                  </p>
                  <ol className="space-y-2 text-gray-300 text-sm pl-4">
                    <li>1. After KOL analysis, click "Get AI Brand Fit Recommendation"</li>
                    <li>2. Select your brand goals (brand awareness, engagement, etc.)</li>
                    <li>3. Optionally add context about your brand and target audience</li>
                    <li>4. Review the AI-generated fit score (1-10) and detailed analysis</li>
                    <li>5. Check strengths and concerns to make informed decisions</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Brand Goals Explained
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Brand Awareness
                    </h4>
                    <p className="text-xs text-gray-400">
                      Increase visibility and reach new audiences
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Engagement
                    </h4>
                    <p className="text-xs text-gray-400">
                      Drive interactions and build community
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Customer Acquisition
                    </h4>
                    <p className="text-xs text-gray-400">
                      Attract and convert new customers
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Thought Leadership
                    </h4>
                    <p className="text-xs text-gray-400">
                      Establish authority and expertise in your field
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Team Collaboration Section */}
        <section id="teams">
          <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-8 w-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">
                Team Collaboration
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Working with Teams
                </h3>
                <p className="text-gray-300 mb-4">
                  Adtivity supports team collaboration, allowing multiple users
                  to work together on campaigns and share insights.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Managing Your Team
                </h3>
                <p className="text-gray-300 mb-4">
                  Access the Teams page from the main navigation to:
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Invite team members to collaborate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Manage user permissions and access levels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Share campaign insights and reports</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Best Practices Section */}
        <section id="best-practices">
          <Card className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">
                Best Practices & Tips
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Optimizing Your Analytics
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      Regular Monitoring
                    </h4>
                    <p className="text-sm text-gray-400">
                      Check your analytics dashboard at least weekly to stay on
                      top of trends and respond quickly to changes in engagement.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Compare Time Periods
                    </h4>
                    <p className="text-sm text-gray-400">
                      Use date range filtering to compare performance across
                      different weeks or months. Look for patterns and seasonal
                      trends.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Focus on Original Content
                    </h4>
                    <p className="text-sm text-gray-400">
                      Remember that retweets are excluded from analytics. Focus on
                      creating high-quality original content for better insights.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  KOL Analysis Tips
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Start with 10-20 tweets:</strong> This
                        provides a good sample size without overwhelming the analysis
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Keep mentions at 20 max:</strong> This
                        ensures faster, more focused analysis of recent activity
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Provide brand context:</strong> When
                        getting AI recommendations, add details about your target audience
                        and industry for more accurate matches
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Select relevant goals:</strong> Choose
                        2-3 primary brand goals that align with your campaign objectives
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Campaign Management Tips
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Use descriptive campaign names that indicate the goal or time
                        period
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Always add a campaign URL to track landing page performance
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Create separate campaigns for different products or initiatives
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SDK Installation Section */}
        <section id="sdk-installation">
          <Card className="bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border-indigo-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Code className="h-8 w-8 text-indigo-400" />
              <h2 className="text-3xl font-bold text-white">
                SDK Installation
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Installing the Adtivity SDK
                </h3>
                <p className="text-gray-300 mb-4">
                  The Adtivity SDK allows you to track user interactions, page views, and more on your website or application.
                </p>
                <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700/50">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>npm install @adtivity/adtivity-sdk</code>
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SDK Initialization Section */}
        <section id="sdk-initialization">
          <Card className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-8 w-8 text-violet-400" />
              <h2 className="text-3xl font-bold text-white">
                SDK Initialization
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Basic Setup
                </h3>
                <p className="text-gray-300 mb-4">
                  Initialize the SDK in your application's root component (e.g., _app.tsx or layout.tsx for Next.js).
                </p>
                <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700/50 mb-4">
                  <p className="text-xs text-gray-400 mb-2">Import the SDK functions:</p>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{`import {
  init,
  initClickTracking,
  initLocationTracking,
  initPageTracking,
} from "@adtivity/adtivity-sdk"`}</code>
                  </pre>
                </div>

                <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-2">Initialize in a useEffect hook:</p>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{`useEffect(() => {
  if (typeof window === "undefined") return
  if (window.__ADTIVITY_BOOTSTRAPPED__) return
  window.__ADTIVITY_BOOTSTRAPPED__ = true

  const API_KEY = process.env.NEXT_PUBLIC_ADTIVITY_API_KEY
  if (!API_KEY) {
    console.error(
      "Adtivity SDK: API key is not configured"
    )
    return
  }

  init({
    apiKey: API_KEY,
    debug: false,
    // Optional tuning:
    // batchSize: 10,
    // flushInterval: 5000,
  })

  initPageTracking()
  initClickTracking()
  initLocationTracking()
}, [])`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Configuration Options
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">apiKey (required)</h4>
                    <p className="text-sm text-gray-400">
                      Your unique API key. Set this in your environment variables as NEXT_PUBLIC_ADTIVITY_API_KEY
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">debug (optional)</h4>
                    <p className="text-sm text-gray-400">
                      Enable debug logging to console. Set to true during development.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">batchSize (optional)</h4>
                    <p className="text-sm text-gray-400">
                      Number of events to batch before sending. Default: 10
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">flushInterval (optional)</h4>
                    <p className="text-sm text-gray-400">
                      Time in milliseconds between automatic batch flushes. Default: 5000ms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SDK Click Tracking Section */}
        <section id="sdk-tracking">
          <Card className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 border-pink-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <MousePointer className="h-8 w-8 text-pink-400" />
              <h2 className="text-3xl font-bold text-white">
                Click Tracking
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Data Attributes for Tracking
                </h3>
                <p className="text-gray-300 mb-4">
                  Add data attributes to your HTML elements to automatically track user interactions.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">General Click Tracking</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Use data-adtivity-track for any clickable element
                    </p>
                    <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{`<div data-adtivity-track="feature-card-click">
  Click me
</div>`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Button-Specific Tracking</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Use data-adtivity-button-track for buttons
                    </p>
                    <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{`<Button
  data-adtivity-button-track="web3-simulate-token-transfer"
>
  <Rocket className="mr-2 h-5 w-5" />
  Simulate Token Transfer
</Button>`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Link-Specific Tracking</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Use data-adtivity-link-track for navigation links
                    </p>
                    <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{`<Link
  href="/cars"
  data-adtivity-link-track="header-nav-cars"
>
  <Car className="mr-2 h-4 w-4" />
  Cars
</Link>`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Custom Properties</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Add custom JSON properties with data-adtivity-props
                    </p>
                    <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{`<button
  data-adtivity-button-track="add-to-cart"
  data-adtivity-props='{"productId": "123", "price": 49.99}'
>
  Add to Cart
</button>`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Auto-Captured Element Data
                </h3>
                <p className="text-gray-300 mb-4">
                  The SDK automatically captures these properties from tracked elements:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Element ID</h4>
                    <p className="text-xs text-gray-400">The id attribute if present</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Text Content</h4>
                    <p className="text-xs text-gray-400">Visible text inside the element</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Element Type</h4>
                    <p className="text-xs text-gray-400">Tag name (button, a, div, etc.)</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Href/Action</h4>
                    <p className="text-xs text-gray-400">Link destination or form action</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">CSS Classes</h4>
                    <p className="text-xs text-gray-400">All class names applied</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Form Values</h4>
                    <p className="text-xs text-gray-400">Input/select values when applicable</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SDK Page Tracking Section */}
        <section id="sdk-page-tracking">
          <Card className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-8 w-8 text-teal-400" />
              <h2 className="text-3xl font-bold text-white">
                Page Tracking
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Automatic Page View Tracking
                </h3>
                <p className="text-gray-300 mb-4">
                  Once initialized with initPageTracking(), the SDK automatically tracks:
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Initial Page Load
                    </h4>
                    <p className="text-sm text-gray-400">
                      Tracks when users first land on your site
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      SPA Navigation
                    </h4>
                    <p className="text-sm text-gray-400">
                      Automatically detects client-side route changes in React, Next.js, and other SPAs
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      URL Updates
                    </h4>
                    <p className="text-sm text-gray-400">
                      Captures query parameters and hash changes
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Auto-Captured Page Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Page URL</h4>
                    <p className="text-xs text-gray-400">Current page path and query string</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Page Title</h4>
                    <p className="text-xs text-gray-400">Document title from {'<title>'} tag</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Referrer</h4>
                    <p className="text-xs text-gray-400">Previous page URL</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Timestamp</h4>
                    <p className="text-xs text-gray-400">ISO 8601 format timestamp</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SDK Location Tracking Section */}
        <section id="sdk-location">
          <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-8 w-8 text-emerald-400" />
              <h2 className="text-3xl font-bold text-white">
                Location Tracking
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  IP-Based Geolocation
                </h3>
                <p className="text-gray-300 mb-4">
                  When you call initLocationTracking(), the SDK automatically enriches all events with geolocation data based on the user's IP address.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-300 mb-3">
                    <strong className="text-white">No user permission required:</strong> This uses server-side IP lookup, not browser geolocation APIs.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Auto-Captured Location Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Country</h4>
                    <p className="text-xs text-gray-400">Country name and code</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Region/State</h4>
                    <p className="text-xs text-gray-400">State or province information</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">City</h4>
                    <p className="text-xs text-gray-400">City-level location data</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">IP Address</h4>
                    <p className="text-xs text-gray-400">User's public IP (anonymized)</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SDK Identity Management Section */}
        <section id="sdk-identity">
          <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-white">
                Identity Management
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  User Identification
                </h3>
                <p className="text-gray-300 mb-4">
                  The SDK provides multiple ways to identify and track users across sessions.
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Anonymous ID</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Auto-generated UUID stored in localStorage. Persists across sessions for returning visitors.
                    </p>
                    <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>// Automatically handled by the SDK
// No code needed - created on first visit</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Session ID</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Per-tab session tracking. Each browser tab gets a unique session ID.
                    </p>
                    <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>// Automatically handled by the SDK
// New session per tab/window</code>
                      </pre>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">User ID (Custom)</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Set a custom user ID when users log in to your application.
                    </p>
                    <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{`import { identify } from "@adtivity/adtivity-sdk"

// After user login
identify({
  userId: "user_12345",
  email: "user@example.com",
  name: "John Doe"
})`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Web3 Support
                </h3>
                <p className="text-gray-300 mb-4">
                  Built-in support for blockchain and Web3 applications.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Wallet Address Tracking</h4>
                    <p className="text-xs text-gray-400">Automatically track connected wallet addresses</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Chain ID Tracking</h4>
                    <p className="text-xs text-gray-400">Multi-blockchain support with chain detection</p>
                  </div>
                </div>
                <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50 mt-3">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{`import { identify } from "@adtivity/adtivity-sdk"

// After wallet connection
identify({
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  chainId: 1 // Ethereum mainnet
})`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SDK Auto-Captured Data Section */}
        <section id="sdk-data">
          <Card className="bg-gradient-to-br from-sky-900/20 to-blue-900/20 border-sky-700/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-8 w-8 text-sky-400" />
              <h2 className="text-3xl font-bold text-white">
                Auto-Captured Data
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Data Captured on Every Event
                </h3>
                <p className="text-gray-300 mb-4">
                  The SDK automatically enriches all events with contextual data to provide comprehensive analytics.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Time & Context Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Timestamps</h4>
                    <p className="text-xs text-gray-400">ISO 8601 format for all events</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">URL Tracking</h4>
                    <p className="text-xs text-gray-400">Current page URL with query params</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Referrer Tracking</h4>
                    <p className="text-xs text-gray-400">Previous page or external referrer</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">User Agent</h4>
                    <p className="text-xs text-gray-400">Browser, device, and OS information</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Location & Network Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">Geolocation</h4>
                    <p className="text-xs text-gray-400">Country, region, and city from IP</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">IP Address</h4>
                    <p className="text-xs text-gray-400">Anonymized public IP address</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Best Practices
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Use descriptive track names:</strong> Make your analytics data easy to understand (e.g., "signup-button-click" vs "button1")
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Leverage custom properties:</strong> Add context with data-adtivity-props for richer insights
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Enable debug mode in development:</strong> Set debug: true to see events in console
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-white">Identify users early:</strong> Call identify() as soon as users log in for better user journey tracking
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Support Section */}
        <section>
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">
                Need More Help?
              </h2>
              <p className="text-gray-300 mb-6">
                If you have questions or need additional support, our team is
                here to help you make the most of Adtivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Link href="mailto:support@adtivity.com">
                    Contact Support
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Link href="/admin/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>Adtivity Documentation • Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      </div>
    </div>
  )
}

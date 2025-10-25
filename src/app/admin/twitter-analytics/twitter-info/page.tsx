"use client"
import { useTwitterMentionsAnalyticsQuery } from "@/redux/api/queryApi"
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

// Function to generate a random number within a range
const getRandomNumber = (min: any, max: any) =>
  Math.floor(Math.random() * (max - min + 1)) + min

// Transform mentions_by_date into a format that Recharts can use.
const transformData = (mentionsByDate: any) => {
  if (Object.keys(mentionsByDate).length === 0) {
    return []
  }
  return Object.keys(mentionsByDate).map((date) => ({
    date,
    mentions: mentionsByDate[date],
    likes: getRandomNumber(50, 200), // Generate mock likes data as it's not in the response
  }))
}

const AnalyticsDashboard = () => {
  const { twitterItems }: any = useSelector((store) => store)
  const {
    data: analyticsData,
    isLoading: analyticsLoad,
    isSuccess: analyticsSuccess,
  }: any = useTwitterMentionsAnalyticsQuery({ twitterId: twitterItems?.id })

  // Display a loading screen while the API call is in progress
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

  // Combine backend data with sample data to ensure all chart data is available
  const combinedData = {
    ...analyticsData,
    mentions_by_date: transformData(analyticsData?.mentions_by_date || {}),
  }
  console.log("ksjd")
  // Check if data is truly empty after all attempts
  if (
    !analyticsData ||
    (analyticsData.total_mentions === 0 &&
      Object.keys(analyticsData.mentions_by_date || {}).length === 0)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen  text-white p-4">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
          <p className="text-2xl font-bold text-gray-400">No Data Available</p>
          <p className="mt-2 text-gray-500">
            The social media query returned no analytics. Please try a different
            search term.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  text-white p-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-100 mb-4 md:mb-0">
          Social Analytics Dashboard
        </h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span className="bg-gray-800 rounded-full px-3 py-1">
            {combinedData?.date_range?.start_date} -{" "}
            {combinedData?.date_range?.end_date}
          </span>
          <span className="bg-gray-800 rounded-full px-3 py-1">Twitter</span>
        </div>
      </header>

      {/* Main Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl transform transition-transform duration-300 hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-400">
            Total Mentions
          </h2>
          <p className="text-5xl font-bold mt-2 text-gray-50">
            {combinedData?.total_mentions?.toLocaleString() || "N/A"}
          </p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl transform transition-transform duration-300 hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-400">Total Likes</h2>
          <p className="text-5xl font-bold mt-2 text-gray-50">
            {combinedData?.total_likes?.toLocaleString() || "N/A"}
          </p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl transform transition-transform duration-300 hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-400">
            Total Followers
          </h2>
          <p className="text-5xl font-bold mt-2 text-gray-50">
            {combinedData?.total_followers?.toLocaleString() || "N/A"}
          </p>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Mentions Over Time Chart */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">
            Mentions & Likes Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={combinedData.mentions_by_date}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" className="text-xs" stroke="#6b7280" />
              <YAxis className="text-xs" stroke="#6b7280" />
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              {/* <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #4b5563",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#e5e7eb" }}
              /> */}
              <Area
                type="monotone"
                dataKey="mentions"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorMentions)"
              />
              <Area
                type="monotone"
                dataKey="likes"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorLikes)"
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ top: -20, left: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Engagement Chart */}
        <section className="bg-gray-800 rounded-2xl p-6 shadow-xl mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">
            Engagement Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={combinedData.engagement_by_type}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" className="text-xs" stroke="#6b7280" />
              <YAxis className="text-xs" stroke="#6b7280" />
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              {/* <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #4b5563",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            /> */}
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
        {/* Top Topics Chart */}
        {/* <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">
            Top Topics by Mentions
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={combinedData.top_topics}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" className="text-xs" stroke="#6b7280" />
              <YAxis
                type="category"
                dataKey="name"
                className="text-xs"
                stroke="#6b7280"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #4b5563",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#e5e7eb" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ top: -20, left: 0 }}
              />
              <Bar
                dataKey="mentions"
                fill="#8884d8"
                barSize={20}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </section>
    </div>
  )
}

export default AnalyticsDashboard

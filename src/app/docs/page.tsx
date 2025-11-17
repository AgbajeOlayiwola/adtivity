"use client"

import Footer from "@/components/layout/footer"
import Header from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import {
  Code,
  Zap,
  MousePointer,
  Eye,
  MapPin,
  Shield,
  Globe,
  Package,
  ArrowRight,
  BookOpen,
} from "lucide-react"
import { useState } from "react"

export default function SdkDocsPage() {
  const [activeSection, setActiveSection] = useState("installation")

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1 pt-24">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 fixed left-0 top-24 h-[calc(100vh-6rem)] border-r border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 p-6 overflow-y-auto z-40">
          <div className="mb-8">
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <h2 className="text-lg font-bold">Adtivity SDK</h2>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => scrollToSection("installation")}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === "installation"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Installation
            </button>
            <button
              onClick={() => scrollToSection("initialization")}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === "initialization"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Initialization
            </button>
            <button
              onClick={() => scrollToSection("click-tracking")}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === "click-tracking"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Click Tracking
            </button>
            <button
              onClick={() => scrollToSection("page-tracking")}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === "page-tracking"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Page Tracking
            </button>
            <button
              onClick={() => scrollToSection("location-tracking")}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === "location-tracking"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Location Tracking
            </button>
            <button
              onClick={() => scrollToSection("identity")}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === "identity"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Identity Management
            </button>
            <button
              onClick={() => scrollToSection("auto-captured")}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                activeSection === "auto-captured"
                  ? "bg-primary/20 text-primary font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Auto-Captured Data
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Adtivity SDK Documentation
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Track user interactions, page views, and behavior with the Adtivity SDK
            </p>
          </div>

          <div className="space-y-12">
            {/* Installation Section */}
            <section id="installation">
              <Card className="p-8 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Installation</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Install the Adtivity SDK via npm to get started with tracking user behavior on your website.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>npm install @adtivity/adtivity-sdk</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </section>

            {/* Initialization Section */}
            <section id="initialization">
              <Card className="p-8 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Initialization</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Basic Setup</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Initialize the SDK in your application's root component (e.g., _app.tsx or layout.tsx for Next.js).
                    </p>

                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-4">
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

                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Initialize in a useEffect hook:</p>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        <code>{`useEffect(() => {
  if (typeof window === "undefined") return
  if (window.__ADTIVITY_BOOTSTRAPPED__) return
  window.__ADTIVITY_BOOTSTRAPPED__ = true

  const API_KEY = process.env.NEXT_PUBLIC_ADTIVITY_API_KEY
  if (!API_KEY) {
    console.error("Adtivity SDK: API key is not configured")
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
                    <h3 className="text-xl font-semibold mb-3">Configuration Options</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">apiKey (required)</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your unique API key. Set this in your environment variables as NEXT_PUBLIC_ADTIVITY_API_KEY
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">debug (optional)</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable debug logging to console. Set to true during development.
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">batchSize (optional)</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Number of events to batch before sending. Default: 10
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">flushInterval (optional)</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Time in milliseconds between automatic batch flushes. Default: 5000ms
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Click Tracking Section */}
            <section id="click-tracking">
              <Card className="p-8 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <MousePointer className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Click Tracking</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Data Attributes for Tracking</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Add data attributes to your HTML elements to automatically track user interactions.
                    </p>

                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">General Click Tracking</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Use data-adtivity-track for any clickable element
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            <code>{`<div data-adtivity-track="feature-card-click">
  Click me
</div>`}</code>
                          </pre>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Button-Specific Tracking</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Use data-adtivity-button-track for buttons
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
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

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Link-Specific Tracking</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Use data-adtivity-link-track for navigation links
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
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

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Custom Properties</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Add custom JSON properties with data-adtivity-props
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
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
                    <h3 className="text-xl font-semibold mb-3">Auto-Captured Element Data</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      The SDK automatically captures these properties from tracked elements:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Element ID</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">The id attribute if present</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Text Content</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Visible text inside the element</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Element Type</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tag name (button, a, div, etc.)</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Href/Action</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Link destination or form action</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">CSS Classes</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">All class names applied</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Form Values</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Input/select values when applicable</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Page Tracking Section */}
            <section id="page-tracking">
              <Card className="p-8 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Page Tracking</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Automatic Page View Tracking</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Once initialized with initPageTracking(), the SDK automatically tracks:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          Initial Page Load
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Tracks when users first land on your site
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          SPA Navigation
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Automatically detects client-side route changes in React, Next.js, and other SPAs
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          URL Updates
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Captures query parameters and hash changes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Auto-Captured Page Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Page URL</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Current page path and query string</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Page Title</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Document title from &lt;title&gt; tag</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Referrer</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Previous page URL</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Timestamp</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">ISO 8601 format timestamp</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Location Tracking Section */}
            <section id="location-tracking">
              <Card className="p-8 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Location Tracking</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">IP-Based Geolocation</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      When you call initLocationTracking(), the SDK automatically enriches all events with geolocation data based on the user's IP address.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm">
                        <strong>No user permission required:</strong> This uses server-side IP lookup, not browser geolocation APIs.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Auto-Captured Location Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Country</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Country name and code</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Region/State</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">State or province information</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">City</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">City-level location data</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">IP Address</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">User's public IP (anonymized)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Identity Management Section */}
            <section id="identity">
              <Card className="p-8 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Identity Management</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">User Identification</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      The SDK provides multiple ways to identify and track users across sessions.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Anonymous ID</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Auto-generated UUID stored in localStorage. Persists across sessions for returning visitors.
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            <code>// Automatically handled by the SDK{'\n'}// No code needed - created on first visit</code>
                          </pre>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Session ID</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Per-tab session tracking. Each browser tab gets a unique session ID.
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            <code>// Automatically handled by the SDK{'\n'}// New session per tab/window</code>
                          </pre>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">User ID (Custom)</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Set a custom user ID when users log in to your application.
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
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
                    <h3 className="text-xl font-semibold mb-3">Web3 Support</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Built-in support for blockchain and Web3 applications.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Wallet Address Tracking</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Automatically track connected wallet addresses</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Chain ID Tracking</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Multi-blockchain support with chain detection</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
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

            {/* Auto-Captured Data Section */}
            <section id="auto-captured">
              <Card className="p-8 border-2">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Auto-Captured Data</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Data Captured on Every Event</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      The SDK automatically enriches all events with contextual data to provide comprehensive analytics.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Time & Context Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Timestamps</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">ISO 8601 format for all events</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">URL Tracking</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Current page URL with query params</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Referrer Tracking</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Previous page or external referrer</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">User Agent</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Browser, device, and OS information</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Location & Network Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">Geolocation</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Country, region, and city from IP</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-1">IP Address</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Anonymized public IP address</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Best Practices</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Use descriptive track names:</strong> Make your analytics data easy to understand (e.g., "signup-button-click" vs "button1")
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Leverage custom properties:</strong> Add context with data-adtivity-props for richer insights
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Enable debug mode in development:</strong> Set debug: true to see events in console
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Identify users early:</strong> Call identify() as soon as users log in for better user journey tracking
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

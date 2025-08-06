import Footer from "@/components/layout/footer"
import Header from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SdkDocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="space-y-8 p-8">
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          SDK Integration Guide
        </h1>

        <div className="grid gap-6">
          {/* Prerequisites Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Before you begin, ensure you have the following:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  **An API Key:** You&apos;ll need an API key to authenticate
                  your application with our service. You can find this in your
                  project settings.
                </li>
                <li>
                  **An Application to Integrate:** This guide assumes you have a
                  basic web application where you want to track events.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Step 1 Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Step 1: Install the SDK</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The easiest way to get started is by installing our package from
                npm. Open your terminal in your project&apos;s root directory
                and run the following command:
              </p>
              <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                <code>npm install @your-company/analytics-sdk</code>
              </pre>
            </CardContent>
          </Card>

          {/* Step 2 Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Step 2: Initialize the SDK</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Once installed, you can initialize the SDK in your
                application&apos;s entry point (e.g., `App.js` or `index.js`).
                It&apos;s best to do this once when your application first
                loads.
              </p>
              <p className="mb-4">
                **Important:** Replace `"YOUR_API_KEY"` with your actual API
                key.
              </p>
              <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                <code>{`import AnalyticsSDK from '@your-company/analytics-sdk';

// Initialize the SDK with your API key
const sdk = new AnalyticsSDK({
  apiKey: "YOUR_API_KEY"
});

// Make the sdk instance globally available or pass it via context
export default sdk;`}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Step 3 Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Step 3: Track Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                With the SDK initialized, you can start tracking key user
                actions. The `track` method is the primary function for sending
                events. It accepts two arguments: the event name (a string) and
                an optional payload of properties (an object).
              </p>
              <h3 className="text-lg font-semibold mt-6 mb-2">
                Tracking Page Views
              </h3>
              <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                <code>{`import sdk from './sdk';
import { useEffect } from 'react';

function MyPage() {
  useEffect(() => {
    sdk.track("Page Viewed", {
      path: window.location.pathname,
      title: document.title
    });
  }, []);

  return (
    // Your page content
  );
}`}</code>
              </pre>
              <h3 className="text-lg font-semibold mt-6 mb-2">
                Tracking Button Clicks
              </h3>
              <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                <code>{`import sdk from './sdk';

function HeroSection() {
  const handleHeroButtonClick = () => {
    sdk.track("Hero: Main CTA Clicked", {
      button_text: "Get Started Now",
      location: "Hero Section"
    });
    window.location.href = "/get-started";
  };

  return (
    <button onClick={handleHeroButtonClick}>
      Get Started Now
    </button>
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Verification Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                After you&apos;ve integrated the SDK and deployed your changes,
                you should be able to see the events appear in your dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

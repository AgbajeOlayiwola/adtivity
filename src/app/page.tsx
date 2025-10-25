"use client" // This directive is necessary for client-side components in Next.js 13+ App Router
import DotGrid from "@/components/dotgrid"
import FeaturesSection from "@/components/landing/features-section"
import HeroSection from "@/components/landing/hero-section"
import Footer from "@/components/layout/footer"
import Header from "@/components/layout/header"
import { Button } from "@/components/ui/button"

const PricingSection = () => {
  // Placeholder Pricing Section
  return (
    <section
      id="pricing"
      className="py-20 md:py-28 bg-background relative overflow-hidden"
    >
      {/* <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-background to-transparent opacity-50 -z-0"></div> */}
      {/* <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent opacity-50 -z-0"></div> */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Transparent{" "}
            <span className="bg-clip-text text-transparent bg-futuristic-gradient">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your Web3 project needs. No hidden fees,
            just pure value.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Basic Plan */}
          <div className="border border-border/50 rounded-xl p-8 flex flex-col bg-card/30 backdrop-blur-sm shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <h3 className="text-2xl font-semibold font-headline text-primary">
              Starter
            </h3>
            <p className="mt-2 text-muted-foreground">
              For individual Web3 developers & small projects.
            </p>
            <div className="mt-6">
              {/* <span className="text-5xl font-bold">$29</span> */}
              {/* <span className="text-muted-foreground">/month</span> */}
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-grow">
              <li>Basic Web3 KPI Dashboard (EVM)</li>
              <li>Limited Smart Contract Event Tracking</li>
              <li>Standard Reports</li>
            </ul>
            <Button
              variant="outline"
              className="cursor-target mt-8 w-full border-primary text-primary hover:bg-primary/10"
            >
              Choose Plan
            </Button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="border-2 border-primary rounded-xl p-8 flex flex-col bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/30 scale-105 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 text-sm font-semibold tracking-wide text-primary-foreground bg-primary rounded-full shadow-md">
              Most Popular
            </div>
            <h3 className="text-2xl font-semibold font-headline text-accent">
              Professional
            </h3>
            <p className="mt-2 text-muted-foreground">
              For growing Web3 companies and dApps on EVM & Solana.
            </p>
            <div className="mt-6">
              {/* <span className="text-5xl font-bold">$99</span> */}
              {/* <span className="text-muted-foreground">/month</span> */}
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-grow">
              <li>Advanced Web3 KPI Dashboard (EVM & Solana)</li>
              <li>Full Smart Contract Analytics</li>
              <li>Solana dApp Integration</li>
              <li>On-chain/Off-chain Attribution</li>
              <li>Custom Reports & Export</li>
              <li>Priority Support</li>
            </ul>
            <Button className="cursor-target mt-8 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Choose Plan
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="border border-border/50 rounded-xl p-8 flex flex-col bg-card/30 backdrop-blur-sm shadow-lg hover:shadow-accent/20 transition-shadow duration-300">
            <h3 className="text-2xl font-semibold font-headline text-accent">
              Enterprise
            </h3>
            <p className="mt-2 text-muted-foreground">
              For large-scale Web3 platforms & protocols across multiple chains.
            </p>
            <div className="mt-6">
              {/* <span className="text-4xl font-bold">Custom</span> */}
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-grow">
              <li>All Professional Features</li>
              <li>Dedicated Account Manager</li>
              <li>Custom Blockchain Integrations (Solana, EVM, etc.)</li>
              <li>SLA & Advanced Security</li>
            </ul>
            <Button
              variant="outline"
              className="cursor-target mt-8 w-full border-accent text-accent hover:bg-accent/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/20 via-background to-accent/20">
      {/* <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-6">
          Ready to Master Your Web3 Analytics on Solana & Beyond?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Join innovative Web3 projects leveraging Adtivity for clear
          measurement and attribution insights across multiple blockchains.
        </p>
        <Link href="/login">
          <Button
            size="lg"
            className="cursor-target bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-4 text-xl shadow-xl shadow-primary/40 transition-all duration-300 hover:shadow-primary/60 transform hover:scale-105"
          >
            Start Your Free Trial Today
          </Button>
        </Link>
      </div> */}
    </section>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <div
          style={{
            width: "100%",
            height: "800px",
            position: "absolute",
            zIndex: 1,
          }}
        >
          <DotGrid
            dotSize={5}
            gap={10}
            baseColor="#1f2a30"
            activeColor="#ff5b04"
            proximity={100}
            shockRadius={60}
            shockStrength={15}
            resistance={750}
            returnDuration={0.5}
          />
        </div>
        <HeroSection />
        <FeaturesSection />
        {/* Pass the adtivityInstance down to child components that need to manually track events */}
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

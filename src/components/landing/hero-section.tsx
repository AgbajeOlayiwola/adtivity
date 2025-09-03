import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import RotatingText from "../rotating-text"

const HeroSection = () => {
  return (
    <section className=" py-20 md:py-32 bg-dark-grid overflow-hidden">
      <div
        className=" inset-0 opacity-10 bg-gradient-to-br from-primary via-transparent to-accent animate-gradient-bg"
        style={{ backgroundSize: "200% 200%" }}
      ></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center px-4 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
              <Zap className="w-4 h-4 mr-2" /> Web3 Analytics Reimagined
            </span>

            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
              Measure Your Impact on{" "}
              <span className="bg-clip-text text-transparent ">
                <RotatingText
                  texts={["Web3", "Web2", "Data", "Twitter"]}
                  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg w-fit bg-futuristic-gradient"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={1500}
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto md:mx-0">
              Adtivity is a measurement and attribution platform for Web 3,
              providing clear insights for your decentralized applications,
              including Solana and EVM-compatible chains. Track user activity
              and key on-chain data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="cursor-target w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
                >
                  Explore Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-target w-full sm:w-auto border-accent text-accent hover:bg-accent/10 hover:text-accent rounded-full px-8 py-3 text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl opacity-50 animate-subtle-glow"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 600 400"
              className="rounded-xl shadow-2xl relative z-10 transform transition-all duration-500 hover:scale-105 w-full h-auto"
              aria-labelledby="heroSvgTitlePlanet"
            >
              <title id="heroSvgTitlePlanet">
                Abstract representation of a planet with continents made of
                glowing dots.
              </title>
              <defs>
                <radialGradient
                  id="gradPlanetMain"
                  cx="30%"
                  cy="30%"
                  r="70%"
                  fx="40%"
                  fy="40%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{
                      stopColor: "hsl(var(--primary) / 0.3)",
                      stopOpacity: 1,
                    }}
                  />
                </radialGradient>
                <filter
                  id="svgDotGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Main Planet Body */}
              <circle
                cx="300"
                cy="200"
                r="150"
                fill="url(#gradPlanetMain)"
                opacity="0.8"
              />
              <circle
                cx="300"
                cy="200"
                r="150"
                fill="transparent"
                stroke="hsl(var(--primary) / 0.5)"
                strokeWidth="2"
              />

              {/* Continent Dots - Group 1 (e.g., Americas-like) */}
              <g
                className="animate-pulsate-dot"
                style={{ animationDelay: "0s" }}
              >
                <circle
                  cx="220"
                  cy="150"
                  r="8"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="235"
                  cy="175"
                  r="10"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="225"
                  cy="200"
                  r="7"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="240"
                  cy="220"
                  r="9"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="210"
                  cy="180"
                  r="6"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
              </g>

              {/* Continent Dots - Group 2 (e.g., Afro-Eurasia-like) */}
              <g
                className="animate-pulsate-dot"
                style={{ animationDelay: "0.3s" }}
              >
                <circle
                  cx="300"
                  cy="160"
                  r="10"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="330"
                  cy="150"
                  r="8"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="350"
                  cy="180"
                  r="12"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="340"
                  cy="210"
                  r="9"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="310"
                  cy="200"
                  r="10"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="360"
                  cy="230"
                  r="7"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="280"
                  cy="230"
                  r="8"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
              </g>

              {/* Continent Dots - Group 3 (e.g., Australia-like) */}
              <g
                className="animate-pulsate-dot"
                style={{ animationDelay: "0.6s" }}
              >
                <circle
                  cx="380"
                  cy="280"
                  r="10"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="395"
                  cy="270"
                  r="7"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
              </g>

              {/* Smaller island/dots */}
              <g
                className="animate-pulsate-dot"
                style={{ animationDelay: "0.9s" }}
              >
                <circle
                  cx="180"
                  cy="250"
                  r="5"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
                <circle
                  cx="420"
                  cy="130"
                  r="6"
                  fill="hsl(var(--accent))"
                  filter="url(#svgDotGlow)"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

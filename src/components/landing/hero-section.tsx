import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 bg-dark-grid overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary via-transparent to-accent animate-gradient-bg" style={{ backgroundSize: '200% 200%' }}></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center px-4 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
              <Zap className="w-4 h-4 mr-2" /> Web3 Analytics Reimagined
            </span>
            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
              Measure Your Impact in <span className="bg-clip-text text-transparent bg-futuristic-gradient">Web3</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto md:mx-0">
              Adtivity is a measurement and attribution platform for Web 3, providing clear insights for your decentralized applications, including Solana and EVM-compatible chains. Track user activity and key on-chain data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105">
                  Explore Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-accent text-accent hover:bg-accent/10 hover:text-accent rounded-full px-8 py-3 text-lg transition-all duration-300 transform hover:scale-105">
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
              aria-labelledby="heroSvgTitle"
            >
              <title id="heroSvgTitle">Abstract representation of interconnected planets and data paths in a network</title>
              <defs>
                <radialGradient id="gradPlanet1Hero" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'hsl(var(--primary) / 0.6)', stopOpacity: 1}} />
                </radialGradient>
                <radialGradient id="gradPlanet2Hero" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'hsl(var(--accent) / 0.6)', stopOpacity: 1}} />
                </radialGradient>
                 <filter id="svgPathGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Planets */}
              <circle cx="100" cy="120" r="40" fill="url(#gradPlanet1Hero)" />
              <circle cx="480" cy="100" r="60" fill="url(#gradPlanet2Hero)" />
              <circle cx="250" cy="300" r="30" fill="url(#gradPlanet1Hero)" />
              <circle cx="500" cy="320" r="20" fill="url(#gradPlanet2Hero)" />
              <circle cx="350" cy="180" r="25" fill="hsl(var(--muted))" opacity="0.5" />


              {/* Flight Paths */}
              <path
                d="M100,120 Q250,50 480,100"
                stroke="hsl(var(--accent))"
                fill="none"
                className="animate-pulsate-path"
                style={{ animationDelay: '0s' }}
              />
              <path
                d="M100,120 Q150,250 250,300"
                stroke="hsl(var(--primary))"
                fill="none"
                className="animate-pulsate-path"
                style={{ animationDelay: '0.4s' }}
              />
              <path
                d="M250,300 Q380,250 480,100"
                stroke="hsl(var(--accent))"
                fill="none"
                className="animate-pulsate-path"
                style={{ animationDelay: '0.8s' }}
              />
               <path
                d="M480,100 C550,200 550,280 500,320"
                stroke="hsl(var(--primary))"
                fill="none"
                className="animate-pulsate-path"
                style={{ animationDelay: '1.2s' }}
              />
              <path
                d="M100,120 C200,180 300,170 350,180"
                stroke="hsl(var(--accent))"
                fill="none"
                className="animate-pulsate-path"
                style={{ animationDelay: '1.6s' }}
              />
               <path
                d="M350,180 C400,190 450,250 500,320"
                stroke="hsl(var(--primary))"
                fill="none"
                className="animate-pulsate-path"
                style={{ animationDelay: '2s' }}
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

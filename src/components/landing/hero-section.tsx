import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 bg-dark-grid overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary via-transparent to-accent animate-gradient-bg" style={{ backgroundSize: '200% 200%' }}></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center px-4 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
              <Zap className="w-4 h-4 mr-2" /> Next-Gen Analytics
            </span>
            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
              Future-Proof Your <span className="bg-clip-text text-transparent bg-futuristic-gradient">Decisions</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto md:mx-0">
              Adtivity empowers your business with cutting-edge AI analytics, transforming raw data into actionable insights and predictive foresight.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105">
                  Get Started Free
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
            <Image
              src="https://placehold.co/600x400.png"
              alt="Futuristic analytics dashboard"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl relative z-10 transform transition-all duration-500 hover:scale-105"
              data-ai-hint="abstract data"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

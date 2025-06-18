import FeatureCard from './feature-card';
import { BarChartBig, SearchCode, Link2, FileText, ShieldCheck, Cpu } from 'lucide-react';

const features = [
  {
    icon: BarChartBig,
    title: 'Web3 KPI Dashboard',
    description: 'Track key on-chain and off-chain metrics with a comprehensive, interactive dashboard tailored for Web3.',
  },
  {
    icon: SearchCode,
    title: 'Smart Contract Analytics',
    description: 'Deep dive into smart contract interactions, user behavior, and transaction patterns.',
  },
  {
    icon: Link2,
    title: 'Multi-Channel Attribution',
    description: 'Understand which channels drive user acquisition and engagement for your dApp or protocol.',
  },
  {
    icon: FileText,
    title: 'Custom Reports',
    description: 'Generate and export customizable reports on user activity, token flows, and campaign performance.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable Data',
    description: 'Robust data aggregation and analysis, ensuring accuracy and security for your Web3 insights.',
  },
  {
    icon: Cpu,
    title: 'NFT & DeFi Insights',
    description: 'Specific modules for analyzing NFT project performance and DeFi protocol engagement.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Unlock <span className="bg-clip-text text-transparent bg-futuristic-gradient">Web3 Growth</span> with Adtivity
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Adtivity offers a suite of advanced tools for measurement and attribution in the decentralized web.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

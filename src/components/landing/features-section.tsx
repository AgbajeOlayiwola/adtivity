import FeatureCard from './feature-card';
import { BarChartBig, AlertTriangle, BrainCircuit, FileText, ShieldCheck, Cpu } from 'lucide-react';

const features = [
  {
    icon: BarChartBig,
    title: 'KPI Dashboard',
    description: 'Interactive dashboard displaying key performance indicators with stunning visualizations.',
  },
  {
    icon: AlertTriangle,
    title: 'Anomaly Alerts',
    description: 'AI-powered anomaly detection to highlight unusual data patterns and potential issues.',
  },
  {
    icon: BrainCircuit,
    title: 'Predictive Forecasting',
    description: 'Forecast future trends based on historical data with AI-driven summaries.',
  },
  {
    icon: FileText,
    title: 'Custom Reports',
    description: 'Generate and export customizable reports tailored to your specific needs.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'Robust user authentication and role-based access control to protect your data.',
  },
  {
    icon: Cpu,
    title: 'Data Visualization',
    description: 'Engage with your data through interactive charts and graphs for clear insights.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Discover the <span className="bg-clip-text text-transparent bg-futuristic-gradient">Power of Adtivity</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Adtivity offers a suite of advanced tools to help you understand your data like never before.
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

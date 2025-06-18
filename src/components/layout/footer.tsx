import Logo from '@/components/shared/logo';
import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo size="text-2xl" />
            <p className="mt-4 text-sm text-muted-foreground">
              Adtivity: Measurement and attribution for Web 3.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Solutions</h3>
              <ul role="list" className="mt-4 space-y-2">
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-accent transition-colors">Web3 KPI Dashboard</Link></li>
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-accent transition-colors">Smart Contract Analytics</Link></li>
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-accent transition-colors">NFT Project Tracking</Link></li>
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-accent transition-colors">DeFi Protocol Insights</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>
              <ul role="list" className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">API Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
              <ul role="list" className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">Press</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border/40 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Adtivity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import Link from 'next/link';
import Logo from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';

const Header = () => {
  // Placeholder for authentication state
  const isAuthenticated = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/#features" className="text-foreground/80 hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="default" size="sm">
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
           <Link href="/dashboard">
             <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105">
                View Demo
             </Button>
           </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

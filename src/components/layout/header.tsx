"use client"

import Logo from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LogIn, Menu, User, X } from "lucide-react"
import Link from "next/link"
import * as React from "react"

const Header = () => {
  // Placeholder for authentication state
  const isAuthenticated = false
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navLinks = (
    <>
      <Link
        href="/#features"
        className="block py-2 text-foreground/80 hover:text-foreground transition-colors md:py-0"
      >
        Features
      </Link>
      <Link
        href="/#pricing"
        className="block py-2 text-foreground/80 hover:text-foreground transition-colors md:py-0"
      >
        Pricing
      </Link>
      <Link
        href="/docs"
        className="block py-2 text-foreground/80 hover:text-foreground transition-colors md:py-0"
      >
        Docs
      </Link>
      {isAuthenticated ? (
        <Link href="/dashboard" className="block md:py-0">
          <Button
            variant="default"
            size="sm"
            className="cursor-target w-full md:w-auto"
          >
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/login" className="block md:py-0">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-target w-full md:w-auto text-accent hover:text-accent hover:bg-accent/10"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        </Link>
      )}
      {/* <Link href="/dashboard" className="block md:py-0">
        <Button
          variant="default"
          className="cursor-target w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
        >
          View Demo
        </Button>
      </Link> */}
    </>
  )

  return (
    <header className="absolute flex top-4 justify-center z-50 w-full  supports-[backdrop-filter]:bg-background/60">
      <div className="container w-[80%] flex h-16 max-w-screen-2xl items-center justify-between rounded-lg backdrop-blur">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="cursor-target hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-xs bg-background p-6"
            >
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <Logo />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col space-y-4 text-base">
                  {/* Wrap links in SheetClose to close menu on navigation for SPA behavior */}
                  {React.Children.map(navLinks, (child) => (
                    <SheetClose asChild>{child}</SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header

import TargetCursor from "@/components/targetcursor"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/redux/provider"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Adtivity - Web3 Measurement & Attribution for Solana & EVM",
  description:
    "Adtivity is a measurement and attribution platform for Web 3, empowering your decentralized applications (including Solana and EVM chains) with clear insights.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Providers>
          <TargetCursor spinDuration={2} hideDefaultCursor={true} />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

"use client"

import AdtivityLogo from "@/components/assets/images/Adtivity_Full_Color_Logo_2.6"
import {
  groupedCampaignNavLinks,
  secondaryNavLinks,
  topLevelNavLinks,
} from "@/components/layout/navigation-links"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useUseInfoQuery } from "@/redux/api/queryApi"
import { clearDocuments } from "@/redux/slices/documents"
import { clearProfile, setProfile } from "@/redux/slices/profileSlice"
import { clearApikey } from "@/redux/slices/qpikey"
import { clearTwitterItems } from "@/redux/slices/twitterItems"
import { clearToken } from "@/redux/slices/userTokenSlice"
import { deleteCookie } from "cookies-next"
import { Bell, ChevronDown, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useDispatch, useSelector } from "react-redux"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useDispatch()
  const pathname = usePathname()
  const { documents }: any = useSelector((store) => store)

  // Determine if we're in campaign view
  const isInCampaignView = documents?.id && pathname.includes("/company-info")
  const settings = () => {
    window.location.href = "/admin/dashboard"
  }

  const LogOut = async () => {
    try {
      await Promise.all([
        dispatch(clearToken()),
        dispatch(clearProfile()),
        dispatch(clearDocuments()),
        dispatch(clearApikey()),
        dispatch(clearTwitterItems()),
      ])

      // remove the cookie the middleware checks
      deleteCookie("auth-token", { path: "/" })

      // (optional) if you also set "token" earlier
      // deleteCookie("token", { path: "/" });

      window.location.assign("/login")
    } catch (e) {
      console.error("Logout error:", e)
    }
  }
  const {
    data: userInfoData,
    isLoading: userInfoLoad,
    isSuccess: userInfoSuccess,
    isError: userInfoFalse,
    error: userInfoErr,
    refetch: userInfoReset,
  }: any = useUseInfoQuery(null)
  React.useEffect(() => {
    if (userInfoSuccess) {
      dispatch(setProfile(userInfoData))
    }
  }, [userInfoSuccess])

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 w-[100%]">
        <Sidebar
          collapsible="icon"
          className="border-r border-gray-700/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl shadow-2xl shadow-primary/5"
        >
          <SidebarHeader className="p-6 flex items-center justify-between border-b border-gray-700/30">
            <AdtivityLogo />
            <SidebarTrigger className="hidden md:group-data-[collapsible=icon]:hidden hover:bg-gray-800/50 transition-colors" />
          </SidebarHeader>
          <SidebarContent className="p-3 flex-grow">
            {isInCampaignView ? (
              // Campaign-specific navigation
              <>
                <div className="px-2 mb-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:bg-gray-800/60"
                    onClick={() => (window.location.href = "/admin/dashboard")}
                  >
                    ← Back to Campaigns
                  </Button>
                  <div className="mt-2 p-2 rounded-lg bg-gray-800/50">
                    <p className="text-xs text-gray-400">Current Campaign</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {documents?.name || "Unnamed Campaign"}
                    </p>
                  </div>
                </div>
                {Object.entries(groupedCampaignNavLinks).map(
                  ([groupName, links]) => (
                    <SidebarGroup key={groupName}>
                      <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-2 px-2">
                        {groupName}
                      </SidebarGroupLabel>
                      <SidebarMenu>
                        {links.map((link) => (
                          <SidebarMenuItem key={link.href}>
                            <Link href={link.href} passHref>
                              <SidebarMenuButton
                                isActive={
                                  link.isActive
                                    ? link.isActive(pathname)
                                    : pathname.startsWith(link.href)
                                }
                                tooltip={{
                                  children: link.label,
                                  className:
                                    "bg-primary text-primary-foreground shadow-lg",
                                }}
                                className="text-gray-300 hover:bg-gray-800/60 hover:text-gray-100 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/90 data-[active=true]:to-accent/90 data-[active=true]:text-white data-[active=true]:font-semibold data-[active=true]:shadow-lg data-[active=true]:shadow-primary/20 group-data-[collapsible=icon]:justify-center rounded-xl"
                              >
                                <link.icon className="h-5 w-5 shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden">
                                  {link.label}
                                </span>
                              </SidebarMenuButton>
                            </Link>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroup>
                  )
                )}
              </>
            ) : (
              // Top-level navigation (Campaigns & Teams)
              <SidebarMenu>
                {topLevelNavLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <Link href={link.href} passHref>
                      <SidebarMenuButton
                        isActive={
                          link.isActive
                            ? link.isActive(pathname)
                            : pathname.startsWith(link.href)
                        }
                        tooltip={{
                          children: link.label,
                          className:
                            "bg-primary text-primary-foreground shadow-lg",
                        }}
                        className="text-gray-300 hover:bg-gray-800/60 hover:text-gray-100 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/90 data-[active=true]:to-accent/90 data-[active=true]:text-white data-[active=true]:font-semibold data-[active=true]:shadow-lg data-[active=true]:shadow-primary/20 group-data-[collapsible=icon]:justify-center rounded-xl"
                      >
                        <link.icon className="h-5 w-5 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {link.label}
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarContent>
          <SidebarFooter className="p-3 border-t border-gray-700/30 bg-gray-900/50">
            <SidebarMenu>
              {secondaryNavLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <div
                    className="cursor-target"
                    onClick={link.label === "Logout" ? LogOut : settings}
                  >
                    <SidebarMenuButton
                      isActive={
                        pathname.startsWith(link.href) && link.href !== "/"
                      }
                      tooltip={{
                        children: link.label,
                        className:
                          "bg-primary text-primary-foreground shadow-lg",
                      }}
                      className="text-gray-300 hover:bg-gray-800/60 hover:text-gray-100 transition-all duration-200 group-data-[collapsible=icon]:justify-center rounded-xl"
                    >
                      <link.icon className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {link.label}
                      </span>
                    </SidebarMenuButton>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-transparent">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-gray-700/30 bg-gray-900/80 backdrop-blur-xl shadow-lg px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden hover:bg-gray-800/50 transition-colors" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-64 bg-gray-800/50 border-gray-700/50 focus:border-primary text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 py-1 rounded-full h-auto hover:bg-gray-800/50 transition-all"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage
                        src="https://placehold.co/40x40.png"
                        alt="User Avatar"
                        data-ai-hint="person avatar"
                      />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium text-gray-200">
                      {userInfoData?.name}
                      <br /> {userInfoData?.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-primary/5"
                >
                  <DropdownMenuLabel className="text-gray-200">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700/50" />
                  <DropdownMenuItem className="text-gray-300 focus:bg-gray-800/60 focus:text-gray-100">
                    <Link
                      href="/admin/profile"
                      className="cursor-target w-full"
                    >
                      Profile{" "}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 focus:bg-gray-800/60 focus:text-gray-100">
                    <Link
                      href="/admin/billing"
                      className="cursor-target w-full"
                    >
                      Billing{" "}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 focus:bg-gray-800/60 focus:text-gray-100">
                    <Link
                      href="/admin/settings"
                      className="cursor-target w-full"
                    >
                      Settings{" "}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700/50" />
                  <DropdownMenuItem className="text-gray-300 focus:bg-gray-800/60 focus:text-gray-100">
                    <Link href="/" className="cursor-target w-full">
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 bg-dark-grid">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

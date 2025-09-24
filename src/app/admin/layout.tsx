"use client"

import {
  groupedNavLinks,
  secondaryNavLinks,
} from "@/components/layout/navigation-links"
import Logo from "@/components/shared/logo"
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
import { useDispatch } from "react-redux"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useDispatch()
  const pathname = usePathname()
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
      <div className="flex min-h-screen bg-background w-[100%]">
        <Sidebar
          collapsible="icon"
          className="border-r border-sidebar-border shadow-lg"
        >
          <SidebarHeader className="p-4 flex items-center justify-between">
            <Logo size="text-2xl" />
            <SidebarTrigger className="hidden md:group-data-[collapsible=icon]:hidden" />
          </SidebarHeader>
          <SidebarContent className="p-2 flex-grow">
            {Object.entries(groupedNavLinks).map(([groupName, links]) => (
              <SidebarGroup key={groupName}>
                <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
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
                            className: "bg-primary text-primary-foreground",
                          }}
                          className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-semibold group-data-[collapsible=icon]:justify-center"
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
            ))}
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
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
                        className: "bg-primary text-primary-foreground",
                      }}
                      className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
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

        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-64 bg-card/50 border-border/70 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 py-1 rounded-full h-auto"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="https://placehold.co/40x40.png"
                        alt="User Avatar"
                        data-ai-hint="person avatar"
                      />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {userInfoData?.name}
                      <br /> {userInfoData?.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-popover border-border shadow-xl"
                >
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link
                      href="/admin/profile"
                      className="cursor-target w-full"
                    >
                      Profile{" "}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/admin/billing"
                      className="cursor-target w-full"
                    >
                      Billing{" "}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/admin/settings"
                      className="cursor-target w-full"
                    >
                      Settings{" "}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
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

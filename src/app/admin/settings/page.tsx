"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChangePasswordMutation } from "@/redux/api/mutationApi"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bell, Building2, Calendar, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail, Palette, Phone, Settings, Shield, User, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as z from "zod"

const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: "Current password is required." }),
    new_password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export default function SettingsPage() {
  const { profile }: any = useSelector((store) => store)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const [
    changePassword,
    {
      data: changePasswordData,
      isLoading: changePasswordLoading,
      isSuccess: changePasswordSuccess,
      isError: changePasswordIsError,
      error: changePasswordError,
    },
  ]: any = useChangePasswordMutation()

  function onSubmit(values: ChangePasswordFormValues) {
    const data = {
      current_password: values.current_password,
      new_password: values.new_password,
    }
    changePassword(data)
  }

  useEffect(() => {
    if (changePasswordSuccess) {
      toast.success("Password changed successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      setIsChangePasswordOpen(false)
      form.reset()
    }
  }, [changePasswordSuccess, form])

  useEffect(() => {
    if (changePasswordIsError && changePasswordError) {
      console.log("Error detected:", changePasswordError)

      const errorMessage =
        changePasswordError?.data?.detail ||
        changePasswordError?.data?.message ||
        changePasswordError?.detail ||
        changePasswordError?.message ||
        "Failed to change password. Please try again!"

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      console.error("Change password error:", changePasswordError)
    }
  }, [changePasswordIsError, changePasswordError])
  return (
    <div className="space-y-6">
      <ToastContainer />
      <h1 className="text-3xl font-headline font-semibold tracking-tight">
        Settings
      </h1>
      <p className="text-muted-foreground">
        Customize your application settings and preferences.
      </p>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-inner">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-4 mt-4">
            {/* User Profile Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your account details and information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/50">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-base">Name</Label>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {profile?.name || profile?.username || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/50">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-accent" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-base">Email</Label>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {profile?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                {profile?.phone_number && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Phone className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-base">Phone Number</Label>
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        {profile?.phone_number}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/50">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-base">Account Status</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {profile?.is_active ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500 font-medium">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500 font-medium">
                              Inactive
                            </span>
                          </>
                        )}
                      </div>
                      {profile?.is_admin && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20">
                          <Shield className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary font-semibold">
                            Admin
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {profile?.created_at && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-base">Account Created</Label>
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        {new Date(profile?.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {profile?.last_login && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-base">Last Login</Label>
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        {new Date(profile?.last_login).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {profile?.companies && profile?.companies?.length > 0 && (
                  <div className="p-4 rounded-lg border bg-background/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      <Label className="text-base">Companies</Label>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {profile?.total_companies || profile?.companies?.length}{" "}
                        total
                      </span>
                    </div>
                    <div className="space-y-3">
                      {profile?.companies.map((company: any, index: number) => (
                        <div
                          key={company.id || index}
                          className="p-3 rounded-lg bg-card/50 border border-border/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">
                                {company.name}
                              </p>
                              {company.industry && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {company.industry}
                                </p>
                              )}
                            </div>
                            {company.has_twitter_integration && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20">
                                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                <span className="text-xs text-blue-500 font-medium">
                                  Twitter
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {profile?.has_twitter_integration && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          <p className="text-sm text-blue-500 font-medium">
                            Twitter Integration Active
                          </p>
                          {profile?.companies_with_twitter > 0 && (
                            <span className="ml-auto text-xs text-blue-500">
                              {profile?.companies_with_twitter} of{" "}
                              {profile?.total_companies} companies
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Settings Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Manage general application preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    defaultValue="Adtivity"
                    className="bg-background/50 border-border/70 focus:border-primary"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    defaultValue="English (US)"
                    className="bg-background/50 border-border/70 focus:border-primary"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl mt-4">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
                <div>
                  <Label htmlFor="theme-mode">Theme Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    The application is currently in dark mode.
                  </p>
                </div>
                <Switch id="theme-mode" checked disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl mt-4">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
                <div>
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via email.
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
                <div>
                  <Label htmlFor="anomaly-alerts">Anomaly Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when the AI detects anomalies.
                  </p>
                </div>
                <Switch id="anomaly-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl mt-4">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-background/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                  <Button onClick={() => setIsChangePasswordOpen(true)}>
                    Change Password
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
                <div>
                  <Label>Two-Factor Authentication (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          {...field}
                          className="bg-background/50 border-border/70 focus:border-primary pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                          className="bg-background/50 border-border/70 focus:border-primary pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 8 characters with uppercase, lowercase,
                      and numbers
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...field}
                          className="bg-background/50 border-border/70 focus:border-primary pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangePasswordOpen(false)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {changePasswordLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Changing...
                    </span>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

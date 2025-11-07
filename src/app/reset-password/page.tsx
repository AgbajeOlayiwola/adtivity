"use client"

import Logo from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useResetPasswordMutation } from "@/redux/api/mutationApi"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as z from "zod"

const resetPasswordSchema = z
  .object({
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

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  })

  const [
    resetPassword,
    {
      data: resetPasswordData,
      isLoading: resetPasswordLoading,
      isSuccess: resetPasswordSuccess,
      isError: resetPasswordIsError,
      error: resetPasswordError,
    },
  ]: any = useResetPasswordMutation()

  // Check if token exists
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }, [token])

  function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      toast.error("Invalid or missing reset token", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    const data = {
      token: token,
      new_password: values.new_password,
    }
    resetPassword(data)
  }

  useEffect(() => {
    if (resetPasswordSuccess) {
      setIsSubmitted(true)
      toast.success("Password reset successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }
  }, [resetPasswordSuccess, router])

  useEffect(() => {
    if (resetPasswordIsError && resetPasswordError) {
      console.log("Error detected:", resetPasswordError)

      const errorMessage =
        resetPasswordError?.data?.detail ||
        resetPasswordError?.data?.message ||
        resetPasswordError?.detail ||
        resetPasswordError?.message ||
        "Failed to reset password. Please try again!"

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      console.error("Reset password error:", resetPasswordError)
    }
  }, [resetPasswordIsError, resetPasswordError])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-grid p-4 relative overflow-hidden">
      <ToastContainer />
      <div
        className="absolute inset-0 opacity-5 bg-gradient-to-br from-primary via-transparent to-accent animate-gradient-bg"
        style={{ backgroundSize: "200% 200%" }}
      ></div>
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>

      <div className="z-10 mb-8">
        <Logo size="text-5xl" />
      </div>

      <Card className="w-full max-w-md bg-card/70 backdrop-blur-lg border-border/50 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">
            {isSubmitted ? "Password Reset Successfully" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? "You can now log in with your new password"
              : "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-foreground">Invalid Reset Link</p>
                <p className="text-sm text-muted-foreground">
                  This password reset link is invalid or has expired.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Please request a new password reset link.
                </p>
              </div>
            </div>
          ) : isSubmitted ? (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-foreground">All Set!</p>
                <p className="text-sm text-muted-foreground">
                  Your password has been reset successfully.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            {...field}
                            className="bg-background/50 border-border/70 focus:border-primary pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
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

                <Button
                  type="submit"
                  disabled={resetPasswordLoading}
                  className="cursor-target w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
                >
                  {resetPasswordLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
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
                      Resetting...
                    </span>
                  ) : (
                    <>
                      Reset Password <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          {isSubmitted ? (
            <Link
              href="/login"
              className="cursor-target font-medium text-primary hover:underline"
            >
              Go to Login
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="cursor-target font-medium text-primary hover:underline"
              >
                Back to Login
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
      <Link
        href="/"
        className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to Home
      </Link>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}

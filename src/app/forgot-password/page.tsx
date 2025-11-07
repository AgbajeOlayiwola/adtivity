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
import { useForgotPasswordMutation } from "@/redux/api/mutationApi"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as z from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const [
    forgotPassword,
    {
      data: forgotPasswordData,
      isLoading: forgotPasswordLoading,
      isSuccess: forgotPasswordSuccess,
      isError: forgotPasswordIsError,
      error: forgotPasswordError,
    },
  ]: any = useForgotPasswordMutation()

  function onSubmit(values: ForgotPasswordFormValues) {
    const data = {
      email: values?.email,
    }
    setSubmittedEmail(values.email)
    forgotPassword(data)
  }

  useEffect(() => {
    if (forgotPasswordSuccess) {
      setIsSubmitted(true)
      toast.success("Password reset link sent to your email!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }, [forgotPasswordSuccess])

  useEffect(() => {
    if (forgotPasswordIsError && forgotPasswordError) {
      console.log("Error detected:", forgotPasswordError)

      const errorMessage =
        forgotPasswordError?.data?.detail ||
        forgotPasswordError?.data?.message ||
        forgotPasswordError?.detail ||
        forgotPasswordError?.message ||
        "Failed to send reset link. Please try again!"

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      console.error("Forgot password error:", forgotPasswordError)
    }
  }, [forgotPasswordIsError, forgotPasswordError])

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
            {isSubmitted ? "Check Your Email" : "Forgot Password"}
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? "We've sent you a password reset link"
              : "Enter your email address and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to
                </p>
                <p className="font-medium text-foreground">{submittedEmail}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Didn't receive the email? Check your spam folder or
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false)
                  form.reset()
                }}
                className="w-full"
              >
                Try Another Email
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            className="bg-background/50 border-border/70 focus:border-primary pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="cursor-target w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
                >
                  {forgotPasswordLoading ? (
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
                      Sending...
                    </span>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="cursor-target font-medium text-primary hover:underline"
            >
              Back to Login
            </Link>
          </p>
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

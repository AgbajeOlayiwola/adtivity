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
import { usePlatformUserLoginMutation } from "@/redux/api/mutationApi"
import { setToken } from "@/redux/slices/userTokenSlice"
import { zodResolver } from "@hookform/resolvers/zod"
import { setCookie } from "cookies-next"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { MdLocalDining } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import * as z from "zod"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { token }: any = useSelector((store) => store)
  const dispatch = useDispatch()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const [
    platformUserLogin,
    {
      data: platformUserLoginData,
      isLoading: _platformUserLoginLoad,
      isSuccess: platformUserLoginSuccess,
      isError: _platformUserLoginFalse,
      error: platformUserLoginErr,
      reset: _platformUserLoginReset,
    },
  ]: any = usePlatformUserLoginMutation()
  function onSubmit(values: LoginFormValues) {
    const data = {
      email: values?.email,
      password: values?.password,
    }
    platformUserLogin(data)
  }
  useEffect(() => {
    if (platformUserLoginSuccess && platformUserLoginData?.access_token) {
      dispatch(setToken(platformUserLoginData.access_token))
      document.cookie = `token=${platformUserLoginData.access_token}; path=/; secure; samesite=strict`
      setCookie("token", platformUserLoginData.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      })
      window.location.href = "/admin/dashboard"
    } else if (platformUserLoginErr) {
      // 4. Better error handling
      console.error("Login error:", platformUserLoginErr)
      // Consider showing user feedback here (toast, alert, etc.)
    }
  }, [platformUserLoginSuccess, platformUserLoginErr, platformUserLoginData])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-grid p-4 relative overflow-hidden">
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
          <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="bg-background/50 border-border/70 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-background/50 border-border/70 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="cursor-target w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
              >
                {_platformUserLoginLoad ? (
                  <MdLocalDining />
                ) : (
                  <>
                    {" "}
                    Login <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          {/* <Link href="#" className="text-sm text-accent hover:underline">
            Forgot password?
          </Link> */}
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="cursor-target font-medium text-primary hover:underline"
            >
              Sign up
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

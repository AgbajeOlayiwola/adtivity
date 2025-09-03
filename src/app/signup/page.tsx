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
import { useCreatePlatformUsersMutation } from "@/redux/api/mutationApi"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { MdLocalDining } from "react-icons/md"
import { useDispatch } from "react-redux"
import * as z from "zod"

const signUpSchema = z
  .object({
    companyName: z
      .string()
      .min(2, { message: "Company name must be at least 2 characters." })
      .max(50, { message: "Company name cannot exceed 50 characters." })
      .regex(/^[a-zA-Z0-9\s\-&,.]+$/, {
        message:
          "Company name can only contain letters, numbers, spaces, hyphens, ampersands, commas and periods.",
      }),

    phoneNumber: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits." })
      .max(15, { message: "Phone number cannot exceed 15 digits." })
      .regex(/^[0-9+\-()\s]+$/, {
        message:
          "Please enter a valid phone number (only numbers, +, -, (, ) and spaces allowed).",
      }),

    email: z
      .string()
      .email({ message: "Please enter a valid email address." })
      .max(100, { message: "Email cannot exceed 100 characters." }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(50, { message: "Password cannot exceed 50 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character.",
      }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
type LoginFormValues = z.infer<typeof signUpSchema>

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      companyName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const dispatch = useDispatch()
  const [
    createPlatformUser,
    {
      data: createPlatformUserData,
      isLoading: _createPlatformUserLoad,
      isSuccess: createPlatformUserSuccess,
      isError: _createPlatformUserFalse,
      error: createPlatformUserErr,
      reset: _createPlatformUserReset,
    },
  ]: any = useCreatePlatformUsersMutation()
  function onSubmit(values: LoginFormValues) {
    const data = {
      name: values?.companyName,
      email: values?.email,
      phone_number: values?.phoneNumber,
      password: values?.password,
    }
    createPlatformUser(data)
  }
  useEffect(() => {
    if (createPlatformUserSuccess) {
      window.location.href = "/login"
    } else if (createPlatformUserErr) {
      console.log(createPlatformUserErr)
    }
  }, [createPlatformUserSuccess, createPlatformUserErr])

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
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="companyName"
                        placeholder="Name"
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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input
                        type="phoneNumber"
                        placeholder="+xxx xxx-xxx-xxxx"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="confirmPassword"
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
                {_createPlatformUserLoad ? (
                  <MdLocalDining />
                ) : (
                  <>
                    Sign up
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Link
            href="#"
            className="cursor-target text-sm text-accent hover:underline"
          >
            Forgot password?
          </Link>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/login"
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

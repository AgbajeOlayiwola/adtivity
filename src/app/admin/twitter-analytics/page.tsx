"use client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAutocompleteTwitterUserQuery } from "@/redux/api/queryApi"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const loginSchema = z.object({
  userName: z.string().min(1, { message: "Username cannot be empty." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const TwitterAnalytics = () => {
  const [userNameQuery, setUserNameQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
    },
  })

  // We use watch to get the current value of the userName input
  const watchedUserName = form.watch("userName")

  // This useEffect hook will trigger the search whenever the input value changes
  useEffect(() => {
    // Only query if the input is not empty
    if (watchedUserName.trim() !== "") {
      setUserNameQuery(watchedUserName)
    } else {
      // If the input is cleared, hide the dropdown
      setShowDropdown(false)
    }
  }, [watchedUserName])

  const {
    data: autoCompleteTwitterUserData,
    isLoading: autoCompleteTwitterUserLoad,
    isSuccess: autoCompleteTwitterUserSuccess,
  }: any = useAutocompleteTwitterUserQuery(
    { query: userNameQuery },
    { skip: userNameQuery === "" } // Skip the query if the search term is empty
  )

  // This useEffect will show the dropdown once the data is successfully fetched
  useEffect(() => {
    if (
      autoCompleteTwitterUserSuccess &&
      autoCompleteTwitterUserData?.data?.users?.length > 0
    ) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [autoCompleteTwitterUserSuccess, autoCompleteTwitterUserData])

  function onSubmit(values: LoginFormValues) {
    // This is where you would handle the form submission, e.g., navigate to the analytics page
    console.log("Form submitted with username:", values.userName)
    // Here you can programmatically navigate to the analytics page for the selected user
  }

  const handleSelectUser = (user: any) => {
    // Set the selected username in the form
    form.setValue("userName", user.screen_name)
    // Hide the dropdown
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter User Name</FormLabel>
                <FormControl>
                  <Input
                    type="text" // Change to 'text' as it's not a password
                    placeholder="Enter twitter user name"
                    {...field}
                    className="bg-background/50 border-border/70 focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {autoCompleteTwitterUserLoad ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : (
                autoCompleteTwitterUserData?.data?.users.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Image
                      src={user.profile_image_url_https}
                      alt={user.screen_name}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        @{user.screen_name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <Button
            type="submit"
            className="cursor-target w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
          >
            <>
              Search <ArrowRight className="ml-2 h-5 w-5" />
            </>
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default TwitterAnalytics

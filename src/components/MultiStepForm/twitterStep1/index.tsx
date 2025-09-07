"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateTwitterAccountsMutation } from "@/redux/api/mutationApi"
import {
  useAutocompleteTwitterUserQuery,
  useGetClientCompaniesQuery,
} from "@/redux/api/queryApi"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { z } from "zod"

const loginSchema = z.object({
  userName: z.string().min(1, { message: "Username cannot be empty." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface TwitterStepOneProps {
  onClose: () => void
}

const TwitterStepOne = ({ onClose }: TwitterStepOneProps) => {
  const [userNameQuery, setUserNameQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedUserDescription, setSelectedUserDescription] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const dispatch = useDispatch()
  // State to control visibility and selection of the company dropdown
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  )
  const [selectedCompanyName, setSelectedCompanyName] =
    useState("Select a company")

  const {
    data: getClientCompaniesData,
    isLoading: getClientCompaniesLoad,
    isSuccess: getClientCompaniesSuccess,
  }: any = useGetClientCompaniesQuery(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
    },
  })

  const {
    data: autoCompleteTwitterUserData,
    isLoading: autoCompleteTwitterUserLoad,
    isSuccess: autoCompleteTwitterUserSuccess,
  }: any = useAutocompleteTwitterUserQuery(
    { query: userNameQuery },
    { skip: userNameQuery === "" }
  )

  const [
    createTwitterAccounts,
    {
      isLoading: createTwitterAccountsLoad,
      isSuccess: createTwitterAccountsSuccess,
      isError: createTwitterAccountsFalse,
      error: createTwitterAccountsErr,
    },
  ]: any = useCreateTwitterAccountsMutation()

  // Effect to handle closing the modal on successful account creation
  useEffect(() => {
    if (createTwitterAccountsSuccess) {
      onClose()
    }
  }, [createTwitterAccountsSuccess, onClose])

  // Effect to display error message if the mutation fails
  useEffect(() => {
    if (createTwitterAccountsFalse && createTwitterAccountsErr) {
      setErrorMessage("Failed to add Twitter account. Please try again.")
    }
  }, [createTwitterAccountsFalse, createTwitterAccountsErr])

  useEffect(() => {
    if (
      autoCompleteTwitterUserSuccess &&
      autoCompleteTwitterUserData?.users?.length > 0
    ) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [autoCompleteTwitterUserSuccess, autoCompleteTwitterUserData])

  const handleSearchSubmit = (values: LoginFormValues) => {
    setUserNameQuery(values.userName)
    setShowCompanyDropdown(false)
    setErrorMessage(null) // Clear any previous errors
  }

  const handleAddAccount = async (values: LoginFormValues) => {
    if (!selectedCompanyId) {
      setErrorMessage("Please select a company to add the account to.")
      return
    }

    try {
      await createTwitterAccounts({
        twitter_handle: values.userName,
        description: selectedUserDescription,
        company_id: selectedCompanyId,
      }).unwrap()
    } catch (error) {
      console.error("Failed to create Twitter account:", error)
      setErrorMessage("Failed to add account. Please try again.")
    }
  }

  const handleSelectUser = (user: any) => {
    form.setValue("userName", user.username)
    setShowDropdown(false)
    setUserNameQuery("")
    setShowCompanyDropdown(true)
    setSelectedUserDescription(user.description)
  }

  const dropdownButtonText = getClientCompaniesLoad
    ? "Loading companies..."
    : selectedCompanyName === "Select a company" &&
      getClientCompaniesData?.length === 0
    ? "No companies found"
    : selectedCompanyName

  return (
    <div>
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddAccount)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter User Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter twitter user name"
                      {...field}
                      className="bg-background/50 border-border/70 focus:border-primary"
                    />
                  </FormControl>
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {autoCompleteTwitterUserLoad ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading...
                        </div>
                      ) : (
                        autoCompleteTwitterUserData?.users.map((user: any) => (
                          <div
                            key={user.id}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <img
                              src={user?.profile_image_url}
                              alt={user.username}
                              width={40}
                              height={40}
                              className="rounded-full mr-3"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-lg text-black ">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {showCompanyDropdown && (
                    <div className="relative mt-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            disabled={getClientCompaniesLoad}
                          >
                            {dropdownButtonText}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {getClientCompaniesData &&
                          getClientCompaniesData.length > 0 ? (
                            getClientCompaniesData.map((company: any) => (
                              <DropdownMenuItem
                                key={company.id}
                                onClick={() => {
                                  setSelectedCompanyId(company.id)
                                  setSelectedCompanyName(company.name)
                                }}
                              >
                                {company.name}
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <DropdownMenuItem disabled>
                              No companies available
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  {/* Display error message */}
                  {errorMessage && (
                    <div className="text-red-500 text-sm mt-2">
                      {errorMessage}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* The form now has two buttons with different onSubmit handlers */}
            {!showCompanyDropdown ? (
              <Button
                type="button" // Change type to button to prevent form submission
                onClick={form.handleSubmit(handleSearchSubmit)}
                className="cursor-target w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
              >
                <>
                  Search <ArrowRight className="ml-2 h-5 w-5" />
                </>
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createTwitterAccountsLoad}
                className="cursor-target w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105"
              >
                <>
                  {createTwitterAccountsLoad ? "Adding..." : "Add Account"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}

export default TwitterStepOne

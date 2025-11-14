"use client"
import KOLAnalysisModal from "@/components/kol-analysis-modal"
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
import { useCreateClientCompanyMutation } from "@/redux/api/mutationApi"
import { useGetClientCompaniesQuery } from "@/redux/api/queryApi"
import { setDocuments } from "@/redux/slices/documents"
import { setApikey } from "@/redux/slices/qpikey"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa6"
import { MdAnalytics, MdClose } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { z } from "zod"

const nameSchema = z.object({
  companyName: z.string({ message: "Invalid name address." }),
  companyUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
})

type LoginFormValues = z.infer<typeof nameSchema>

const Dashboard = () => {
  const [modal, setModal] = useState(false)
  const [kolModalOpen, setKolModalOpen] = useState(false)
  const { profile }: any = useSelector((store) => store)
  const { documents }: any = useSelector((store) => store)
  const dispatch = useDispatch()
  const {
    data: getClientCompaniesData,
    isLoading: getClientCompaniesLoad,
    isSuccess: getClientCompaniesSuccess,
    isError: getClientCompaniesFalse,
    error: getClientCompaniesErr,
    refetch: getClientCompaniesReset,
  }: any = useGetClientCompaniesQuery(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      companyName: "",
      companyUrl: "",
    },
  })
  const [
    createClientCompany,
    {
      data: createClientCompanyData,
      isLoading: createClientCompanyLoad,
      isSuccess: createClientCompanySuccess,
      isError: _createClientCompanyFalse,
      error: createClientCompanyErr,
      reset: _createClientCompanyReset,
    },
  ]: any = useCreateClientCompanyMutation()
  function onSubmit(values: LoginFormValues) {
    const data = {
      name: values?.companyName,
      url: values?.companyUrl || undefined,
    }
    createClientCompany(data)
  }

  useEffect(() => {
    if (createClientCompanySuccess) {
      setModal((prev: boolean) => !prev)
      console.log(createClientCompanyData)
      dispatch(setApikey({ apiKey: createClientCompanyData?.api_key }))
      getClientCompaniesReset()
    } else if (createClientCompanyErr) {
      console.error("Login error:", createClientCompanyErr)
    }
  }, [createClientCompanySuccess, createClientCompanyErr])

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p>Number of companies registered {profile?.companies?.length || 0}</p>
      </div>
      <br />{" "}
      <div className="flex gap-5 flex-wrap w-[100%]">
        {getClientCompaniesLoad ? (
          <p>Loading.....</p>
        ) : (
          getClientCompaniesData?.map((item: any, index: number) => {
            return (
              <div
                className="cursor-target flex w-[30%] flex-col items-center gap-3 cursor-pointer group"
                key={index}
              >
                <div
                  onClick={() => {
                    window.location.href = "/admin/dashboard/company-info"
                    dispatch(setDocuments(item))
                  }}
                  className="w-[100%] h-[20vh] bg-[#323232b6] flex justify-center items-center rounded-md 
    transition-all duration-300 ease-in-out transform group-hover:scale-105"
                >
                  <MdAnalytics className="text-[40px] transition-all duration-300 ease-in-out group-hover:scale-110" />
                </div>
                <p className="transition-all duration-300 ease-in-out group-hover:font-medium">
                  {item?.name}
                </p>
              </div>
            )
          })
        )}
        <div
          className="cursor-target flex w-[30%] flex-col gap-3 cursor-pointer group"
          onClick={() => setModal((prev: boolean) => !prev)}
        >
          <div
            className="w-[100%] h-[20vh] bg-[#323232b6] flex justify-center items-center rounded-md 
    transition-all duration-300 ease-in-out transform group-hover:scale-105"
          >
            <FaPlus className="text-[40px] transition-all duration-300 ease-in-out group-hover:scale-110" />
          </div>
          <p className="transition-all duration-300 ease-in-out group-hover:font-medium">
            Create a campaign
          </p>
        </div>
        {modal ? (
          <div className="fixed w-[100vw] h-[100vh] top-0 left-0 bg-[#4b4a4a6c] flex justify-center items-center z-30">
            <div className="w-[50vw] min-h-[35vh] bg-[#2a2929] rounded-xl px-5 py-8 z-40">
              <div className="flex justify-end">
                <MdClose
                  onClick={() => setModal((prev: boolean) => !prev)}
                  className="cursor-pointer"
                />
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="My Campaign"
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
                    name="companyUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com"
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
                    {createClientCompanyLoad ? (
                      <LoaderIcon />
                    ) : (
                      "Create Campaign "
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        ) : null}
        <div></div>
      </div>
      {/* KOL Analysis Modal */}
      <KOLAnalysisModal
        open={kolModalOpen}
        onClose={() => setKolModalOpen(false)}
      />
    </>
  )
}

export default Dashboard

"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import * as z from "zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ——————————————————————————————————————————————————————————————
// Types & Schemas
// ——————————————————————————————————————————————————————————————

const NETWORKS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "solana", label: "Solana" },
  { value: "bsc", label: "BNB Smart Chain" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "base", label: "Base" },
  { value: "optimism", label: "Optimism" },
] as const

type NetworkValue = (typeof NETWORKS)[number]["value"]

const WALLET_TYPES = [
  { value: "EOA", label: "EOA (Externally Owned Account)" },
  { value: "Contract", label: "Smart Contract Wallet" },
  { value: "Custodial", label: "Custodial Wallet" },
] as const

// Basic chain-aware validators
const isEvmAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v)
const isBase58 = (v: string) => /^[1-9A-HJ-NP-Za-km-z]+$/.test(v) // lightweight check
const isSolAddressLike = (v: string) =>
  isBase58(v) && v.length >= 32 && v.length <= 44

const walletSchema = z
  .object({
    wallet_address: z
      .string()
      .min(1, "Wallet address is required.")
      .refine((v) => v.length >= 30, "Please enter a valid wallet address."),
    wallet_type: z.enum(["EOA", "Contract", "Custodial"], {
      required_error: "Wallet type is required.",
    }),
    network: z.enum(
      ["ethereum", "polygon", "solana", "bsc", "arbitrum", "base", "optimism"],
      { required_error: "Network is required." }
    ),
    wallet_name: z
      .string()
      .min(2, "Wallet name must be at least 2 characters."),
  })
  .superRefine((values, ctx) => {
    const { network, wallet_address } = values
    if (
      ["ethereum", "polygon", "bsc", "arbitrum", "base", "optimism"].includes(
        network
      )
    ) {
      if (!isEvmAddress(wallet_address)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid EVM address (must be 0x + 40 hex chars).",
          path: ["wallet_address"],
        })
      }
    }
    if (network === "solana") {
      if (!isSolAddressLike(wallet_address)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Solana address (base58 ~32–44 chars).",
          path: ["wallet_address"],
        })
      }
    }
  })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

// Form values
type WalletFormValues = z.infer<typeof walletSchema>

// Connection response (based on your samples)
type CreateConnectionResponse = {
  id: string
  wallet_address: string
  wallet_type: string
  network: string
  wallet_name: string
  company_id: string
  is_active: boolean
  is_verified: boolean
  verification_method: string | null
  verification_timestamp: string | null
  created_at: string
  last_activity: string | null
}

// ——————————————————————————————————————————————————————————————
// Component (connections only)
// ——————————————————————————————————————————————————————————————

function WalletModal({
  open,
  onClose,
  companyId,
  onWalletLinked,
  saveWalletEndpoint = "/wallets/connections/",
  verifyEndpoint,
}: {
  open: boolean
  onClose: () => void
  companyId?: string
  onWalletLinked?: (connection: CreateConnectionResponse) => void
  saveWalletEndpoint?: string
  verifyEndpoint: any
}) {
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      wallet_address: "",
      wallet_type: "EOA",
      network: "ethereum",
      wallet_name: "",
    },
  })

  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const { token }: any = useSelector((store) => store)

  if (!open) return null

  const handleCreateConnection = async (values: WalletFormValues) => {
    setErrorText(null)
    try {
      setBusy(true)

      const payload = {
        wallet_address: values.wallet_address,
        wallet_type: values.wallet_type,
        network: values.network,
        wallet_name: values.wallet_name,
        company_id: companyId,
      }

      const res = await fetch(`${baseUrl}${saveWalletEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error(`Create connection failed with ${res.status}`)
      }

      const data: CreateConnectionResponse = await res.json()

      // Notify parent and close
      onWalletLinked?.(data)
      onClose()
    } catch (e: any) {
      setErrorText(e?.message ?? "Failed to create wallet connection.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-[90%] max-w-md bg-card/95 backdrop-blur-sm shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Link a Web3 Wallet
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateConnection)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="wallet_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x… (EVM) or Solana address"
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
                name="wallet_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="cursor-target">
                        <SelectValue placeholder="Select wallet type" />
                      </SelectTrigger>
                      <SelectContent>
                        {WALLET_TYPES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="cursor-target">
                        <SelectValue placeholder="Select a network" />
                      </SelectTrigger>
                      <SelectContent>
                        {NETWORKS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wallet_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Treasury Wallet"
                        {...field}
                        className="bg-background/50 border-border/70 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Create connection button only */}
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={busy} className="cursor-target">
                  {busy ? (
                    "Creating…"
                  ) : (
                    <>
                      Create Connection <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                {errorText && (
                  <p className="text-sm text-red-500">{errorText}</p>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default WalletModal

// ——————————————————————————————————————————————————————————————
// Backend notes:
// - POST /wallets/connections/ should create a PENDING connection:
//   Request:
//   {
//     "wallet_address": "string",
//     "wallet_type": "EOA|Contract|Custodial",
//     "network": "ethereum|polygon|solana|bsc|arbitrum|base|optimism",
//     "wallet_name": "string",
//     "company_id": "uuid"
//   }
//   Response (sample):
//   {
//     "id": "uuid", "wallet_address": "...", "network": "...",
//     "wallet_name": "...", "company_id": "...",
//     "is_active": true, "is_verified": false, "created_at": "...", ...
//   }
// - This modal ONLY creates the connection and then closes on success.
//   Verification is intentionally omitted per request.

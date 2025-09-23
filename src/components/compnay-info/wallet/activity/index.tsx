"use client"

import { PublicKey } from "@solana/web3.js"
import { format, formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

type WalletConn = {
  wallet_address: string
  wallet_type: string
  network: string
  wallet_name: string
  id: string
  company_id: string
  is_active: boolean
  is_verified: boolean
  verification_method: string | null
  verification_timestamp: string | null
  created_at: string
  last_activity: string | null
}

type Txn = {
  transaction_hash: string
  block_number: number
  transaction_type: string
  from_address: string
  to_address: string
  token_address: string
  token_symbol: string
  token_name: string
  amount: string
  amount_usd: string
  gas_used: number
  gas_price: string
  gas_fee_usd: string
  network: string
  status: "confirmed" | "failed" | string
  timestamp: string
  transaction_metadata: Record<string, any>
  id: string
  wallet_connection_id: string
  created_at: string
}

type WalletAnalytics = {
  wallet_address: string
  total_transactions: number
  total_volume_usd: string
  unique_tokens: number
  networks: string[]
  transaction_types: Record<string, number>
  daily_activity: any[]
  top_tokens: any[]
  gas_spent_usd: string
  first_transaction: string
  last_transaction: string
}

// ------------------------------------------------------------
// Utils
// ------------------------------------------------------------

const truncate = (v: string, left = 6, right = 4) =>
  v && v.length > left + right ? `${v.slice(0, left)}…${v.slice(-right)}` : v

const networkBadgeColor: Record<string, string> = {
  ethereum: "bg-purple-500/10 text-purple-500",
  polygon: "bg-fuchsia-500/10 text-fuchsia-500",
  solana: "bg-emerald-500/10 text-emerald-500",
  bsc: "bg-yellow-500/10 text-yellow-500",
  arbitrum: "bg-sky-500/10 text-sky-500",
  base: "bg-blue-500/10 text-blue-500",
  optimism: "bg-rose-500/10 text-rose-500",
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ""

// Base58 (no 0 O I l)
const isBase58 = (s: string) => /^[1-9A-HJ-NP-Za-km-z]+$/.test(s)

const isValidSolanaAddress = (addr?: string | null) => {
  if (!addr) return false
  const a = String(addr).trim()
  if (!isBase58(a)) return false
  try {
    new PublicKey(a)
    return true
  } catch {
    return false
  }
}

/**
 * Soft canonicalization for display. NEVER throws.
 * - Solana: returns canonical Base58 if valid; otherwise returns raw trimmed input
 * - EVM: lowercases (display + compare safe)
 */
export const normalizeAddressSoft = (network: string, addr?: string | null) => {
  if (!addr) return ""
  const a = String(addr).trim()
  if (network === "solana") {
    if (!isValidSolanaAddress(a)) return a
    return new PublicKey(a).toBase58()
  }
  return a.toLowerCase()
}

/**
 * Strict canonicalization for verification flow. THROWS if invalid.
 */
export const normalizeAddressStrict = (
  network: string,
  addr?: string | null
) => {
  if (!addr) throw new Error("Missing wallet address.")
  const a = String(addr).trim()

  if (network === "solana") {
    if (!isBase58(a)) {
      throw new Error(
        "Invalid Solana address: non-base58 character (0,O,I,l not allowed)."
      )
    }
    try {
      return new PublicKey(a).toBase58()
    } catch (e: any) {
      throw new Error(`Invalid Solana address: ${e?.message || "bad length"}`)
    }
  }

  // EVM
  return a.toLowerCase()
}

export const equalAddresses = (
  network: string,
  a?: string | null,
  b?: string | null
) => {
  if (!a || !b) return false
  if (network === "solana") {
    try {
      return new PublicKey(String(a).trim()).equals(
        new PublicKey(String(b).trim())
      )
    } catch {
      return false
    }
  }
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase()
}

// ------------------------------------------------------------
// Signing helpers (EVM & Solana)
// ------------------------------------------------------------

const buildVerificationMessage = (
  addr: string,
  net: string,
  company: string | undefined,
  ts: number,
  connectionId: string,
  nonce: string
) => {
  return [
    "Adtivity Wallet Verification",
    `Wallet: ${addr}`,
    `Network: ${net}`,
    `Company: ${company ?? "unknown"}`,
    `ConnectionID: ${connectionId}`,
    `Timestamp(ms): ${ts}`,
    `Nonce: ${nonce}`,
  ].join("\n")
}

async function requestEvmSignature(address: string, message: string) {
  const ethereum = (globalThis as any)?.ethereum
  if (!ethereum)
    throw new Error(
      "No EVM wallet detected. Install MetaMask or a compatible wallet."
    )

  const accounts: string[] = await ethereum.request({
    method: "eth_requestAccounts",
  })
  const active = (accounts?.[0] ?? "").toLowerCase()
  if (active !== address.toLowerCase())
    throw new Error(`Active wallet ${active} doesn’t match ${address}.`)

  const signature: string = await ethereum.request({
    method: "personal_sign",
    params: [message, address],
  })
  return signature
}

async function requestSolanaSignature(address: string, message: string) {
  const provider = (globalThis as any)?.solana
  if (!provider?.signMessage)
    throw new Error(
      "No Solana wallet with signMessage detected (try Phantom or Solflare)."
    )

  if (!provider.publicKey) await provider.connect()

  // Compare canonical forms
  const active = provider.publicKey.toBase58()
  const target = new PublicKey(address).toBase58()
  if (active !== target)
    throw new Error(`Active Solana wallet ${active} doesn’t match ${target}.`)

  const encoded = new TextEncoder().encode(message)
  const signed = await provider.signMessage(encoded, "utf8")
  const bytes: Uint8Array = (signed as any)?.signature ?? signed
  const { default: bs58 } = await import("bs58")
  return bs58.encode(bytes)
}

async function signByNetwork(
  network: string,
  address: string,
  message: string
) {
  if (network === "solana") return requestSolanaSignature(address, message)
  return requestEvmSignature(address, message)
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function WalletActivityModal({
  open,
  onClose,
  wallet,
  companyId,
  onVerified,
  recentTransactions,
}: {
  open: boolean
  onClose: () => void
  wallet: WalletConn | null
  companyId?: string
  onVerified?: () => void
  recentTransactions: any
  allActivities: any
  analytics: any
}) {
  const { token }: any = useSelector((store) => store)

  // Verify state
  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [okText, setOkText] = useState<string | null>(null)

  // Data state (fetched from your endpoints)
  const [activeTab, setActiveTab] = useState<
    "overview" | "recent" | "activity"
  >("overview")

  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  const [recentHours, setRecentHours] = useState<number>(24)
  const [recentRows, setRecentRows] = useState<Txn[]>([])
  const [recentLoading, setRecentLoading] = useState(false)
  const [recentError, setRecentError] = useState<string | null>(null)

  const [actLimit, setActLimit] = useState<number>(100)
  const [actOffset, setActOffset] = useState<number>(0)
  const [activities, setActivities] = useState<Txn[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)

  // Optional timeframe for analytics/activities
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!open || !wallet) return
    fetchAnalytics()
    if (activeTab === "recent") fetchRecent()
    if (activeTab === "activity") fetchActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, wallet?.id])

  useEffect(() => {
    if (!open || !wallet) return
    if (activeTab === "recent") fetchRecent()
    if (activeTab === "activity") fetchActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    if (!open || !wallet) return
    fetchRecent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentHours])

  useEffect(() => {
    if (!open || !wallet) return
    fetchActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actLimit, actOffset, startDate, endDate])

  // ---------------------- API calls ----------------------
  async function fetchAnalytics() {
    if (!wallet) return
    try {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      const qs = new URLSearchParams()
      if (startDate) qs.set("start_date", startDate)
      if (endDate) qs.set("end_date", endDate)
      const url = `${baseUrl}/wallets/connections/${wallet.id}/analytics${
        qs.toString() ? `?${qs}` : ""
      }`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Analytics failed: ${res.status}`)
      const data: WalletAnalytics = await res.json()
      setAnalytics(data)
    } catch (e: any) {
      setAnalyticsError(e?.message ?? "Failed to load analytics")
    } finally {
      setAnalyticsLoading(false)
    }
  }

  async function fetchRecent() {
    if (!wallet) return
    try {
      setRecentLoading(true)
      setRecentError(null)
      const qs = new URLSearchParams()
      if (recentHours) qs.set("hours", String(recentHours))
      const url = `${baseUrl}/wallets/connections/${wallet.id}/recent${
        qs.toString() ? `?${qs}` : ""
      }`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Recent failed: ${res.status}`)
      const data: Txn[] = await res.json()
      setRecentRows(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setRecentError(e?.message ?? "Failed to load recent transactions")
    } finally {
      setRecentLoading(false)
    }
  }

  async function fetchActivities() {
    if (!wallet) return
    try {
      setActivityLoading(true)
      setActivityError(null)
      const qs = new URLSearchParams()
      qs.set("limit", String(actLimit))
      qs.set("offset", String(actOffset))
      if (startDate) qs.set("start_date", startDate)
      if (endDate) qs.set("end_date", endDate)
      const url = `${baseUrl}/wallets/connections/${wallet.id}/activities?${qs}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Activities failed: ${res.status}`)
      const data: Txn[] = await res.json()
      setActivities(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setActivityError(e?.message ?? "Failed to load activities")
    } finally {
      setActivityLoading(false)
    }
  }

  if (!open || !wallet) return null

  // ✅ Canonical address for display only (never throws)
  const canonicalWalletAddress = normalizeAddressSoft(
    wallet.network,
    wallet.wallet_address
  )
  console.log(wallet.wallet_address)
  const solanaAddrInvalid =
    wallet.network === "solana" && !isValidSolanaAddress(wallet.wallet_address)

  const handleVerifyClick = async () => {
    setErrorText(null)
    setOkText(null)
    try {
      setBusy(true)
      const ts = Date.now()
      const nonce = crypto.getRandomValues(new Uint32Array(1))[0].toString()

      // ✅ strict canonical address (throws if bad)
      const strictAddr = normalizeAddressStrict(
        wallet.network,
        wallet.wallet_address
      )

      const msg = buildVerificationMessage(
        strictAddr,
        wallet.network,
        companyId,
        ts,
        wallet.id,
        nonce
      )

      const sig = await signByNetwork(wallet.network, strictAddr, msg)

      const payload = {
        wallet_address: strictAddr,
        signature: sig,
        message: msg,
        timestamp: ts,
      }
      const res = await fetch(`${baseUrl}/wallets/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Verify request failed with ${res.status}`)
      const data = await res.json()
      if (data?.verified === false)
        throw new Error(data?.message || "Verification failed.")

      setOkText("Wallet verified successfully.")
      onVerified?.()
    } catch (e: any) {
      setErrorText(e?.message ?? "Verification failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <Card className="w-[95%] max-w-5xl max-h-[85vh] overflow-hidden bg-card/95 backdrop-blur-sm shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {wallet.wallet_name || "Wallet"}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <Badge
                  className={`${
                    networkBadgeColor[wallet.network] ??
                    "bg-muted text-foreground"
                  }`}
                >
                  {wallet.network}
                </Badge>
                <span className="font-mono text-xs">
                  {truncate(canonicalWalletAddress, 10, 8)}
                </span>
                {wallet.is_verified ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500">
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-amber-500 border-amber-500/50"
                  >
                    Unverified
                  </Badge>
                )}
              </CardDescription>

              {/* Friendly guidance if the stored Solana address is malformed */}
              {solanaAddrInvalid && (
                <p className="text-xs text-amber-500 mt-2">
                  This saved Solana address looks invalid. Please re-link the
                  wallet before verifying.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!wallet.is_verified && (
                <Button
                  onClick={handleVerifyClick}
                  disabled={busy || solanaAddrInvalid}
                  className="cursor-target"
                >
                  {busy ? "Verifying…" : "Verify Wallet"}
                </Button>
              )}
              <div className="text-xs text-muted-foreground">
                Added{" "}
                {formatDistanceToNow(new Date(wallet.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>

          {errorText && (
            <p className="text-sm text-red-500 mt-2">{errorText}</p>
          )}
          {okText && <p className="text-sm text-emerald-500 mt-2">{okText}</p>}
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="px-4 pt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
              <TabsTrigger value="activity">All Activity</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="p-4 pt-0">
              {analyticsLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading analytics…
                </p>
              )}
              {analyticsError && (
                <p className="text-sm text-red-500">{analyticsError}</p>
              )}
              {!analyticsLoading && !analyticsError && analytics ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total Txns"
                    value={analytics.total_transactions.toLocaleString()}
                  />
                  <StatCard
                    label="Total Volume (USD)"
                    value={`$${Number(
                      analytics.total_volume_usd
                    ).toLocaleString()}`}
                  />
                  <StatCard
                    label="Unique Tokens"
                    value={analytics.unique_tokens.toString()}
                  />
                  <StatCard
                    label="Gas Spent (USD)"
                    value={`$${Number(
                      analytics.gas_spent_usd
                    ).toLocaleString()}`}
                  />

                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        Transaction Types
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm flex flex-wrap gap-2">
                      {Object.entries(analytics.transaction_types || {}).map(
                        ([k, v]) => (
                          <Badge
                            key={k}
                            variant="outline"
                            className="px-2 py-1"
                          >
                            {k}: {v as number}
                          </Badge>
                        )
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Networks</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm flex flex-wrap gap-2">
                      {analytics.networks?.map((n) => (
                        <Badge
                          key={n}
                          className={`${
                            networkBadgeColor[n] ?? "bg-muted text-foreground"
                          }`}
                        >
                          {n}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div>
                        First Tx:{" "}
                        {format(new Date(analytics.first_transaction), "PPpp")}
                      </div>
                      <div>
                        Last Tx:{" "}
                        {format(new Date(analytics.last_transaction), "PPpp")}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </TabsContent>

            {/* Recent */}
            <TabsContent value="recent" className="p-4 pt-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Window:</span>
                <Select
                  value={String(recentHours)}
                  onValueChange={(v) => setRecentHours(Number(v))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 6, 12, 24, 48, 72].map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h} hours
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchRecent}>
                  Refresh
                </Button>
              </div>
              {recentLoading && (
                <p className="text-sm text-muted-foreground">Loading recent…</p>
              )}
              {recentError && (
                <p className="text-sm text-red-500">{recentError}</p>
              )}
              {!recentLoading && !recentError && (
                <TxTable
                  rows={recentRows}
                  emptyLabel="No recent transactions."
                />
              )}
            </TabsContent>

            {/* Activity */}
            <TabsContent value="activity" className="p-4 pt-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-sm text-muted-foreground">Rows:</span>
                <Select
                  value={String(actLimit)}
                  onValueChange={(v) => {
                    setActOffset(0)
                    setActLimit(Number(v))
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    {[25, 50, 100, 250, 500, 1000].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setActOffset((o) => Math.max(0, o - actLimit))
                    }
                    disabled={actOffset === 0}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActOffset((o) => o + actLimit)}
                  >
                    Next
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchActivities}>
                    Refresh
                  </Button>
                </div>
              </div>
              {activityLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading activity…
                </p>
              )}
              {activityError && (
                <p className="text-sm text-red-500">{activityError}</p>
              )}
              {!activityLoading && !activityError && (
                <TxTable rows={activities} emptyLabel="No activity yet." />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

function TxTable({ rows, emptyLabel }: { rows: Txn[]; emptyLabel: string }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }
  return (
    <div className="max-h-[50vh] overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Hash</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Token</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">USD</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Network</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(tx.timestamp), "PP p")}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {truncate(tx.transaction_hash || "", 10, 8)}
              </TableCell>
              <TableCell className="capitalize">
                {tx.transaction_type || "-"}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {tx.token_symbol || tx.token_name || "-"}
              </TableCell>
              <TableCell className="text-right">{tx.amount}</TableCell>
              <TableCell className="text-right">
                {tx.amount_usd
                  ? `$${Number(tx.amount_usd).toLocaleString()}`
                  : "-"}
              </TableCell>
              <TableCell>
                {tx.status === "confirmed" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500">
                    confirmed
                  </Badge>
                ) : (
                  <Badge variant="outline">{tx.status || "-"}</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${
                    networkBadgeColor[tx.network] ?? "bg-muted text-foreground"
                  }`}
                >
                  {tx.network || "-"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default WalletActivityModal

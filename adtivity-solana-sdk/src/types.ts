export interface SDKOptions {
  endpoint?: string
  debug?: boolean
  autoTrackTransactions?: boolean
  obfuscateWallet?: boolean
}

export interface EventPayload {
  type: string
  session_id: string
  timestamp: string
  wallet_address?: string | null
  [key: string]: any
}

export interface WalletEvent {
  walletType: string
  publicKey: string
}

export interface TransactionEvent {
  signature: string
  status: "success" | "failed"
  error?: string
}

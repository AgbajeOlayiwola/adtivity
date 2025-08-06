import { ApiClient } from "./api"
import { TransactionTracker } from "./transactions"
import { EventPayload, SDKOptions } from "./types"
import { generateSessionId, validateApiKey } from "./utils"
import { WalletMonitor } from "./wallet"

export class AdtivitySDK {
  private apiKey: string
  private options: SDKOptions
  private sessionId: string
  private walletMonitor: WalletMonitor
  private transactionTracker: TransactionTracker
  private apiClient: ApiClient

  constructor(apiKey: string, options: SDKOptions = {}) {
    if (!validateApiKey(apiKey)) {
      throw new Error("Invalid API key")
    }

    this.apiKey = apiKey
    this.options = {
      endpoint: "https://api.adtivity.io/v1/track",
      autoTrackTransactions: true,
      obfuscateWallet: true,
      debug: false,
      ...options,
    }

    this.sessionId = generateSessionId()
    this.walletMonitor = new WalletMonitor()
    this.transactionTracker = new TransactionTracker()
    this.apiClient = new ApiClient(this.apiKey, this.options.endpoint!)

    this.setupListeners()
  }

  private setupListeners(): void {
    // Wallet events
    this.walletMonitor.onEvent((event) => {
      this.sendEvent({
        type: event.publicKey ? "wallet_connected" : "wallet_disconnected",
        wallet_type: event.walletType,
        wallet_address: event.publicKey,
      })
    })

    // Transaction events
    if (this.options.autoTrackTransactions) {
      this.transactionTracker.onEvent((event) => {
        this.sendEvent({
          type: `transaction_${event.status}`,
          tx_signature: event.signature,
          ...(event.error && { error: event.error }),
        })
      })
    }
  }

  public trackEvent(
    eventType: string,
    properties: Record<string, any> = {}
  ): void {
    this.sendEvent({
      type: eventType,
      ...properties,
    })
  }

  public monitorTransaction(
    transactionPromise: Promise<string>
  ): Promise<string> {
    return this.transactionTracker.monitor(transactionPromise)
  }

  private sendEvent(payload: Partial<EventPayload>): void {
    const fullPayload: EventPayload = {
      type: payload.type || "custom_event",
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      wallet_address: this.walletMonitor.obfuscatedAddress(),
      ...payload,
    }

    if (this.options.debug) {
      console.log("[Adtivity] Tracking event:", fullPayload)
    }

    this.apiClient.sendEvent(fullPayload).catch((error) => {
      if (this.options.debug) {
        console.error("[Adtivity] Error sending event:", error)
      }
    })
  }
}

// Export for ES modules
export default AdtivitySDK

// Export for CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = AdtivitySDK
  module.exports.default = AdtivitySDK
}

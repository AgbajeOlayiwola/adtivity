import { WalletEvent } from "./types"
import { obfuscateAddress } from "./utils"

declare global {
  interface Window {
    solana?: any
  }
}

export class WalletMonitor {
  private walletAddress: string | null = null
  private walletType: string | null = null
  private callbacks: ((event: WalletEvent) => void)[] = []

  constructor() {
    this.initialize()
  }

  private initialize(): void {
    if (typeof window === "undefined") return

    window.addEventListener("load", () => {
      if (window.solana?.isPhantom) {
        this.setupPhantom()
      }
      // Add other wallet providers here
    })
  }

  private setupPhantom(): void {
    const phantom = window.solana

    phantom.on("connect", (publicKey: any) => {
      this.walletAddress = publicKey.toString()
      this.walletType = "phantom"
      this.notify({
        walletType: "phantom",
        publicKey: this.obfuscatedAddress() ?? "",
      })
    })

    phantom.on("disconnect", () => {
      this.notify({
        walletType: "phantom",
        publicKey: "",
      })
      this.walletAddress = null
      this.walletType = null
    })
  }

  public onEvent(callback: (event: WalletEvent) => void): void {
    this.callbacks.push(callback)
  }

  private notify(event: WalletEvent): void {
    this.callbacks.forEach((callback) => callback(event))
  }

  public get currentAddress(): string | null {
    return this.walletAddress
  }

  public get currentWalletType(): string | null {
    return this.walletType
  }

  public obfuscatedAddress(): string | null {
    return obfuscateAddress(this.walletAddress)
  }
}

import { TransactionEvent } from "./types"

export class TransactionTracker {
  private callbacks: ((event: TransactionEvent) => void)[] = []

  public monitor(transactionPromise: Promise<string>): Promise<string> {
    return transactionPromise
      .then((signature) => {
        this.notify({
          signature,
          status: "success",
        })
        return signature
      })
      .catch((error) => {
        this.notify({
          signature: "",
          status: "failed",
          error: error.message,
        })
        throw error
      })
  }

  public onEvent(callback: (event: TransactionEvent) => void): void {
    this.callbacks.push(callback)
  }

  private notify(event: TransactionEvent): void {
    this.callbacks.forEach((callback) => callback(event))
  }
}

import { EventPayload } from "./types"
import { getBrowserInfo } from "./utils"

export class ApiClient {
  private endpoint: string
  private apiKey: string
  private queue: EventPayload[] = []
  private isSending = false

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey
    this.endpoint = endpoint
  }

  public async sendEvent(payload: EventPayload): Promise<void> {
    // Add to queue
    this.queue.push(payload)

    // Process queue if not already processing
    if (!this.isSending) {
      await this.processQueue()
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isSending = false
      return
    }

    this.isSending = true
    const event = this.queue.shift()

    try {
      await this.send(event!)
    } catch (error) {
      console.error("Failed to send event:", error)
      // Re-add to queue if failed
      this.queue.unshift(event!)
    }

    // Process next item in queue
    await this.processQueue()
  }

  private async send(payload: EventPayload): Promise<Response> {
    const enrichedPayload = {
      ...payload,
      ...getBrowserInfo(),
      sdk_version: "__SDK_VERSION__",
    }

    return fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: JSON.stringify(enrichedPayload),
    })
  }
}

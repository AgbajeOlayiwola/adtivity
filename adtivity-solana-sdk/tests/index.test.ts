import { describe, expect, it } from "@jest/globals"
import AdtivitySDK from "../src/index"

describe("AdtivitySDK", () => {
  it("should initialize with API key", () => {
    const sdk = new AdtivitySDK("test-api-key")
    expect(sdk).toBeInstanceOf(AdtivitySDK)
  })

  it("should reject invalid API keys", () => {
    expect(() => new AdtivitySDK("")).toThrow("Invalid API key")
  })

  // Add more tests for tracking events, transactions, etc.
})

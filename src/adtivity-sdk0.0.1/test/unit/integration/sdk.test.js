// adtivity-sdk/test/integration/sdk.test.js
import { Adtivity } from "../../src/index" // Import the main SDK class

// Mock the global fetch API for network requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
    status: 200,
    statusText: "OK",
  })
)

describe("Adtivity SDK Integration Tests", () => {
  let adtivityInstance
  let originalSetTimeout
  let originalClearInterval
  let originalSetInterval

  beforeAll(() => {
    // Mock timers for predictable batch flushing
    jest.useFakeTimers()

    // Store original timer functions
    originalSetTimeout = setTimeout
    originalClearInterval = clearInterval
    originalSetInterval = setInterval
  })

  beforeEach(() => {
    // Reset mocks and state before each test
    global.fetch.mockClear()
    localStorage.clear()
    sessionStorage.clear()
    jest.clearAllTimers()

    // Ensure SDK is re-initialized for each test
    // Reset the private static #isInitialized and #instance for clean slate
    Adtivity.__resetForTesting() // Add a static method to your Adtivity class for testing purposes

    // Suppress console logs during tests unless explicitly testing them
    jest.spyOn(console, "log").mockImplementation(() => {})
    jest.spyOn(console, "info").mockImplementation(() => {})
    jest.spyOn(console, "warn").mockImplementation(() => {})
    jest.spyOn(console, "error").mockImplementation(() => {})

    // Initialize SDK with debug mode for visibility
    adtivityInstance = Adtivity.getInstance({
      apiKey: "test-api-key",
      apiBaseUrl: "http://localhost:3000,
      debug: true,
      batchSize: 2, // Small batch size for easier testing
      flushInterval: 1000, // Short interval for easier testing
      maxRetries: 1, // Short retries for faster tests
    })
  })

  afterEach(() => {
    jest.restoreAllMocks() // Restore console mocks
    jest.runOnlyPendingTimers() // Ensure all pending timers are flushed
  })

  afterAll(() => {
    jest.useRealTimers() // Restore real timers
    // Restore original timer functions
    setTimeout = originalSetTimeout
    clearInterval = originalClearInterval
    setInterval = originalSetInterval
  })

  // Add this to your Adtivity class (src/index.js) for testing purposes
  // static __resetForTesting() {
  //     Adtivity.#isInitialized = false;
  //     Adtivity.#instance = null;
  //     Adtivity.#deferredCalls = [];
  // }

  it("should queue events and send in a batch when batchSize is met", async () => {
    adtivityInstance.trackEvent("Event A")
    adtivityInstance.trackEvent("Event B") // This should trigger the flush

    // Advance timers to ensure any async operations (like fetch) complete
    await Promise.resolve() // Allow microtasks to complete (e.g., queueing)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe("http://localhost:3000/events")
    const payload = JSON.parse(options.body)
    expect(payload.length).toBe(2)
    expect(payload[0].eventName).toBe("Event A")
    expect(payload[1].eventName).toBe("Event B")
    expect(payload[0].properties.anonymousId).toBeDefined()
    expect(payload[0].properties.sessionId).toBeDefined()
  })

  it("should flush events after flushInterval even if batchSize is not met", async () => {
    adtivityInstance.trackEvent("Single Event")

    expect(global.fetch).not.toHaveBeenCalled() // Not yet flushed

    jest.advanceTimersByTime(1000) // Advance time by flushInterval

    await Promise.resolve() // Allow microtasks to complete

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(payload.length).toBe(1)
    expect(payload[0].eventName).toBe("Single Event")
  })

  it("should retry sending batch on network failure", async () => {
    // Mock fetch to fail once, then succeed
    global.fetch
      .mockImplementationOnce(() =>
        Promise.reject(new TypeError("Network error"))
      ) // First attempt fails
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
          status: 200,
        })
      ) // Second attempt succeeds

    adtivityInstance.trackEvent("Retry Event")
    adtivityInstance.trackEvent("Another Retry Event") // This triggers the initial send

    await Promise.resolve() // Allow initial fetch to run
    expect(global.fetch).toHaveBeenCalledTimes(1) // First call made

    jest.advanceTimersByTime(adtivityInstance.#config.retryDelayMs) // Advance by initial retry delay

    await Promise.resolve() // Allow retry fetch to run
    expect(global.fetch).toHaveBeenCalledTimes(2) // Second call made

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to send batch (Attempt 1)")
    )
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining("Retrying in 1000ms...")
    )
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining("Successfully sent batch of 2 events.")
    )
  })

  it("should process deferred calls after initialization", async () => {
    // Simulate calls made before SDK is initialized
    Adtivity.__resetForTesting() // Ensure it's not initialized
    window.Adtivity.trackEvent("Deferred Event 1")
    window.Adtivity.identify("deferred_user", { name: "Deferred" })

    // Initialize the SDK
    Adtivity.getInstance({
      apiKey: "test-api-key-2",
      debug: true,
      batchSize: 10,
      flushInterval: 1000,
    })

    // Advance timers and microtasks to ensure deferred calls and flushes complete
    jest.runAllTimers()
    await Promise.resolve()

    expect(global.fetch).toHaveBeenCalledTimes(2) // One for identify, one for trackEvent
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/identify"),
      expect.any(Object)
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events"),
      expect.any(Object)
    )
  })

  it("should stop collecting data when consent is false", async () => {
    adtivityInstance.setConsent(false)
    adtivityInstance.trackEvent("Should Not Be Tracked")
    adtivityInstance.identify("user_no_consent")

    jest.runAllTimers()
    await Promise.resolve()

    expect(global.fetch).not.toHaveBeenCalled()
    expect(adtivityInstance.#eventQueue.length).toBe(0)
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining("Data collection disabled. Event not queued.")
    )
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining(
        "User identification for 'user_no_consent' skipped due to consent settings."
      )
    )
  })

  it("should flush existing events when consent is set to false", async () => {
    adtivityInstance.trackEvent("Event Before Opt-Out")
    adtivityInstance.setConsent(false) // This should trigger a flush

    jest.runAllTimers()
    await Promise.resolve()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(payload.length).toBe(1)
    expect(payload[0].eventName).toBe("Event Before Opt-Out")
    expect(adtivityInstance.#eventQueue.length).toBe(0) // Queue should be cleared
  })
})

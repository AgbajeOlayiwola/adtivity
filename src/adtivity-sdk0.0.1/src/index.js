// adtivity-sdk/src/index.js

import { initAutomaticClickTracking } from "./autoTrackers/clickTracker.js" // Note: Added .js extension
import { initAutomaticPageTracking } from "./autoTrackers/pageTracker.js" // Note: Added .js extension
import {
  getAnonymousId,
  getLocalStorageItem,
  getSessionId,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "./utils/storage.js" // Note: Added .js extension for browser module loading

/**
 * Adtivity SDK for Web Applications
 * Provides methods to track events, identify users, and manages data collection
 * with batching, retries, and persistence.
 */
class Adtivity {
  /**
   * SDK configuration.
   * @private
   * @type {object}
   */
  _config = {
    apiKey: "your-super-secret-api-key",
    apiBaseUrl: "http://127.0.0.1:8000/", // UPDATED: Changed to http://127.0.0.1:8000
    debug: false,
    // Batching configuration
    batchSize: 10, // Max events per batch
    flushInterval: 5000, // Flush events every 5 seconds (ms)
    // Retry configuration
    maxRetries: 3,
    retryDelayMs: 1000, // Initial delay for exponential backoff
    // Consent
    // Default to true. Developers should set this based on user consent (e.g., from a CMP).
    collectData: true,
  }

  /**
   * Internal queue for events to be sent.
   * @private
   * @type {Array<object>}
   */
  _eventQueue = []

  /**
   * Timer for flushing events.
   * @private
   * @type {number|null}
   */
  _flushTimer = null

  /**
   * Internal flag to check if the SDK has been initialized.
   * @private
   * @type {boolean}
   */
  static _isInitialized = false

  /**
   * Stores the singleton instance of the SDK.
   * @private
   * @type {Adtivity|null}
   */
  static _instance = null

  /**
   * Queue for calls made before the SDK is fully initialized.
   * This allows developers to call SDK methods immediately, even if the script hasn't fully loaded.
   * @private
   * @type {Array<Array<any>>}
   */
  static _deferredCalls = []

  /**
   * Stores the last tracked page path to prevent duplicate page view events in SPAs.
   * @private
   * @type {string|null}
   */
  _lastTrackedPage = null // Accessible by pageTracker.js

  /**
   * Creates an instance of the Adtivity SDK.
   * This constructor should ideally be called once during the application's lifecycle.
   * Use `Adtivity.getInstance(options)` for proper singleton management.
   * @param {object} options - Configuration options for the SDK.
   * @param {string} options.apiKey - Your unique API key for authentication. (Required)
   * @param {string} [options.apiBaseUrl='https://api.adtivity.com/v1'] - Base URL for your API.
   * @param {boolean} [options.debug=false] - Enable debug logging to the console.
   * @param {number} [options.batchSize=10] - Maximum number of events to batch before sending.
   * @param {number} [options.flushInterval=5000] - Time in ms to wait before flushing events, even if batchSize is not met.
   * @param {number} [options.maxRetries=3] - Maximum number of retries for failed network requests.
   * @param {number} [options.retryDelayMs=1000] - Initial delay in milliseconds for exponential backoff retries.
   * @param {boolean} [options.collectData=true] - Set to false to disable all data collection.
   */
  constructor(options) {
    if (Adtivity._isInitialized) {
      this._log(
        "warn",
        "Adtivity SDK already initialized. Subsequent initializations will be ignored."
      )
      return
    }

    if (!options || !options.apiKey) {
      console.error(
        "Adtivity SDK Error: API Key is required for initialization."
      )
      return
    }

    this._config = { ...this._config, ...options }
    Adtivity._isInitialized = true
    this._log("info", "Adtivity SDK initialized successfully.", this._config)

    // Load persisted events from local storage (if any)
    // These functions inherently handle client-side storage, so they are safe.
    this._loadPersistedEvents()

    // Start the periodic flush timer
    this._startFlushTimer()

    // Process any deferred calls that occurred before initialization
    this._processDeferredCalls()

    // NEW: Wrap browser-specific event listeners in a client-side check
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Add event listener for page unload to ensure events are sent
      // Using `visibilitychange` for better cross-browser support and reliability
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flushEvents(true) // Flush when page becomes hidden
        }
      })
      // Fallback for older browsers or specific scenarios
      window.addEventListener("beforeunload", () => this.flushEvents(true))
      window.addEventListener("unload", () => this.flushEvents(true))
    }
  }

  /**
   * Gets the singleton instance of the Adtivity SDK.
   * If the SDK has not been initialized, it initializes it with the provided options.
   * Subsequent calls with options will ignore the options if already initialized.
   * @param {object} [options] - Configuration options. Only used for the first initialization.
   * @returns {Adtivity} The SDK instance.
   */
  static getInstance(options) {
    if (!Adtivity._instance) {
      Adtivity._instance = new Adtivity(options)
    }
    return Adtivity._instance
  }

  /**
   * Internal logging utility.
   * @private
   * @param {'info'|'warn'|'error'|'debug'} level - Log level.
   * @param {...any} args - Arguments to log.
   */
  _log(level, ...args) {
    // Console is generally safe on server and client
    if (this._config.debug || level === "error" || level === "warn") {
      console[level](`[Adtivity SDK]`, ...args)
    }
  }

  /**
   * Stores events in local storage for persistence.
   * @private
   */
  _persistEvents() {
    // Storage functions already contain window/document checks
    try {
      setLocalStorageItem(
        "adtivity_event_queue",
        JSON.stringify(this._eventQueue),
        this._log.bind(this) // Pass logger to storage functions
      )
      this._log(
        "debug",
        `Persisted ${this._eventQueue.length} events to local storage.`
      )
    } catch (e) {
      this._log("error", "Failed to persist events to local storage:", e)
    }
  }

  /**
   * Loads events from local storage into the queue.
   * @private
   */
  _loadPersistedEvents() {
    // Storage functions already contain window/document checks
    try {
      const persistedQueue = getLocalStorageItem(
        "adtivity_event_queue",
        this._log.bind(this)
      ) // Pass logger
      if (persistedQueue) {
        this._eventQueue = JSON.parse(persistedQueue)
        this._log(
          "info",
          `Loaded ${this._eventQueue.length} events from local storage.`
        )
        removeLocalStorageItem("adtivity_event_queue", this._log.bind(this)) // Pass logger
      }
    } catch (e) {
      this._log(
        "error",
        "Failed to load persisted events from local storage:",
        e
      )
      removeLocalStorageItem("adtivity_event_queue", this._log.bind(this)) // Pass logger
    }
  }

  /**
   * Starts the periodic timer to flush events.
   * @private
   */
  _startFlushTimer() {
    // NEW: Wrap window.setInterval in a client-side check
    if (typeof window !== "undefined") {
      if (this._flushTimer) {
        clearInterval(this._flushTimer)
        this._flushTimer = null
      }
      this._flushTimer = window.setInterval(() => {
        if (this._eventQueue.length > 0) {
          this._log("debug", "Flushing events due to interval.")
          this.flushEvents()
        }
      }, this._config.flushInterval)
      this._log(
        "debug",
        `Flush timer started for every ${this._config.flushInterval}ms.`
      )
    } else {
      this._log("debug", "Not starting flush timer on server side.")
    }
  }

  /**
   * Sends the current batch of events to your API.
   * @private
   * @param {Array<object>} eventsToSend - The array of events to send.
   * @param {number} retryCount - Current retry attempt count.
   * @returns {Promise<any>} - Promise that resolves with the API response.
   */
  async _sendBatch(eventsToSend, retryCount = 0) {
    if (!this._config.apiKey) {
      this._log(
        "error",
        "API Key is missing. Please ensure SDK is initialized with a valid API Key."
      )
      return Promise.reject(new Error("API Key missing"))
    }

    const url = `${this._config.apiBaseUrl}/events`
    try {
      this._log(
        "debug",
        `Sending batch of ${eventsToSend.length} events. Attempt ${
          retryCount + 1
        }.`,
        eventsToSend
      )
      // NEW: Wrap fetch in a client-side check
      if (typeof window !== "undefined" && typeof fetch !== "undefined") {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this._config.apiKey}`,
          },
          body: JSON.stringify(eventsToSend),
          // Keepalive is crucial for unload events to complete
          keepalive: true,
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error" }))
          throw new Error(
            `API Error (${response.status}): ${response.statusText} - ${
              errorData.message || JSON.stringify(errorData)
            }`
          )
        }

        this._log(
          "info",
          `Successfully sent batch of ${eventsToSend.length} events.`
        )
        return response.json()
      } else {
        this._log(
          "warn",
          "Fetch API not available (server-side). Cannot send batch."
        )
        return Promise.resolve({ message: "Batch not sent (server-side)" }) // Resolve for server-side
      }
    } catch (error) {
      this._log(
        "error",
        `Failed to send batch (Attempt ${retryCount + 1}):`,
        error
      )

      // NEW: Wrap setTimeout in a client-side check
      if (
        retryCount < this._config.maxRetries &&
        typeof window !== "undefined"
      ) {
        const delay = this._config.retryDelayMs * Math.pow(2, retryCount)
        this._log("info", `Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this._sendBatch(eventsToSend, retryCount + 1)
      } else {
        this._log(
          "error",
          "Max retries reached or not on client side. Dropping batch or re-queueing (not implemented for simplicity)."
        )
        throw error // Re-throw if the calling code needs to know about the final failure
      }
    }
  }

  /**
   * Adds an event to the queue and flushes if batch size is met.
   * @private
   * @param {object} eventPayload - The event object to queue.
   * @returns {void}
   */
  _queueEvent(eventPayload) {
    if (!this._config.collectData) {
      this._log("debug", "Data collection disabled. Event not queued.")
      return
    }

    this._eventQueue.push(eventPayload)
    this._log(
      "debug",
      `Event queued. Queue size: ${this._eventQueue.length}.`,
      eventPayload
    )

    if (this._eventQueue.length >= this._config.batchSize) {
      this.flushEvents()
    } else {
      // Restart timer to ensure flush interval is respected from last event addition
      this._startFlushTimer()
    }
    this._persistEvents()
  }

  /**
   * Flushes all queued events immediately.
   * This method attempts to send all events currently in the queue.
   * @param {boolean} [isUnload=false] - True if called during page unload. This affects error handling behavior.
   * @returns {Promise<void>}
   */
  async flushEvents(isUnload = false) {
    if (this._eventQueue.length === 0) {
      this._log("debug", "No events to flush.")
      return
    }

    // Clear existing timer as we're flushing now
    // NEW: Wrap clearInterval in a client-side check
    if (this._flushTimer && typeof window !== "undefined") {
      clearInterval(this._flushTimer)
      this._flushTimer = null
    }

    const eventsToFlush = [...this._eventQueue]
    this._eventQueue = []

    try {
      await this._sendBatch(eventsToFlush)
      removeLocalStorageItem("adtivity_event_queue", this._log.bind(this)) // Pass logger
    } catch (error) {
      this._log(
        "error",
        "Error flushing events. Events might be re-queued or lost.",
        error
      )
      // If flushing failed, you might want to put events back in queue
      // or handle them based on 'isUnload'
      if (!isUnload) {
        // If not unload, re-queue for next attempt
        this._eventQueue.unshift(...eventsToFlush)
        this._persistEvents()
      } else {
        this._log(
          "warn",
          "Events likely lost during unload due to send failure:",
          eventsToFlush
        )
      }
    } finally {
      // Restart timer if not during unload and there are still events in queue
      if (!isUnload && this._eventQueue.length > 0) {
        this._startFlushTimer()
      }
    }
  }

  /**
   * Tracks a custom event.
   * Events are queued and sent in batches.
   * @param {string} eventName - The name of the event (e.g., 'Product Viewed', 'AddToCart').
   * @param {object} [properties={}] - Optional properties associated with the event.
   * @returns {void} (Note: This is now just adding to queue, not sending immediately)
   */
  trackEvent(eventName, properties = {}) {
    if (!Adtivity._isInitialized) {
      this._log("warn", "SDK not initialized. Deferring event:", eventName)
      Adtivity._deferredCalls.push(["trackEvent", eventName, properties])
      return
    }

    if (!this._config.collectData) {
      this._log(
        "debug",
        `Event '${eventName}' not tracked due to consent settings.`
      )
      return
    }

    // NEW: Wrap window.location and navigator.userAgent in client-side check
    const payload = {
      eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    }

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      payload.properties.url = window.location.href
      payload.properties.referrer = document.referrer
      payload.properties.userAgent = navigator.userAgent
      payload.properties.sessionId = getSessionId(this._log.bind(this))
      payload.properties.anonymousId = getAnonymousId(this._log.bind(this))
    } else {
      this._log(
        "debug",
        "Browser environment not available for full event properties (server-side)."
      )
      // Provide fallback values or omit if not applicable for server-side events
      payload.properties.url = "N/A (server)"
      payload.properties.referrer = "N/A (server)"
      payload.properties.userAgent = "N/A (server)"
      // Session/Anonymous IDs are client-side concepts, so they won't be generated here.
    }

    this._queueEvent(payload)
  }

  /**
   * Identifies a user with unique ID and properties.
   * This will immediately trigger a dedicated send for the identify event.
   * @param {string} userId - A unique identifier for the user (e.g., database ID, wallet address).
   * @param {object} [properties={}] - Optional properties of the user (e.g., name, email, wallet type).
   * @returns {Promise<void>}
   */
  async identify(userId, properties = {}) {
    if (!Adtivity._isInitialized) {
      this._log("warn", "SDK not initialized. Deferring identify call:", userId)
      Adtivity._deferredCalls.push(["identify", userId, properties])
      return
    }

    if (!this._config.collectData) {
      this._log(
        "debug",
        `User identification for '${userId}' skipped due to consent settings.`
      )
      return
    }

    if (!userId) {
      this._log("error", "User ID is required for identification.")
      return
    }

    const payload = {
      userId,
      properties: {
        ...properties,
        lastSeen: new Date().toISOString(),
      },
    }
    // Identify calls are often sent immediately or in a dedicated queue
    // For simplicity, we'll send it directly and ensure anonymousId is linked
    try {
      // NEW: Wrap getAnonymousId in client-side check
      let anonymousId = "N/A (server)"
      if (typeof window !== "undefined") {
        anonymousId = getAnonymousId(this._log.bind(this))
      }

      const identifyPayload = {
        type: "identify", // Special type for identify
        anonymousId: anonymousId,
        userId: userId,
        properties: payload.properties,
        timestamp: new Date().toISOString(),
      }
      // Send identify as a single-event batch immediately
      await this._sendBatch([identifyPayload])
    } catch (error) {
      this._log(
        "error",
        `Failed to send identify call for user ${userId}:`,
        error
      )
    }
  }

  /**
   * Sets or updates the consent status for data collection.
   * If consent is revoked, any pending events are flushed, and further collection stops.
   * If consent is given, collection resumes.
   * @param {boolean} consentGiven - True if user has given consent, false otherwise.
   */
  setConsent(consentGiven) {
    this._config.collectData = consentGiven
    this._log(
      "info",
      `Adtivity SDK data collection consent set to: ${consentGiven}`
    )
    if (!consentGiven) {
      this.flushEvents() // Try to send any remaining events before stopping
      this._eventQueue = []
      removeLocalStorageItem("adtivity_event_queue") // Clear persisted queue
      // NEW: Wrap clearInterval in a client-side check
      if (this._flushTimer && typeof window !== "undefined") {
        clearInterval(this._flushTimer)
        this._flushTimer = null
      }
      this._log("info", "All data collection stopped and cleared.")
    } else {
      this._startFlushTimer()
      this._loadPersistedEvents()
    }
  }

  /**
   * Processes events that were deferred before the SDK is initialized.
   * @private
   */
  _processDeferredCalls() {
    if (Adtivity._deferredCalls.length > 0) {
      this._log(
        "info",
        `Processing ${Adtivity._deferredCalls.length} deferred calls.`
      )
      while (Adtivity._deferredCalls.length > 0) {
        const [methodName, ...args] = Adtivity._deferredCalls.shift()
        // Ensure the method exists on the instance before calling
        if (typeof this[methodName] === "function") {
          this[methodName](...args) // Call the actual method
        } else {
          this._log("warn", `Deferred call to unknown method: ${methodName}`)
        }
      }
    }
  }

  /**
   * Initializes automatic page view tracking for SPAs.
   * This should be called after SDK initialization if desired.
   */
  initAutomaticPageTracking() {
    if (!this._config.collectData) {
      this._log(
        "debug",
        "Automatic page tracking skipped due to consent settings."
      )
      return
    }
    // NEW: Wrap initAutomaticPageTracking in a client-side check
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Pass the SDK's trackEvent method, log method, and instance for internal state
      initAutomaticPageTracking(
        (eventName, props) => this.trackEvent(eventName, props),
        this._log.bind(this),
        this // Pass the Adtivity instance itself
      )
      this._log("info", "Automatic page view tracking initialized.")
    } else {
      this._log(
        "debug",
        "Automatic page tracking not initialized (server-side)."
      )
    }
  }

  /**
   * Initializes automatic click tracking for elements with `data-adtivity-track` attribute.
   */
  initAutomaticClickTracking() {
    if (!this._config.collectData) {
      this._log(
        "debug",
        "Automatic click tracking skipped due to consent settings."
      )
      return
    }
    // NEW: Wrap initAutomaticClickTracking in a client-side check
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Pass the SDK's trackEvent method and log method
      initAutomaticClickTracking(
        (eventName, props) => this.trackEvent(eventName, props),
        this._log.bind(this)
      )
      this._log("info", "Automatic click tracking initialized.")
    } else {
      this._log(
        "debug",
        "Automatic click tracking not initialized (server-side)."
      )
    }
  }

  // Add this for Jest testing to reset private static fields
  static __resetForTesting() {
    Adtivity._isInitialized = false
    Adtivity._instance = null
    Adtivity._deferredCalls = []
  }
}

// REMOVED: Global accessor for deferred calls and DOMContentLoaded listener
// These are not needed when integrating as a module in a React application.
// The Adtivity class will be directly imported and instantiated.

// Export the Adtivity class for module environments (NPM packages)
export { Adtivity }

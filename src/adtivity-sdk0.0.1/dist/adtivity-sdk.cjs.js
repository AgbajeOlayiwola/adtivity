'use strict';

// adtivity-sdk/src/autoTrackers/clickTracker.js

/**
 * Initializes automatic click tracking for elements with `data-adtivity-track` attribute.
 * Attaches a global click listener to the document body.
 * @param {function(string, object): void} trackEventFn - The SDK's trackEvent function.
 * @param {function(string, ...any): void} logFn - The SDK's log function.
 */
function initAutomaticClickTracking(trackEventFn, logFn) {
  document.body.addEventListener("click", event => {
    // Use .closest() to find the nearest ancestor with the data-adtivity-track attribute
    const target = event.target.closest("[data-adtivity-track]");
    if (target) {
      const eventName = target.getAttribute("data-adtivity-track") || "Automatic Click";
      let properties = {
        elementId: target.id || null,
        // Capture innerText, but limit length to avoid excessively large payloads
        elementText: target.innerText ? target.innerText.substring(0, 200) : null,
        elementType: target.tagName,
        // Capture common attributes for context
        href: target.href || null,
        // For <a> tags
        type: target.type || null,
        // For <input> tags
        value: target.value || null,
        // For <input> tags
        className: target.className || null // Capture CSS classes
      };

      // Attempt to parse additional properties from a data-adtivity-props attribute
      // This allows developers to pass custom JSON data with the click event
      if (target.dataset.adtivityProps) {
        try {
          const customProps = JSON.parse(target.dataset.adtivityProps);
          properties = {
            ...properties,
            ...customProps
          };
        } catch (e) {
          logFn("error", "Failed to parse data-adtivity-props. Ensure it is valid JSON:", e, target.dataset.adtivityProps);
        }
      }
      trackEventFn(eventName, properties).catch(e => logFn("error", "Error tracking automatic click:", e));
    }
  });
  logFn("info", "Automatic click tracking listeners attached.");
}

// adtivity-sdk/src/autoTrackers/pageTracker.js

/**
 * Initializes automatic page view tracking for Single Page Applications (SPAs).
 * This function hooks into the browser's History API to detect URL changes.
 * @param {function(string, object): void} trackEventFn - The SDK's trackEvent function.
 * @param {function(string, ...any): void} logFn - The SDK's log function.
 * @param {object} sdkInstance - The SDK instance to access internal properties like _lastTrackedPage.
 */
function initAutomaticPageTracking(trackEventFn, logFn, sdkInstance) {
  // Initial page view when the SDK is loaded and initialized
  trackPageView(trackEventFn, logFn, sdkInstance);

  // Override pushState and replaceState to detect programmatic URL changes
  const originalPushState = history.pushState;
  history.pushState = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    originalPushState.apply(history, args);
    trackPageView(trackEventFn, logFn, sdkInstance);
  };
  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    originalReplaceState.apply(history, args);
    trackPageView(trackEventFn, logFn, sdkInstance);
  };

  // Listen for browser back/forward button clicks
  window.addEventListener("popstate", () => {
    trackPageView(trackEventFn, logFn, sdkInstance);
  });
  logFn("info", "Automatic page view tracking listeners attached.");
}

/**
 * Tracks a page view event.
 * Prevents duplicate tracking if the URL hasn't actually changed.
 * @private
 * @param {function(string, object): void} trackEventFn - The SDK's trackEvent function.
 * @param {function(string, ...any): void} logFn - The SDK's log function.
 * @param {object} sdkInstance - The SDK instance to access internal properties like _lastTrackedPage.
 */
function trackPageView(trackEventFn, logFn, sdkInstance) {
  const currentPage = window.location.pathname + window.location.search;
  // Only track if the page URL has actually changed from the last tracked one
  if (sdkInstance._lastTrackedPage === currentPage) {
    logFn("debug", "Page URL unchanged, skipping duplicate page view tracking.");
    return;
  }
  sdkInstance._lastTrackedPage = currentPage; // Update the last tracked page

  trackEventFn("Page Viewed", {
    pageTitle: document.title,
    path: window.location.pathname,
    query: window.location.search,
    fullUrl: window.location.href
  }).catch(e => logFn("error", "Error tracking automatic page view:", e));
}

// adtivity-sdk/src/utils/storage.js


/**
 * Safely sets an item in localStorage.
 * Handles potential SecurityError if localStorage is unavailable (e.g., some sandboxed iframes).
 * @param {string} key - The key to store the data under.
 * @param {string} value - The string value to store.
 */
function setLocalStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[Adtivity SDK] Failed to set localStorage item '${key}':`, e);
  }
}

/**
 * Safely gets an item from localStorage.
 * Handles potential errors.
 * @param {string} key - The key of the item to retrieve.
 * @returns {string|null} The stored value, or null if not found or an error occurred.
 */
function getLocalStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`[Adtivity SDK] Failed to get localStorage item '${key}':`, e);
    return null;
  }
}

/**
 * Safely removes an item from localStorage.
 * Handles potential errors.
 * @param {string} key - The key of the item to remove.
 */
function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[Adtivity SDK] Failed to remove localStorage item '${key}':`, e);
  }
}

// adtivity-sdk/src/index.js


/**
 * Adtivity SDK for Web Applications
 * Provides methods to track events, identify users, and manages data collection
 * with batching, retries, and persistence.
 */
class Adtivity {
  // Accessible by pageTracker.js

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
    /**
     * SDK configuration.
     * @private
     * @type {object}
     */
    this._config = {
      // Changed from #config to _config
      apiKey: null,
      apiBaseUrl: "https://api.adtivity.com/v1",
      // REPLACE WITH YOUR ACTUAL ADTIVITY API BASE URL
      debug: false,
      // Batching configuration
      batchSize: 10,
      // Max events per batch
      flushInterval: 5000,
      // Flush events every 5 seconds (ms)
      // Retry configuration
      maxRetries: 3,
      retryDelayMs: 1000,
      // Initial delay for exponential backoff
      // Consent
      // Default to true. Developers should set this based on user consent (e.g., from a CMP).
      collectData: true
    };
    /**
     * Internal queue for events to be sent.
     * @private
     * @type {Array<object>}
     */
    this._eventQueue = [];
    // Changed from #eventQueue to _eventQueue
    /**
     * Timer for flushing events.
     * @private
     * @type {number|null}
     */
    this._flushTimer = null;
    // Changed from #deferredCalls to _deferredCalls
    /**
     * Stores the last tracked page path to prevent duplicate page view events in SPAs.
     * @private
     * @type {string|null}
     */
    this._lastTrackedPage = null;
    if (Adtivity._isInitialized) {
      // Changed from #isInitialized to _isInitialized
      this._log(
      // Changed from #log to _log
      "warn", "Adtivity SDK already initialized. Subsequent initializations will be ignored.");
      return;
    }
    if (!options || !options.apiKey) {
      console.error("Adtivity SDK Error: API Key is required for initialization.");
      return;
    }
    this._config = {
      ...this._config,
      ...options
    }; // Changed from #config to _config
    Adtivity._isInitialized = true; // Changed from #isInitialized to _isInitialized
    this._log("info", "Adtivity SDK initialized successfully.", this._config); // Changed from #log to _log, #config to _config

    // Load persisted events from local storage (if any)
    this._loadPersistedEvents(); // Changed from #loadPersistedEvents to _loadPersistedEvents

    // Start the periodic flush timer
    this._startFlushTimer(); // Changed from #startFlushTimer to _startFlushTimer

    // Process any deferred calls that occurred before initialization
    this._processDeferredCalls(); // Changed from #processDeferredCalls to _processDeferredCalls

    // Add event listener for page unload to ensure events are sent
    // Using `visibilitychange` for better cross-browser support and reliability
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushEvents(true); // Flush when page becomes hidden
      }
    });
    // Fallback for older browsers or specific scenarios
    window.addEventListener("beforeunload", () => this.flushEvents(true));
    window.addEventListener("unload", () => this.flushEvents(true));
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
      // Changed from #instance to _instance
      Adtivity._instance = new Adtivity(options); // Changed from #instance to _instance
    }
    return Adtivity._instance; // Changed from #instance to _instance
  }

  /**
   * Internal logging utility.
   * @private
   * @param {'info'|'warn'|'error'|'debug'} level - Log level.
   * @param {...any} args - Arguments to log.
   */
  _log(level) {
    // Changed from #log to _log
    if (this._config.debug || level === "error" || level === "warn") {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      // Changed from #config to _config
      console[level](`[Adtivity SDK]`, ...args);
    }
  }

  /**
   * Stores events in local storage for persistence.
   * @private
   */
  _persistEvents() {
    // Changed from #persistEvents to _persistEvents
    try {
      setLocalStorageItem("adtivity_event_queue", JSON.stringify(this._eventQueue) // Changed from #eventQueue to _eventQueue
      );
      this._log(
      // Changed from #log to _log
      "debug", `Persisted ${this._eventQueue.length} events to local storage.` // Changed from #eventQueue to _eventQueue
      );
    } catch (e) {
      this._log("error", "Failed to persist events to local storage:", e); // Changed from #log to _log
    }
  }

  /**
   * Loads events from local storage into the queue.
   * @private
   */
  _loadPersistedEvents() {
    // Changed from #loadPersistedEvents to _loadPersistedEvents
    try {
      const persistedQueue = getLocalStorageItem("adtivity_event_queue");
      if (persistedQueue) {
        this._eventQueue = JSON.parse(persistedQueue); // Changed from #eventQueue to _eventQueue
        this._log(
        // Changed from #log to _log
        "info", `Loaded ${this._eventQueue.length} events from local storage.` // Changed from #eventQueue to _eventQueue
        );
        removeLocalStorageItem("adtivity_event_queue"); // Clear after loading
      }
    } catch (e) {
      this._log(
      // Changed from #log to _log
      "error", "Failed to load persisted events from local storage:", e);
      removeLocalStorageItem("adtivity_event_queue"); // Clear corrupted data
    }
  }

  /**
   * Starts the periodic timer to flush events.
   * @private
   */
  _startFlushTimer() {
    // Changed from #startFlushTimer to _startFlushTimer
    if (this._flushTimer) {
      // Changed from #flushTimer to _flushTimer
      clearInterval(this._flushTimer); // Changed from #flushTimer to _flushTimer
    }
    this._flushTimer = window.setInterval(() => {
      // Changed from #flushTimer to _flushTimer
      if (this._eventQueue.length > 0) {
        // Changed from #eventQueue to _eventQueue
        this._log("debug", "Flushing events due to interval."); // Changed from #log to _log
        this.flushEvents();
      }
    }, this._config.flushInterval); // Changed from #config to _config
    this._log(
    // Changed from #log to _log
    "debug", `Flush timer started for every ${this._config.flushInterval}ms.` // Changed from #config to _config
    );
  }

  /**
   * Sends the current batch of events to your API.
   * @private
   * @param {Array<object>} eventsToSend - The array of events to send.
   * @param {number} retryCount - Current retry attempt count.
   * @returns {Promise<any>} - Promise that resolves with the API response.
   */
  async _sendBatch(eventsToSend) {
    let retryCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    // Changed from #sendBatch to _sendBatch
    if (!this._config.apiKey) {
      // Changed from #config to _config
      this._log(
      // Changed from #log to _log
      "error", "API Key is missing. Please ensure SDK is initialized with a valid API Key.");
      return Promise.reject(new Error("API Key missing"));
    }
    const url = `${this._config.apiBaseUrl}/events`; // Changed from #config to _config
    try {
      this._log(
      // Changed from #log to _log
      "debug", `Sending batch of ${eventsToSend.length} events. Attempt ${retryCount + 1}.`, eventsToSend);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._config.apiKey}` // Changed from #config to _config
        },
        body: JSON.stringify(eventsToSend),
        // Keepalive is crucial for unload events to complete
        keepalive: true
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Unknown error"
        }));
        throw new Error(`API Error (${response.status}): ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
      }
      this._log(
      // Changed from #log to _log
      "info", `Successfully sent batch of ${eventsToSend.length} events.`);
      return response.json();
    } catch (error) {
      this._log(
      // Changed from #log to _log
      "error", `Failed to send batch (Attempt ${retryCount + 1}):`, error);
      if (retryCount < this._config.maxRetries) {
        // Changed from #config to _config
        const delay = this._config.retryDelayMs * Math.pow(2, retryCount); // Changed from #config to _config
        this._log("info", `Retrying in ${delay}ms...`); // Changed from #log to _log
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._sendBatch(eventsToSend, retryCount + 1); // Changed from #sendBatch to _sendBatch
      } else {
        this._log(
        // Changed from #log to _log
        "error", "Max retries reached. Dropping batch or re-queueing (not implemented for simplicity).");
        // In a real SDK, you might re-queue these to local storage or a dead-letter queue.
        throw error; // Re-throw if the calling code needs to know about the final failure
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
    // Changed from #queueEvent to _queueEvent
    if (!this._config.collectData) {
      // Changed from #config to _config
      this._log("debug", "Data collection disabled. Event not queued."); // Changed from #log to _log
      return;
    }
    this._eventQueue.push(eventPayload); // Changed from #eventQueue to _eventQueue
    this._log(
    // Changed from #log to _log
    "debug", `Event queued. Queue size: ${this._eventQueue.length}.`,
    // Changed from #eventQueue to _eventQueue
    eventPayload);
    if (this._eventQueue.length >= this._config.batchSize) {
      // Changed from #eventQueue to _eventQueue, #config to _config
      this._log("debug", "Batch size met. Flushing events."); // Changed from #log to _log
      this.flushEvents();
    } else {
      // Restart timer to ensure flush interval is respected from last event addition
      this._startFlushTimer(); // Changed from #startFlushTimer to _startFlushTimer
    }
    this._persistEvents(); // Changed from #persistEvents to _persistEvents
  }

  /**
   * Flushes all queued events immediately.
   * This method attempts to send all events currently in the queue.
   * @param {boolean} [isUnload=false] - True if called during page unload. This affects error handling behavior.
   * @returns {Promise<void>}
   */
  async flushEvents() {
    let isUnload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (this._eventQueue.length === 0) {
      // Changed from #eventQueue to _eventQueue
      this._log("debug", "No events to flush."); // Changed from #log to _log
      return;
    }

    // Clear existing timer as we're flushing now
    if (this._flushTimer) {
      // Changed from #flushTimer to _flushTimer
      clearInterval(this._flushTimer); // Changed from #flushTimer to _flushTimer
      this._flushTimer = null; // Changed from #flushTimer to _flushTimer
    }
    const eventsToFlush = [...this._eventQueue]; // Changed from #eventQueue to _eventQueue
    this._eventQueue = []; // Changed from #eventQueue to _eventQueue

    try {
      await this._sendBatch(eventsToFlush); // Changed from #sendBatch to _sendBatch
      removeLocalStorageItem("adtivity_event_queue"); // Clear persisted queue after successful send
    } catch (error) {
      this._log(
      // Changed from #log to _log
      "error", "Error flushing events. Events might be re-queued or lost.", error);
      // If flushing failed, you might want to put events back in queue
      // or handle them based on 'isUnload'
      if (!isUnload) {
        // If not unload, re-queue for next attempt
        this._eventQueue.unshift(...eventsToFlush); // Changed from #eventQueue to _eventQueue
        this._persistEvents(); // Changed from #persistEvents to _persistEvents
      } else {
        // During unload, dropping is often preferred over blocking the page too long
        this._log(
        // Changed from #log to _log
        "warn", "Events likely lost during unload due to send failure:", eventsToFlush);
      }
    } finally {
      // Restart timer if not during unload and there are still events in queue
      if (!isUnload && this._eventQueue.length > 0) {
        // Changed from #eventQueue to _eventQueue
        this._startFlushTimer(); // Changed from #startFlushTimer to _startFlushTimer
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
  trackEvent(eventName) {
    let properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!Adtivity._isInitialized) {
      // Changed from #isInitialized to _isInitialized
      this._log("warn", "SDK not initialized. Deferring event:", eventName); // Changed from #log to _log
      Adtivity._deferredCalls.push(["trackEvent", eventName, properties]); // Changed from #deferredCalls to _deferredCalls
      return;
    }
    if (!this._config.collectData) {
      // Changed from #config to _config
      this._log(
      // Changed from #log to _log
      "debug", `Event '${eventName}' not tracked due to consent settings.`);
      return;
    }
    const payload = {
      eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        sessionId: this._getSessionId(),
        // Changed from #getSessionId to _getSessionId
        anonymousId: this._getAnonymousId() // Changed from #getAnonymousId to _getAnonymousId
      }
    };
    this._queueEvent(payload); // Changed from #queueEvent to _queueEvent
  }

  /**
   * Identifies a user with unique ID and properties.
   * This will immediately trigger a dedicated send for the identify event.
   * @param {string} userId - A unique identifier for the user (e.g., database ID, wallet address).
   * @param {object} [properties={}] - Optional properties of the user (e.g., name, email, wallet type).
   * @returns {Promise<void>}
   */
  async identify(userId) {
    let properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!Adtivity._isInitialized) {
      // Changed from #isInitialized to _isInitialized
      this._log("warn", "SDK not initialized. Deferring identify call:", userId); // Changed from #log to _log
      Adtivity._deferredCalls.push(["identify", userId, properties]); // Changed from #deferredCalls to _deferredCalls
      return;
    }
    if (!this._config.collectData) {
      // Changed from #config to _config
      this._log(
      // Changed from #log to _log
      "debug", `User identification for '${userId}' skipped due to consent settings.`);
      return;
    }
    if (!userId) {
      this._log("error", "User ID is required for identification."); // Changed from #log to _log
      return;
    }
    const payload = {
      userId,
      properties: {
        ...properties,
        lastSeen: new Date().toISOString()
      }
    };
    // Identify calls are often sent immediately or in a dedicated queue
    // For simplicity, we'll send it directly and ensure anonymousId is linked
    try {
      const identifyPayload = {
        type: "identify",
        // Special type for identify
        anonymousId: this._getAnonymousId(),
        // Changed from #getAnonymousId to _getAnonymousId
        userId: userId,
        properties: payload.properties,
        timestamp: new Date().toISOString()
      };
      // Send identify as a single-event batch immediately
      await this._sendBatch([identifyPayload]); // Changed from #sendBatch to _sendBatch
    } catch (error) {
      this._log(
      // Changed from #log to _log
      "error", `Failed to send identify call for user ${userId}:`, error);
    }
  }

  /**
   * Sets or updates the consent status for data collection.
   * If consent is revoked, any pending events are flushed, and further collection stops.
   * If consent is given, collection resumes.
   * @param {boolean} consentGiven - True if user has given consent, false otherwise.
   */
  setConsent(consentGiven) {
    this._config.collectData = consentGiven; // Changed from #config to _config
    this._log(
    // Changed from #log to _log
    "info", `Adtivity SDK data collection consent set to: ${consentGiven}`);
    if (!consentGiven) {
      this.flushEvents(); // Try to send any remaining events before stopping
      this._eventQueue = []; // Changed from #eventQueue to _eventQueue
      removeLocalStorageItem("adtivity_event_queue"); // Clear persisted queue
      if (this._flushTimer) {
        // Changed from #flushTimer to _flushTimer
        clearInterval(this._flushTimer); // Changed from #flushTimer to _flushTimer
        this._flushTimer = null; // Changed from #flushTimer to _flushTimer
      }
      this._log("info", "All data collection stopped and cleared."); // Changed from #log to _log
    } else {
      this._startFlushTimer(); // Changed from #startFlushTimer to _startFlushTimer
      this._loadPersistedEvents(); // Changed from #loadPersistedEvents to _loadPersistedEvents
    }
  }

  /**
   * Processes events that were deferred before the SDK was initialized.
   * @private
   */
  _processDeferredCalls() {
    // Changed from #processDeferredCalls to _processDeferredCalls
    if (Adtivity._deferredCalls.length > 0) {
      // Changed from #deferredCalls to _deferredCalls
      this._log(
      // Changed from #log to _log
      "info", `Processing ${Adtivity._deferredCalls.length} deferred calls.` // Changed from #deferredCalls to _deferredCalls
      );
      while (Adtivity._deferredCalls.length > 0) {
        // Changed from #deferredCalls to _deferredCalls
        const [methodName, ...args] = Adtivity._deferredCalls.shift(); // Changed from #deferredCalls to _deferredCalls
        // Ensure the method exists on the instance before calling
        if (typeof this[methodName] === "function") {
          this[methodName](...args); // Call the actual method
        } else {
          this._log("warn", `Deferred call to unknown method: ${methodName}`); // Changed from #log to _log
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
      // Changed from #config to _config
      this._log(
      // Changed from #log to _log
      "debug", "Automatic page tracking skipped due to consent settings.");
      return;
    }
    // Pass the SDK's trackEvent method, log method, and instance for internal state
    initAutomaticPageTracking((eventName, props) => this.trackEvent(eventName, props), this._log,
    // Changed from #log to _log
    this // Pass the Adtivity instance itself
    );
    this._log("info", "Automatic page view tracking initialized."); // Changed from #log to _log
  }

  /**
   * Initializes automatic click tracking for elements with `data-adtivity-track` attribute.
   */
  initAutomaticClickTracking() {
    if (!this._config.collectData) {
      // Changed from #config to _config
      this._log(
      // Changed from #log to _log
      "debug", "Automatic click tracking skipped due to consent settings.");
      return;
    }
    // Pass the SDK's trackEvent method and log method
    initAutomaticClickTracking((eventName, props) => this.trackEvent(eventName, props), this._log // Changed from #log to _log
    );
    this._log("info", "Automatic click tracking initialized."); // Changed from #log to _log
  }

  // Add this for Jest testing to reset private static fields
  static __resetForTesting() {
    Adtivity._isInitialized = false;
    Adtivity._instance = null;
    Adtivity._deferredCalls = [];
  }
}

// Global accessor for deferred calls before SDK is fully loaded
// This allows developers to call `window.Adtivity.trackEvent` even if the script hasn't fully loaded/initialized.
// Changed from #flushTimer to _flushTimer
/**
 * Internal flag to check if the SDK has been initialized.
 * @private
 * @type {boolean}
 */
Adtivity._isInitialized = false;
// Changed from #isInitialized to _isInitialized
/**
 * Stores the singleton instance of the SDK.
 * @private
 * @type {Adtivity|null}
 */
Adtivity._instance = null;
// Changed from #instance to _instance
/**
 * Queue for calls made before the SDK is fully initialized.
 * This allows developers to call SDK methods immediately, even if the script hasn't fully loaded.
 * @private
 * @type {Array<Array<any>>}
 */
Adtivity._deferredCalls = [];
window.Adtivity = window.Adtivity || {
  // These methods will simply push their arguments to a queue
  // which the actual SDK instance will process upon initialization.
  trackEvent: function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return Adtivity._deferredCalls.push(["trackEvent", ...args]);
  },
  // Changed from #deferredCalls to _deferredCalls
  identify: function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    return Adtivity._deferredCalls.push(["identify", ...args]);
  },
  // Changed from #deferredCalls to _deferredCalls
  setConsent: function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return Adtivity._deferredCalls.push(["setConsent", ...args]);
  },
  // Changed from #deferredCalls to _deferredCalls
  // Allow direct access to get instance for advanced configuration
  getInstance: options => Adtivity.getInstance(options)
};

// --- Initial setup on DOMContentLoaded (Recommended for most cases) ---
// This ensures the SDK is initialized once the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the Adtivity SDK. Developers will provide their API key here.
  // `window.adtivityConfig` is a global object developers can define on their page.
  const adtivityInstance = window.Adtivity.getInstance(window.adtivityConfig || {
    apiKey: "YOUR_DEFAULT_OR_FALLBACK_API_KEY",
    // Fallback for quick testing
    debug: true // Enable debug logging for development
  });

  // Automatically initialize common tracking features
  adtivityInstance.initAutomaticPageTracking();
  adtivityInstance.initAutomaticClickTracking();
});

// Fallback for scripts loaded after DOMContentLoaded (e.g., dynamic script injection)
// This ensures the SDK is initialized if it wasn't by DOMContentLoaded.
if (document.readyState === "complete" && !Adtivity._isInitialized) {
  // Changed from #isInitialized to _isInitialized
  window.Adtivity.getInstance(window.adtivityConfig || {
    apiKey: "YOUR_DEFAULT_OR_FALLBACK_API_KEY",
    debug: true
  });
}

exports.Adtivity = Adtivity;
//# sourceMappingURL=adtivity-sdk.cjs.js.map

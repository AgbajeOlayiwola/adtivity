// adtivity-sdk/src/autoTrackers/pageTracker.js

/**
 * Initializes automatic page view tracking for Single Page Applications (SPAs).
 * This function hooks into the browser's History API to detect URL changes.
 * @param {function(string, object): void} trackEventFn - The SDK's trackEvent function.
 * @param {function(string, ...any): void} logFn - The SDK's log function.
 * @param {object} sdkInstance - The SDK instance to access internal properties like _lastTrackedPage.
 */
export function initAutomaticPageTracking(trackEventFn, logFn, sdkInstance) {
  // Ensure browser environment before attaching listeners
  if (typeof window === "undefined" || typeof document === "undefined") {
    logFn(
      "debug",
      "Skipping automatic page view tracking initialization on non-browser environment."
    )
    return
  }

  // Initial page view when the SDK is loaded and initialized
  trackPageView(trackEventFn, logFn, sdkInstance)

  // Override pushState and replaceState to detect programmatic URL changes
  const originalPushState = history.pushState
  history.pushState = function (...args) {
    originalPushState.apply(history, args)
    trackPageView(trackEventFn, logFn, sdkInstance)
  }

  const originalReplaceState = history.replaceState
  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args)
    trackPageView(trackEventFn, logFn, sdkInstance)
  }

  // Listen for browser back/forward button clicks
  window.addEventListener("popstate", () => {
    trackPageView(trackEventFn, logFn, sdkInstance)
  })

  logFn("info", "Automatic page view tracking listeners attached.")
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
  // Ensure browser environment before accessing window.location or document.title
  if (typeof window === "undefined" || typeof document === "undefined") {
    logFn("debug", "Skipping page view tracking on non-browser environment.")
    return
  }

  const currentPage = window.location.pathname + window.location.search

  // Only track if the page URL has actually changed from the last tracked one
  if (sdkInstance._lastTrackedPage === currentPage) {
    logFn("debug", "Page URL unchanged, skipping duplicate page view tracking.")
    return
  }

  sdkInstance._lastTrackedPage = currentPage // Update the last tracked page

  // Call trackEventFn without .catch() as it does not return a Promise
  trackEventFn("Page Viewed", {
    pageTitle: document.title,
    path: window.location.pathname,
    query: window.location.search,
    fullUrl: window.location.href,
  })
  // The SDK's internal trackEvent method handles its own errors and logging.
}

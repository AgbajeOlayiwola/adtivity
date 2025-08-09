// adtivity-sdk/src/autoTrackers/clickTracker.js

/**
 * Initializes automatic click tracking for elements with `data-adtivity-track` attribute.
 * Attaches a global click listener to the document body.
 * @param {function(string, object): void} trackEventFn - The SDK's trackEvent function.
 * @param {function(string, ...any): void} logFn - The SDK's log function.
 */
export function initAutomaticClickTracking(trackEventFn, logFn) {
  document.body.addEventListener("click", (event) => {
    // Use .closest() to find the nearest ancestor with the data-adtivity-track attribute
    const target = event.target.closest("[data-adtivity-track]")
    if (target) {
      const eventName =
        target.getAttribute("data-adtivity-track") || "Automatic Click"
      let properties = {
        elementId: target.id || null,
        // Capture innerText, but limit length to avoid excessively large payloads
        elementText: target.innerText
          ? target.innerText.substring(0, 200)
          : null,
        elementType: target.tagName,
        // Capture common attributes for context
        href: target.href || null, // For <a> tags
        type: target.type || null, // For <input> tags
        value: target.value || null, // For <input> tags
        className: target.className || null, // Capture CSS classes
      }

      // Attempt to parse additional properties from a data-adtivity-props attribute
      // This allows developers to pass custom JSON data with the click event
      if (target.dataset.adtivityProps) {
        try {
          const customProps = JSON.parse(target.dataset.adtivityProps)
          properties = { ...properties, ...customProps }
        } catch (e) {
          logFn(
            "error",
            "Failed to parse data-adtivity-props. Ensure it is valid JSON:",
            e,
            target.dataset.adtivityProps
          )
        }
      }

      trackEventFn(eventName, properties).catch((e) =>
        logFn("error", "Error tracking automatic click:", e)
      )
    }
  })
  logFn("info", "Automatic click tracking listeners attached.")
}

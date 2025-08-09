// adtivity-sdk/test/unit/autoTrackers.test.js
import { initAutomaticClickTracking } from "../../src/autoTrackers/clickTracker"
import { initAutomaticPageTracking } from "../../src/autoTrackers/pageTracker"

describe("Automatic Trackers", () => {
  let mockTrackEventFn
  let mockLogFn
  let mockSdkInstance // To mock _lastTrackedPage

  // Store original history methods to restore them after tests
  const originalPushState = window.history.pushState
  const originalReplaceState = window.history.replaceState

  beforeEach(() => {
    mockTrackEventFn = jest.fn()
    mockLogFn = jest.fn()
    mockSdkInstance = { _lastTrackedPage: null } // Mock SDK instance state

    // Reset history mocks
    window.history.pushState = jest.fn(originalPushState)
    window.history.replaceState = jest.fn(originalReplaceState)

    // Clear all event listeners on document.body for clean tests
    document.body.innerHTML = "" // Clear DOM content
    const oldBody = document.body
    document.body = document.createElement("body")
    oldBody.parentNode.replaceChild(document.body, oldBody)

    // Mock window.location for page tracking
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        pathname: "/initial-path",
        search: "",
        href: "http://localhost/initial-path",
        assign: jest.fn(), // Mock assign if needed
      },
    })
    Object.defineProperty(document, "title", {
      writable: true,
      value: "Initial Page Title",
    })
    Object.defineProperty(document, "referrer", {
      writable: true,
      value: "http://referrer.com",
    })
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      value: "Mozilla/5.0 (Test Browser)",
    })
  })

  afterEach(() => {
    // Restore original history methods
    window.history.pushState = originalPushState
    window.history.replaceState = originalReplaceState
    jest.restoreAllMocks() // Restore console mocks
  })

  // --- Page Tracking Tests ---
  describe("initAutomaticPageTracking", () => {
    it("should track initial page view on initialization", () => {
      initAutomaticPageTracking(mockTrackEventFn, mockLogFn, mockSdkInstance)
      expect(mockTrackEventFn).toHaveBeenCalledTimes(1)
      expect(mockTrackEventFn).toHaveBeenCalledWith("Page Viewed", {
        pageTitle: "Initial Page Title",
        path: "/initial-path",
        query: "",
        fullUrl: "http://localhost/initial-path",
      })
      expect(mockSdkInstance._lastTrackedPage).toBe("/initial-path")
    })

    it("should track page view on history.pushState", () => {
      initAutomaticPageTracking(mockTrackEventFn, mockLogFn, mockSdkInstance)
      mockTrackEventFn.mockClear() // Clear initial call

      // Simulate pushState changing the URL
      window.location.pathname = "/new-path"
      window.location.href = "http://localhost/new-path"
      window.history.pushState({}, "", "/new-path")

      expect(mockTrackEventFn).toHaveBeenCalledTimes(1)
      expect(mockTrackEventFn).toHaveBeenCalledWith("Page Viewed", {
        pageTitle: "Initial Page Title", // Title doesn't change automatically with URL in browser
        path: "/new-path",
        query: "",
        fullUrl: "http://localhost/new-path",
      })
      expect(mockSdkInstance._lastTrackedPage).toBe("/new-path")
    })

    it("should track page view on history.replaceState", () => {
      initAutomaticPageTracking(mockTrackEventFn, mockLogFn, mockSdkInstance)
      mockTrackEventFn.mockClear()

      window.location.pathname = "/replaced-path"
      window.location.href = "http://localhost/replaced-path"
      window.history.replaceState({}, "", "/replaced-path")

      expect(mockTrackEventFn).toHaveBeenCalledTimes(1)
      expect(mockTrackEventFn).toHaveBeenCalledWith(
        "Page Viewed",
        expect.objectContaining({ path: "/replaced-path" })
      )
      expect(mockSdkInstance._lastTrackedPage).toBe("/replaced-path")
    })

    it("should track page view on popstate event", () => {
      initAutomaticPageTracking(mockTrackEventFn, mockLogFn, mockSdkInstance)
      mockTrackEventFn.mockClear()

      window.location.pathname = "/popstate-path"
      window.location.href = "http://localhost/popstate-path"
      // Simulate popstate by dispatching the event
      window.dispatchEvent(new PopStateEvent("popstate"))

      expect(mockTrackEventFn).toHaveBeenCalledTimes(1)
      expect(mockTrackEventFn).toHaveBeenCalledWith(
        "Page Viewed",
        expect.objectContaining({ path: "/popstate-path" })
      )
      expect(mockSdkInstance._lastTrackedPage).toBe("/popstate-path")
    })

    it("should not track duplicate page views for the same URL", () => {
      initAutomaticPageTracking(mockTrackEventFn, mockLogFn, mockSdkInstance)
      mockTrackEventFn.mockClear() // Clear initial call

      window.history.pushState({}, "", "/initial-path") // Push same path
      window.history.pushState({}, "", "/initial-path") // Push same path again

      expect(mockTrackEventFn).not.toHaveBeenCalled() // Should not track
    })
  })

  // --- Click Tracking Tests ---
  describe("initAutomaticClickTracking", () => {
    it("should track click on element with data-adtivity-track", () => {
      const button = document.createElement("button")
      button.setAttribute("data-adtivity-track", "Test Button Click")
      button.id = "myButton"
      button.innerText = "Click Me"
      document.body.appendChild(button)

      initAutomaticClickTracking(mockTrackEventFn, mockLogFn)
      button.click() // Simulate click

      expect(mockTrackEventFn).toHaveBeenCalledTimes(1)
      expect(mockTrackEventFn).toHaveBeenCalledWith("Test Button Click", {
        elementId: "myButton",
        elementText: "Click Me",
        elementType: "BUTTON",
        href: null,
        type: null,
        value: null,
        className: "",
      })
    })

    it("should track click with default name if data-adtivity-track is empty", () => {
      const div = document.createElement("div")
      div.setAttribute("data-adtivity-track", "") // Empty attribute
      div.id = "myDiv"
      document.body.appendChild(div)

      initAutomaticClickTracking(mockTrackEventFn, mockLogFn)
      div.click()

      expect(mockTrackEventFn).toHaveBeenCalledWith(
        "Automatic Click",
        expect.any(Object)
      )
    })

    it("should include data-adtivity-props in properties", () => {
      const link = document.createElement("a")
      link.setAttribute("data-adtivity-track", "Nav Link Click")
      link.setAttribute(
        "data-adtivity-props",
        '{"category": "footer", "section": "legal"}'
      )
      link.href = "/terms"
      document.body.appendChild(link)

      initAutomaticClickTracking(mockTrackEventFn, mockLogFn)
      link.click()

      expect(mockTrackEventFn).toHaveBeenCalledWith(
        "Nav Link Click",
        expect.objectContaining({
          category: "footer",
          section: "legal",
          href: "/terms",
          elementType: "A",
        })
      )
    })

    it("should log error if data-adtivity-props is invalid JSON", () => {
      const button = document.createElement("button")
      button.setAttribute("data-adtivity-track", "Invalid Props")
      button.setAttribute("data-adtivity-props", "{invalid json}")
      document.body.appendChild(button)

      initAutomaticClickTracking(mockTrackEventFn, mockLogFn)
      button.click()

      expect(mockLogFn).toHaveBeenCalledWith(
        "error",
        expect.stringContaining("Failed to parse data-adtivity-props")
      )
      expect(mockTrackEventFn).toHaveBeenCalledTimes(1) // Still tracks the event, just without custom props
      expect(mockTrackEventFn).toHaveBeenCalledWith(
        "Invalid Props",
        expect.not.objectContaining({ category: "footer" })
      )
    })

    it("should not track click on elements without data-adtivity-track", () => {
      const button = document.createElement("button")
      button.id = "noTrackButton"
      document.body.appendChild(button)

      initAutomaticClickTracking(mockTrackEventFn, mockLogFn)
      button.click()

      expect(mockTrackEventFn).not.toHaveBeenCalled()
    })
  })
})

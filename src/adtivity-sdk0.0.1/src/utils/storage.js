// adtivity-sdk/src/utils/storage.js

const ANONYMOUS_ID_KEY = "adtivity_anonymous_id"
const SESSION_ID_KEY = "adtivity_session_id"

/**
 * Safely sets an item in localStorage.
 * Handles potential SecurityError if localStorage is unavailable (e.g., some sandboxed iframes).
 * @param {string} key - The key to store the data under.
 * @param {string} value - The string value to store.
 */
export function setLocalStorageItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.warn(`[Adtivity SDK] Failed to set localStorage item '${key}':`, e)
  }
}

/**
 * Safely gets an item from localStorage.
 * Handles potential errors.
 * @param {string} key - The key of the item to retrieve.
 * @returns {string|null} The stored value, or null if not found or an error occurred.
 */
export function getLocalStorageItem(key) {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.warn(`[Adtivity SDK] Failed to get localStorage item '${key}':`, e)
    return null
  }
}

/**
 * Safely removes an item from localStorage.
 * Handles potential errors.
 * @param {string} key - The key of the item to remove.
 */
export function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn(
      `[Adtivity SDK] Failed to remove localStorage item '${key}':`,
      e
    )
  }
}

/**
 * Generates or retrieves a unique anonymous ID from local storage.
 * @param {function(string, ...any): void} logger - The SDK's log function.
 * @returns {string} The anonymous ID.
 */
export function getAnonymousId(logger) {
  let anonymousId = getLocalStorageItem(ANONYMOUS_ID_KEY)
  if (!anonymousId) {
    // Generate a simple UUID-like string
    anonymousId =
      "anon_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    setLocalStorageItem(ANONYMOUS_ID_KEY, anonymousId)
    logger("debug", "Generated new anonymous ID:", anonymousId)
  }
  return anonymousId
}

/**
 * Generates or retrieves a unique session ID from session storage.
 * This ID is typically valid for the duration of the browser tab/session.
 * @param {function(string, ...any): void} logger - The SDK's log function.
 * @returns {string} The session ID.
 */
export function getSessionId(logger) {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    // Generate a simple session ID based on timestamp and random string
    sessionId =
      "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8)
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
    logger("debug", "Generated new session ID:", sessionId)
  }
  return sessionId
}

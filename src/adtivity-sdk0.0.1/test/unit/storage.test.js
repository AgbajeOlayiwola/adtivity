// adtivity-sdk/src/utils/storage.js

const LOCAL_STORAGE_PREFIX = "adtivity_sdk_"
const SESSION_ID_KEY = LOCAL_STORAGE_PREFIX + "session_id"
const ANONYMOUS_ID_KEY = LOCAL_STORAGE_PREFIX + "anonymous_id"
const SESSION_EXPIRATION_KEY = LOCAL_STORAGE_PREFIX + "session_expiration"
const SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Generates a simple unique ID.
 * @returns {string} A unique ID.
 */
function generateUniqueId() {
  return Date.now() + "_" + Math.random().toString(36).substring(2, 8)
}

/**
 * Sets an item in local storage.
 * @param {string} key - The key for the item.
 * @param {string} value - The value to store.
 * @param {function} logger - The logger function from the SDK instance.
 */
export function setLocalStorageItem(key, value, logger) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    logger && logger("error", `Failed to set local storage item '${key}':`, e)
  }
}

/**
 * Gets an item from local storage.
 * @param {string} key - The key for the item.
 * @param {function} logger - The logger function from the SDK instance.
 * @returns {string|null} The stored value or null if not found/error.
 */
export function getLocalStorageItem(key, logger) {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    logger && logger("error", `Failed to get local storage item '${key}':`, e)
    return null
  }
}

/**
 * Removes an item from local storage.
 * @param {string} key - The key for the item.
 * @param {function} logger - The logger function from the SDK instance.
 */
export function removeLocalStorageItem(key, logger) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    logger &&
      logger("error", `Failed to remove local storage item '${key}':`, e)
  }
}

/**
 * Gets or creates a session ID.
 * A new session ID is generated if the current one is expired or doesn't exist.
 * @param {function} logger - The logger function from the SDK instance.
 * @returns {string} The current or new session ID.
 */
export function getSessionId(logger) {
  const now = Date.now()
  let sessionId = getLocalStorageItem(SESSION_ID_KEY, logger)
  let sessionExpiration = parseInt(
    getLocalStorageItem(SESSION_EXPIRATION_KEY, logger) || "0",
    10
  )

  if (!sessionId || now > sessionExpiration) {
    sessionId = "sess_" + generateUniqueId()
    const newExpiration = now + SESSION_DURATION_MS
    setLocalStorageItem(SESSION_ID_KEY, sessionId, logger)
    setLocalStorageItem(
      SESSION_EXPIRATION_KEY,
      newExpiration.toString(),
      logger
    )
    logger("debug", "Generated new session ID:", sessionId)
  } else {
    // Extend session expiration on activity
    const newExpiration = now + SESSION_DURATION_MS
    setLocalStorageItem(
      SESSION_EXPIRATION_KEY,
      newExpiration.toString(),
      logger
    )
  }
  return sessionId
}

/**
 * Gets or creates an anonymous ID.
 * The anonymous ID persists across sessions.
 * @param {function} logger - The logger function from the SDK instance.
 * @returns {string} The current or new anonymous ID.
 */
export function getAnonymousId(logger) {
  let anonymousId = getLocalStorageItem(ANONYMOUS_ID_KEY, logger)
  if (!anonymousId) {
    anonymousId = "anon_" + generateUniqueId()
    setLocalStorageItem(ANONYMOUS_ID_KEY, anonymousId, logger)
    logger("debug", "Generated new anonymous ID:", anonymousId)
  }
  return anonymousId
}

// src/lib/adtivity-solana-sdk/utils.ts

/**
 * Generates a unique session ID.
 * Combines timestamp with a random string for better uniqueness.
 */
export function generateSessionId(): string {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `session_${Date.now()}_${randomPart}`;
}

/**
 * Sends data to the Adtivity backend using the Beacon API or Fetch API.
 * Prefers Beacon API for robustness during page unloads, falls back to Fetch.
 * @param endpoint The Adtivity API endpoint URL.
 * @param apiKey The API key for authentication.
 * @param data The event data to send (can be a single event or an array of events).
 */
export async function sendToBeacon(endpoint: string, apiKey: string, data: any | any[]): Promise<void> {
  const payload = JSON.stringify(data);
  
  // Try navigator.sendBeacon first if available and suitable (e.g. for single events or small batches)
  // Note: sendBeacon has limitations on data size and headers for cross-origin requests.
  // It's primarily for sending data during page unload. For regular batching, fetch might be better.
  // For simplicity, we will use fetch for now, which is more versatile.
  // If you want to ensure data is sent on page unload, you'd add specific logic for that
  // using sendBeacon with a smaller payload.

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Adtivity-ApiKey': apiKey,
      },
      body: payload,
      keepalive: true, // Important for requests that might outlive the page session (e.g., initiated from unload handlers)
    });

    if (!response.ok) {
      // Log more detailed error from response if possible
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        // ignore if can't read body
      }
      console.error(
        `Adtivity SDK: Failed to send data. Status: ${response.status}. Endpoint: ${endpoint}. Response: ${errorBody}`
      );
    } else {
      // console.log('Adtivity SDK: Data sent successfully via fetch.', data);
    }
  } catch (error) {
    console.error('Adtivity SDK: Error sending data via fetch.', error, 'Endpoint:', endpoint);
    // Implement more robust error handling here, e.g., retry logic with backoff,
    // or storing failed events to localStorage to retry later.
  }
}

/**
 * Utility to safely get navigator.userAgent to avoid issues in non-browser environments.
 */
export function getUserAgent(): string | undefined {
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return navigator.userAgent;
  }
  return undefined;
}

/**
 * Utility to safely get document.URL.
 */
export function getCurrentUrl(): string | undefined {
    if (typeof document !== 'undefined' && document.URL) {
        return document.URL;
    }
    return undefined;
}

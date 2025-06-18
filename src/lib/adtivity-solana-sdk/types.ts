// src/lib/adtivity-solana-sdk/types.ts

export interface AdtivitySDKConfig {
  apiKey: string; // API key for authenticating with Adtivity backend
  adtivityApiEndpoint?: string; // URL of the Adtivity backend API for sending events
  dAppId?: string; // Identifier for the dApp using the SDK (e.g., 'my-awesome-solana-game')
  debug?: boolean; // Enable extensive debug logging to the console
  batchSize?: number; // Number of events to batch before sending to the backend
  flushInterval?: number; // Maximum time in ms to wait before flushing the event queue
}

export interface WalletInfo {
  address: string; // Public key of the connected wallet
  type: string; // e.g., 'Phantom', 'Solflare', 'Backpack'
  connectedAt: Date; // Timestamp of when the wallet was connected
}

// Base structure for all events tracked by the SDK
export interface BaseEvent {
  eventType: string; // Discriminator for the event type
  sessionId: string; // Unique identifier for the user's session
  timestamp: string; // ISO 8601 timestamp of when the event occurred
  dAppId?: string; // Identifier of the dApp that generated the event
  walletAddress?: string; // Wallet address associated with the event, if available
  walletType?: string; // Type of wallet, if available
  // Add any other common fields, e.g., screenResolution, userAgent, locale etc.
  // userAgent?: string;
  // locale?: string;
  // currentUrl?: string;
}

// Specific event types
export interface WalletConnectedEvent extends BaseEvent {
  eventType: 'walletConnected';
  walletAddress: string; // Overridden to be non-optional
  walletType: string; // Overridden to be non-optional
}

export interface TransactionInfo extends BaseEvent {
  eventType: 'transactionSubmitted';
  signature: string; // Solana transaction signature
  associatedAccounts?: string[]; // Other accounts involved in the transaction, if known
}

export interface CustomEventPayload {
  [key: string]: any; // Flexible payload for custom events, can be nested
}

export interface CustomEvent extends BaseEvent {
  eventType: 'customEvent';
  eventName: string; // Name of the custom event, e.g., 'nft_minted', 'level_up'
  payload: CustomEventPayload; // Data associated with the custom event
}

// Union type for all possible events the SDK can handle
export type AdtivityEvent = WalletConnectedEvent | TransactionInfo | CustomEvent | BaseEvent;

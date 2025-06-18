// src/lib/adtivity-solana-sdk/AdtivitySolanaSDK.ts

import { type AdtivitySDKConfig, type CustomEventPayload, type WalletInfo, type TransactionInfo, type BaseEvent, type AdtivityEvent } from './types';
import { generateSessionId, sendToBeacon } from './utils';

export class AdtivitySolanaSDK {
  private config: AdtivitySDKConfig;
  private sessionId: string;
  private wallet: WalletInfo | null = null;
  private queue: AdtivityEvent[] = [];
  private flushInterval: number = 5000; // ms
  private flushTimerId: NodeJS.Timeout | null = null;

  constructor(config: AdtivitySDKConfig) {
    if (!config.apiKey) {
      throw new Error('Adtivity API Key is required.');
    }
    if (!config.adtivityApiEndpoint && config.debug !== true) {
      console.warn('Adtivity API endpoint not provided. SDK will log to console instead of sending data unless debug is explicitly true.');
    }
    this.config = {
        debug: false, // Default debug to false
        batchSize: 10, // Default batch size
        ...config
    };
    this.sessionId = generateSessionId();
    if(this.config.debug) {
        console.log(`Adtivity Solana SDK initialized. Session ID: ${this.sessionId}. Config:`, this.config);
    }
    this.startFlushTimer();
  }

  private async processEvent(eventData: AdtivityEvent): Promise<void> {
    if (this.config.debug) {
        console.log('Adtivity SDK: Processing event', eventData);
    }
    this.queue.push(eventData);

    if (this.config.adtivityApiEndpoint && this.queue.length >= (this.config.batchSize || 10)) {
      await this.flushQueue();
    }
  }

  private async flushQueue(): Promise<void> {
    if (!this.config.adtivityApiEndpoint || this.queue.length === 0) {
      return;
    }

    const itemsToFlush = [...this.queue];
    this.queue = []; // Clear queue immediately

    if(this.config.debug) {
        console.log(`Adtivity SDK: Flushing ${itemsToFlush.length} events to ${this.config.adtivityApiEndpoint}`);
    }

    try {
      await sendToBeacon(this.config.adtivityApiEndpoint, this.config.apiKey, itemsToFlush);
    } catch (error) {
      console.error('Adtivity SDK: Error flushing queue. Re-queuing events.', error);
      // Potentially re-queue items or implement more robust error handling/retry logic
      this.queue.unshift(...itemsToFlush);
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
    }
    this.flushTimerId = setInterval(() => {
      this.flushQueue();
    }, this.flushInterval);
  }

  public async trackWalletConnection(walletAddress: string, walletType: string): Promise<void> {
    this.wallet = { address: walletAddress, type: walletType, connectedAt: new Date() };
    const eventData: BaseEvent & { eventType: 'walletConnected'; walletAddress: string; walletType: string; } = {
      eventType: 'walletConnected',
      walletAddress,
      walletType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      dAppId: this.config.dAppId,
    };
    await this.processEvent(eventData);
  }

  public async trackTransactionSubmission(signature: string, associatedAccounts?: string[]): Promise<void> {
    if (!this.wallet) {
      console.warn('Adtivity SDK: Cannot track transaction without a connected wallet.');
      // Optionally, queue this event to be enriched later or send without wallet info
    }
    const eventData: TransactionInfo = {
      eventType: 'transactionSubmitted',
      signature,
      walletAddress: this.wallet?.address,
      walletType: this.wallet?.type,
      associatedAccounts: associatedAccounts || [],
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      dAppId: this.config.dAppId,
    };
    await this.processEvent(eventData);
  }

  public async trackCustomEvent(eventName: string, payload?: CustomEventPayload): Promise<void> {
    const eventData: BaseEvent & { eventType: 'customEvent'; eventName: string; payload: CustomEventPayload } = {
      eventType: 'customEvent',
      eventName,
      payload: payload || {},
      walletAddress: this.wallet?.address,
      walletType: this.wallet?.type,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      dAppId: this.config.dAppId,
    };
     await this.processEvent(eventData);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public updateDAppId(dAppId: string): void {
    this.config.dAppId = dAppId;
    if(this.config.debug) {
        console.log(`Adtivity SDK: dAppId updated to ${dAppId}`);
    }
  }

  public destroy(): void {
    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }
    // Attempt to flush any remaining events before destroying
    this.flushQueue();
    if(this.config.debug) {
        console.log('Adtivity Solana SDK destroyed.');
    }
  }
}

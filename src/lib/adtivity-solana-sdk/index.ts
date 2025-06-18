// src/lib/adtivity-solana-sdk/index.ts

export { AdtivitySolanaSDK } from './AdtivitySolanaSDK';
export * from './types';

// Optional: A global instance or a simpler init function for easier use
// This can be useful for dApp developers to quickly integrate.
// import { AdtivitySolanaSDK } from './AdtivitySolanaSDK';
// import type { AdtivitySDKConfig } from './types';

// let globalInstance: AdtivitySolanaSDK | null = null;

// export function initAdtivity(config: AdtivitySDKConfig): AdtivitySolanaSDK {
//   if (globalInstance) {
//     console.warn('Adtivity SDK already initialized. Returning existing instance.');
//     // Optionally, you could update the config of the existing instance or re-initialize.
//     // globalInstance.updateConfig(config); // Assuming an updateConfig method exists
//     return globalInstance;
//   }
//   globalInstance = new AdtivitySolanaSDK(config);
//   return globalInstance;
// }

// export function getAdtivityInstance(): AdtivitySolanaSDK | null {
//   if (!globalInstance) {
//     // It might be better to throw an error or return a no-op SDK if not initialized,
//     // rather than just logging an error, to make behavior more predictable.
//     console.error('Adtivity SDK not initialized. Call initAdtivity() first.');
//     // Example: return new NoOpAdtivitySolanaSDK();
//   }
//   return globalInstance;
// }

// // Example of a No-Op SDK for when the main SDK isn't initialized
// // class NoOpAdtivitySolanaSDK {
// //   constructor() { if (config?.debug) console.log("Adtivity SDK: Operating in No-Op mode."); }
// //   async trackWalletConnection(..._args: any[]): Promise<void> {}
// //   async trackTransactionSubmission(..._args: any[]): Promise<void> {}
// //   async trackCustomEvent(..._args: any[]): Promise<void> {}
// //   getSessionId(): string { return "no-op-session"; }
// //   updateDAppId(..._args: any[]): void {}
// //   destroy(): void {}
// // }

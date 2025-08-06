# Adtivity Solana SDK

Official JavaScript/TypeScript SDK for tracking analytics in Solana dApps.

## Installation

```bash
npm install adtivity-solana-sdk
# or
yarn add adtivity-solana-sdk
```

## Usage

```javascript
import AdtivitySDK from 'adtivity-solana-sdk';

// Initialize with your API key
const adtivity = new AdtivitySDK('YOUR_API_KEY', {
  debug: true, // Enable console logging
  endpoint: 'https://your-custom-endpoint.com', // Optional
});

// Track custom events
adtivity.trackEvent('nft_minted', {
  collection: 'Cool Cats',
  mint_price: 1.5,
});

// Monitor transactions
async function mintNFT() {
  const transaction = await createMintTransaction();
  const signature = await adtivity.monitorTransaction(
    window.solana.sendTransaction(transaction)
  );
  return signature;
}
```

## API Reference

### `new AdtivitySDK(apiKey: string, options?: SDKOptions)`

Initialize the SDK with your API key.

Options:
- `endpoint`: string - Custom API endpoint (default: `https://api.adtivity.io/v1/track`)
- `debug`: boolean - Enable debug logging (default: `false`)
- `autoTrackTransactions`: boolean - Automatically track transactions (default: `true`)
- `obfuscateWallet`: boolean - Obfuscate wallet addresses (default: `true`)

### `trackEvent(eventType: string, properties?: Record<string, any>)`

Track custom events with optional properties.

### `monitorTransaction(transactionPromise: Promise<string>): Promise<string>`

Monitor a transaction and automatically track success/failure.

## License

MIT
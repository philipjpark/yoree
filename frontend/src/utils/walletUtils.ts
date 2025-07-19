// Wallet utilities for YOREE platform
export const WALLET_CONFIG = {
  // Masked wallet address for philxdaegu
  PHILXDAEGU_ADDRESS: "0x0aaa246300e261c6801b8c62397090deb47310ba",
  PHILXDAEGU_DISPLAY: "philxdaegu.eth",
  PHILXDAEGU_MASKED: "0x0aaa...10ba"
};

// Function to mask wallet addresses
export function maskAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Function to get display name for wallet
export function getWalletDisplay(address: string): string {
  if (address.toLowerCase() === WALLET_CONFIG.PHILXDAEGU_ADDRESS.toLowerCase()) {
    return WALLET_CONFIG.PHILXDAEGU_DISPLAY;
  }
  return maskAddress(address);
}

// Function to check if address is philxdaegu
export function isPhilxdaegu(address: string): boolean {
  return address.toLowerCase() === WALLET_CONFIG.PHILXDAEGU_ADDRESS.toLowerCase();
} 
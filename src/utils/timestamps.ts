/**
 * Precision Epoch and Timestamp Conversion Utilities
 */
export const CHROMIUM_EPOCH_OFFSET_US = 11644473600000000n;
export const COCOA_EPOCH_OFFSET_SEC = 978307200;

export function chromiumTimeToUnixMs(chromiumUs: number | string | bigint): number {
  try {
    const usBig = BigInt(chromiumUs);
    if (usBig <= 0n) return 0;
    const unixUs = usBig - CHROMIUM_EPOCH_OFFSET_US;
    return Number(unixUs / 1000n);
  } catch {
    return 0;
  }
}

export function unixMsToChromiumTime(unixMs: number): string {
  if (!unixMs || unixMs <= 0) return '0';
  const usBig = BigInt(Math.floor(unixMs)) * 1000n + CHROMIUM_EPOCH_OFFSET_US;
  return usBig.toString();
}

export function cocoaTimeToUnixMs(cocoaSec: number): number {
  if (!cocoaSec || isNaN(cocoaSec)) return 0;
  return Math.round((cocoaSec + COCOA_EPOCH_OFFSET_SEC) * 1000);
}

export function unixMsToCocoaTime(unixMs: number): number {
  if (!unixMs || unixMs <= 0) return 0;
  return (unixMs / 1000) - COCOA_EPOCH_OFFSET_SEC;
}

export function firefoxPrTimeToUnixMs(prTime: number | string | bigint): number {
  try {
    const us = BigInt(prTime);
    return Number(us / 1000n);
  } catch {
    return 0;
  }
}

export function unixMsToFirefoxPrTime(unixMs: number): number {
  return Math.round(unixMs * 1000);
}

export function formatTimestamp(unixMs: number): string {
  if (!unixMs || unixMs <= 0) return 'Never';
  const d = new Date(unixMs);
  return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString();
}

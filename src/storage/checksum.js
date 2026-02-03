// Checksum helpers for campaign payload integrity.
export const computeChecksum = async (payloadString) => {
  if (globalThis.crypto?.subtle?.digest) {
    const data = new TextEncoder().encode(payloadString);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  return fallbackHash(payloadString);
};

const fallbackHash = (payloadString) => {
  let hash = 0;
  for (let i = 0; i < payloadString.length; i += 1) {
    hash = (hash << 5) - hash + payloadString.charCodeAt(i);
    hash |= 0;
  }
  return `fallback-${Math.abs(hash)}`;
};

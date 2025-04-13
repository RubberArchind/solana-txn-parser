import { PublicKey } from "@solana/web3.js";

export function serializePublicKeys(obj: any): any {
  // Direct PublicKey instance
  if (obj instanceof PublicKey) {
    return obj.toBase58();
  }

  // Object that "looks like" PublicKey (manual)
  if (
    obj &&
    typeof obj === "object" &&
    "_bn" in obj &&
    typeof obj.toBase58 === "function"
  ) {
    return obj.toBase58();
  }

  // Recursively handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializePublicKeys);
  }

  // Recursively handle plain objects
  if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serializePublicKeys(obj[key]);
    }
    return newObj;
  }

  // Everything else stays the same
  return obj;
}

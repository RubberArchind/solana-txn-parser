"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePublicKeys = serializePublicKeys;
const web3_js_1 = require("@solana/web3.js");
function serializePublicKeys(obj) {
    // Direct PublicKey instance
    if (obj instanceof web3_js_1.PublicKey) {
        return obj.toBase58();
    }
    // Object that "looks like" PublicKey (manual)
    if (obj &&
        typeof obj === "object" &&
        "_bn" in obj &&
        typeof obj.toBase58 === "function") {
        return obj.toBase58();
    }
    // Recursively handle arrays
    if (Array.isArray(obj)) {
        return obj.map(serializePublicKeys);
    }
    // Recursively handle plain objects
    if (obj && typeof obj === "object") {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = serializePublicKeys(obj[key]);
        }
        return newObj;
    }
    // Everything else stays the same
    return obj;
}
//# sourceMappingURL=serialize.js.map
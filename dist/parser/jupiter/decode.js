"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeInstruction = deserializeInstruction;
const anchor_1 = require("@coral-xyz/anchor");
function deserializeInstruction(instruction, idl) {
    try {
        const coder = new anchor_1.BorshCoder(idl);
        const decoded = coder.instruction.decode(instruction.data);
        return decoded ? { name: decoded.name, data: decoded.data } : null;
    }
    catch (err) {
        console.warn("Jupiter decode error:", err);
        return null;
    }
}
//# sourceMappingURL=decode.js.map
import { Idl, BorshCoder } from "@coral-xyz/anchor";
import { TransactionInstruction } from "@solana/web3.js";

export function deserializeInstruction(
    instruction: TransactionInstruction,
    idl: Idl
): { name: string; data: any } | null {
    try {
        const coder = new BorshCoder(idl);
        const decoded = coder.instruction.decode(instruction.data);
        return decoded ? { name: decoded.name, data: decoded.data } : null;
    } catch (err) {
        console.warn("Jupiter decode error:", err);
        return null;
    }
}

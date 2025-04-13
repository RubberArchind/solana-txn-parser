import { Idl } from "@coral-xyz/anchor";
import { TransactionInstruction } from "@solana/web3.js";
export declare function deserializeInstruction(instruction: TransactionInstruction, idl: Idl): {
    name: string;
    data: any;
} | null;
//# sourceMappingURL=decode.d.ts.map
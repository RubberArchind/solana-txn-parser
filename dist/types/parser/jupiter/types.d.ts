import { BaseParsedAction, BaseParsedTransaction } from "../../core/base";
import { PublicKey } from "@solana/web3.js";
export interface JupiterAction extends BaseParsedAction {
    info: {
        user: PublicKey;
        timestamp: string;
        tokenIn: PublicKey;
        tokenOut: PublicKey;
        amountIn: bigint;
        amountOut: bigint;
        inAmountInDecimal: number;
        outAmountInDecimal: number;
    };
}
export interface JupiterTransaction extends BaseParsedTransaction<JupiterAction> {
    actions: JupiterAction[];
}
//# sourceMappingURL=types.d.ts.map
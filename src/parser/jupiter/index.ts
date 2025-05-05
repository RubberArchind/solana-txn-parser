import {
    ParsedTransactionWithMeta,
    Connection,
    PublicKey,
} from "@solana/web3.js";
import { AsyncBaseParser } from "../../core/base";
import { serializePublicKeys } from "../../utils/serialize";
import { JupiterTransaction, JupiterAction } from "./types";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { extract } from "@jup-ag/instruction-parser";

export class JupiterParser implements AsyncBaseParser<JupiterTransaction> {
    private tokenMap: Map<string, TokenInfo> = new Map();

    constructor(private connection: Connection) { }

    private async initTokenMap() {
        if (this.tokenMap.size > 0) return;
        const tokenList = await new TokenListProvider().resolve();
        const tokens = tokenList.filterByChainId(101).getList(); // Mainnet-Beta
        this.tokenMap = new Map(tokens.map((t) => [t.address, t]));
    }

    async parse(tx: ParsedTransactionWithMeta): Promise<JupiterTransaction | null> {
        if (!tx) return null;
        await this.initTokenMap();

        try {
            const result = await extract(
                tx.transaction.signatures[0],
                this.connection,
                tx
            );

            if (!result) return null;

            const inputTokenInfo = this.tokenMap.get(result.inMint);
            const outputTokenInfo = this.tokenMap.get(result.outMint);

            const inSymbol = inputTokenInfo?.symbol ?? null;
            const outSymbol = outputTokenInfo?.symbol ?? null;

            const inDecimals = inputTokenInfo?.decimals ?? 0;
            const outDecimals = outputTokenInfo?.decimals ?? 0;

            const amountIn = BigInt(result.inAmount?.toString() ?? "0");
            const amountOut = BigInt(result.outAmount?.toString() ?? "0");

            const actions: JupiterAction[] = [
                {
                    type: "swap",
                    info: {
                        user: new PublicKey(result.owner),
                        timestamp: tx.blockTime
                            ? new Date(tx.blockTime * 1000).toISOString()
                            : new Date(0).toISOString(),
                        tokenIn: new PublicKey(result.inMint),
                        tokenOut: new PublicKey(result.outMint),
                        amountIn,
                        amountOut,
                        inAmountInDecimal: Number(amountIn) / 10 ** inDecimals,
                        outAmountInDecimal: Number(amountOut) / 10 ** outDecimals,
                    },
                },
            ];

            return serializePublicKeys({
                platform: "jupiter",
                actions,
            });
        } catch (err) {
            console.error("Jupiter extract error:", err);
            return null;
        }
    }

    async parseMultiple(txns: ParsedTransactionWithMeta[]): Promise<JupiterTransaction[] | null> {
        const results = await Promise.all(txns.map((tx) => this.parse(tx)));
        return results.filter((r): r is JupiterTransaction => r !== null);
    }
}

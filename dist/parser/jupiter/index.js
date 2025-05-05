"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterParser = void 0;
const web3_js_1 = require("@solana/web3.js");
const serialize_1 = require("../../utils/serialize");
const spl_token_registry_1 = require("@solana/spl-token-registry");
const instruction_parser_1 = require("@jup-ag/instruction-parser");
class JupiterParser {
    constructor(connection) {
        this.connection = connection;
        this.tokenMap = new Map();
    }
    async initTokenMap() {
        if (this.tokenMap.size > 0)
            return;
        const tokenList = await new spl_token_registry_1.TokenListProvider().resolve();
        const tokens = tokenList.filterByChainId(101).getList(); // Mainnet-Beta
        this.tokenMap = new Map(tokens.map((t) => [t.address, t]));
    }
    async parse(tx) {
        if (!tx)
            return null;
        await this.initTokenMap();
        try {
            const result = await (0, instruction_parser_1.extract)(tx.transaction.signatures[0], this.connection, tx);
            if (!result)
                return null;
            const inputTokenInfo = this.tokenMap.get(result.inMint);
            const outputTokenInfo = this.tokenMap.get(result.outMint);
            const inSymbol = inputTokenInfo?.symbol ?? null;
            const outSymbol = outputTokenInfo?.symbol ?? null;
            const inDecimals = inputTokenInfo?.decimals ?? 0;
            const outDecimals = outputTokenInfo?.decimals ?? 0;
            const amountIn = BigInt(result.inAmount?.toString() ?? "0");
            const amountOut = BigInt(result.outAmount?.toString() ?? "0");
            const actions = [
                {
                    type: "swap",
                    info: {
                        user: new web3_js_1.PublicKey(result.owner),
                        timestamp: tx.blockTime
                            ? new Date(tx.blockTime * 1000).toISOString()
                            : new Date(0).toISOString(),
                        tokenIn: new web3_js_1.PublicKey(result.inMint),
                        tokenOut: new web3_js_1.PublicKey(result.outMint),
                        amountIn,
                        amountOut,
                        inAmountInDecimal: Number(amountIn) / 10 ** inDecimals,
                        outAmountInDecimal: Number(amountOut) / 10 ** outDecimals,
                    },
                },
            ];
            return (0, serialize_1.serializePublicKeys)({
                platform: "jupiter",
                actions,
            });
        }
        catch (err) {
            console.error("Jupiter extract error:", err);
            return null;
        }
    }
    async parseMultiple(txns) {
        const results = await Promise.all(txns.map((tx) => this.parse(tx)));
        return results.filter((r) => r !== null);
    }
}
exports.JupiterParser = JupiterParser;
//# sourceMappingURL=index.js.map
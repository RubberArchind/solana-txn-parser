"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumV4Parser = void 0;
const web3_js_1 = require("@solana/web3.js");
const lru_1 = require("../../../core/lru");
const types_1 = require("./types");
const layout_1 = require("./layout");
const utils_1 = require("../../../core/utils");
class RaydiumV4Parser {
    constructor(rpcConnection, options) {
        this.connection = rpcConnection;
        this.poolInfoCache = new lru_1.LRUCache(options.maxPoolCache || 100);
    }
    getRayLogs(transaction) {
        return transaction.meta?.logMessages?.filter((msg) => msg.includes('ray_log'));
    }
    decodeRayLog(msg) {
        const logData = msg.match(/^Program log: ray_log: (.+)$/)?.[1] ?? msg;
        const logBuffer = Buffer.from(logData, 'base64');
        const logType = logBuffer.slice(0, 1).readInt8();
        const dataBuffer = logBuffer.slice(1);
        switch (logType) {
            case types_1.INIT_LOG_TYPE:
                return { ...layout_1.INIT_POOL_LAYOUT.decode(dataBuffer), logType };
            case types_1.DEPOSIT_LOG_TYPE:
                return { ...layout_1.DEPOSIT_LAYOUT.decode(dataBuffer), logType };
            case types_1.WITHDRAW_LOG_TYPE:
                return { ...layout_1.WITHDRAW_LAYOUT.decode(dataBuffer), logType };
            case types_1.SWAP_BASE_IN_LOG_TYPE:
                return { ...layout_1.SWAP_BASE_IN_LAYOUT.decode(dataBuffer), logType };
            case types_1.SWAP_BASE_OUT_LOG_TYPE:
                return { ...layout_1.SWAP_BASE_OUT_LAYOUT.decode(dataBuffer), logType };
            default:
                return null;
        }
    }
    async getPoolInfo(poolId) {
        const info = this.poolInfoCache.get(poolId);
        if (info)
            return info;
        const poolInfo = await this.connection.getAccountInfo(new web3_js_1.PublicKey(poolId));
        if (!poolInfo)
            return null;
        const parsedInfo = layout_1.RAY_AMM_V4_POOL_LAYOUT.decode(poolInfo.data);
        this.poolInfoCache.set(poolId, {
            baseMint: parsedInfo.baseMint,
            quoteMint: parsedInfo.quoteMint,
            baseDecimal: parsedInfo.baseDecimal,
            quoteDecimal: parsedInfo.quoteDecimal,
        });
        return parsedInfo;
    }
    async handleSwap(parsedLog, instruction) {
        const poolId = instruction.accounts[1];
        const user = instruction.accounts[instruction.accounts.length - 1];
        const poolInfo = await this.getPoolInfo(poolId.toString());
        if (!poolInfo)
            return null;
        switch (parsedLog.logType) {
            case types_1.SWAP_BASE_IN_LOG_TYPE:
                return {
                    type: types_1.ActionType.SWAP,
                    info: {
                        amountIn: parsedLog.amountIn,
                        amountOut: parsedLog.amountOut,
                        baseReserve: parsedLog.baseReserve,
                        quoteReserve: parsedLog.quoteReserve,
                        tokenIn: parsedLog.direction == 1n ? poolInfo.quoteMint : poolInfo.baseMint,
                        tokenInDecimal: parsedLog.direction == 1n
                            ? poolInfo.quoteDecimal
                            : poolInfo.baseDecimal,
                        tokenOut: parsedLog.direction == 1n ? poolInfo.baseMint : poolInfo.quoteMint,
                        tokenOutDecimal: parsedLog.direction == 1n
                            ? poolInfo.baseDecimal
                            : poolInfo.quoteDecimal,
                        user,
                        poolId,
                    },
                };
            default:
                return {
                    type: types_1.ActionType.SWAP,
                    info: {
                        amountIn: parsedLog.amountIn,
                        amountOut: parsedLog.amountOut,
                        baseReserve: parsedLog.baseReserve,
                        quoteReserve: parsedLog.quoteReserve,
                        tokenIn: poolInfo.quoteMint,
                        tokenInDecimal: poolInfo.quoteDecimal,
                        tokenOut: poolInfo.baseMint,
                        tokenOutDecimal: poolInfo.baseDecimal,
                        user,
                        poolId,
                    },
                };
        }
    }
    handleCreatePool(parsedLog, instruction) {
        return {
            type: types_1.ActionType.CREATE,
            info: {
                baseDecimals: parsedLog.baseDecimals,
                quoteDecimals: parsedLog.quoteDecimals,
                timestamp: parsedLog.timestamp,
                baseAmountIn: parsedLog.baseAmountIn,
                quoteAmountIn: parsedLog.quoteAmountIn,
                baseMint: instruction.accounts[8],
                quoteMint: instruction.accounts[9],
                marketId: parsedLog.marketId,
                user: instruction.accounts[17],
                poolId: instruction.accounts[4],
            },
        };
    }
    async handleDeposit(parsedLog, instruction) {
        const poolId = instruction.accounts[1];
        const user = instruction.accounts[12];
        const poolInfo = await this.getPoolInfo(poolId.toString());
        if (!poolInfo)
            return null;
        return {
            type: types_1.ActionType.ADD,
            info: {
                user,
                poolId,
                baseMint: poolInfo.baseMint,
                quoteMint: poolInfo.quoteMint,
                baseDecimal: poolInfo.baseDecimal,
                quoteDecimal: poolInfo.quoteDecimal,
                baseAmountIn: parsedLog.baseAmountIn,
                quoteAmountIn: parsedLog.quoteAmountIn,
                mintedLpAmount: parsedLog.mintedLpAmount,
            },
        };
    }
    async handleWithdraw(parsedLog, instruction) {
        const poolId = instruction.accounts[1];
        const user = instruction.accounts[18];
        const poolInfo = await this.getPoolInfo(poolId.toString());
        if (!poolInfo)
            return null;
        return {
            type: types_1.ActionType.REMOVE,
            info: {
                lpAmountOut: parsedLog.withdrawLpAmount,
                poolLpAmount: parsedLog.poolLpAmount,
                baseReserve: parsedLog.baseReserve,
                quoteReserve: parsedLog.quoteReserve,
                baseAmountOut: parsedLog.baseAmountOut,
                quoteAmountOut: parsedLog.quoteAmountOut,
                baseMint: poolInfo.baseMint,
                quoteMint: poolInfo.quoteMint,
                baseDecimal: poolInfo.baseDecimal,
                quoteDecimal: poolInfo.quoteDecimal,
                user,
                poolId,
            },
        };
    }
    async parse(transaction) {
        const logs = this.getRayLogs(transaction);
        if (!logs) {
            return null;
        }
        const decodedLogs = logs.map((msg) => this.decodeRayLog(msg));
        const instructions = (0, utils_1.flattenTransactionInstructions)(transaction).filter((ix) => ix.programId.toString() === types_1.RayV4Program.toString());
        if (instructions.length == 0)
            return null;
        const result = {
            platform: 'raydiumv4',
            actions: [],
        };
        for (let i = 0; i < decodedLogs.length; i++) {
            let ixLog = decodedLogs[i];
            let ix = instructions[i];
            let action;
            if (!ixLog)
                continue;
            switch (ixLog.logType) {
                case types_1.SWAP_BASE_IN_LOG_TYPE:
                    action = await this.handleSwap(ixLog, ix);
                    if (!action)
                        continue;
                    result.actions.push(action);
                    break;
                case types_1.SWAP_BASE_OUT_LOG_TYPE:
                    action = await this.handleSwap(ixLog, ix);
                    if (!action)
                        continue;
                    result.actions.push(action);
                    break;
                case types_1.INIT_LOG_TYPE:
                    result.actions.push(this.handleCreatePool(ixLog, ix));
                    break;
                case types_1.WITHDRAW_LOG_TYPE:
                    action = await this.handleWithdraw(ixLog, ix);
                    if (!action)
                        continue;
                    result.actions.push(action);
                    break;
                case types_1.DEPOSIT_LOG_TYPE:
                    action = await this.handleDeposit(ixLog, ix);
                    if (!action)
                        continue;
                    result.actions.push(action);
                    break;
                default:
                    continue;
            }
        }
        return result;
    }
    async parseMultiple(transactions) {
        return (await Promise.all(transactions.map(async (txn) => {
            return await this.parse(txn);
        }))).filter((res) => res !== null);
    }
}
exports.RaydiumV4Parser = RaydiumV4Parser;
//# sourceMappingURL=parser.js.map
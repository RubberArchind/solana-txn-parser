import { PublicKey } from "@solana/web3.js";
export declare const JUPITER_PROGRAM_ID: PublicKey;
export declare const jupiterIdl: {
    readonly version: "0.1.0";
    readonly name: "jupiter";
    readonly instructions: readonly [{
        readonly name: "route";
        readonly docs: readonly ["route_plan Topologically sorted trade DAG"];
        readonly accounts: readonly [{
            readonly name: "tokenProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "userTransferAuthority";
            readonly isMut: false;
            readonly isSigner: true;
        }, {
            readonly name: "userSourceTokenAccount";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "userDestinationTokenAccount";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "destinationMint";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "eventAuthority";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "program";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "routePlan";
            readonly type: {
                readonly vec: {
                    readonly defined: "RoutePlanStep";
                };
            };
        }, {
            readonly name: "inAmount";
            readonly type: "u64";
        }, {
            readonly name: "quotedOutAmount";
            readonly type: "u64";
        }, {
            readonly name: "slippageBps";
            readonly type: "u16";
        }, {
            readonly name: "platformFeeBps";
            readonly type: "u8";
        }];
        readonly returns: "u64";
    }];
    readonly types: readonly [{
        readonly name: "RoutePlanStep";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "percent";
                readonly type: "u8";
            }, {
                readonly name: "inputIndex";
                readonly type: "u8";
            }, {
                readonly name: "outputIndex";
                readonly type: "u8";
            }, {
                readonly name: "swap";
                readonly type: {
                    readonly defined: "Swap";
                };
            }];
        };
    }, {
        readonly name: "Swap";
        readonly type: {
            readonly kind: "enum";
            readonly variants: readonly [{
                readonly name: "Raydium";
            }, {
                readonly name: "PumpdotfunAmmBuy";
            }, {
                readonly name: "PumpdotfunAmmSell";
            }];
        };
    }];
};
//# sourceMappingURL=idl.d.ts.map
// Auto-generated Jupiter IDL for Pump.fun AMM parsing

import { PublicKey } from "@solana/web3.js";

export const JUPITER_PROGRAM_ID = new PublicKey(
    "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"
);

export const jupiterIdl = {
    version: "0.1.0",
    name: "jupiter",
    instructions: [
        {
            name: "route",
            docs: ["route_plan Topologically sorted trade DAG"],
            accounts: [
                { name: "tokenProgram", isMut: false, isSigner: false },
                { name: "userTransferAuthority", isMut: false, isSigner: true },
                { name: "userSourceTokenAccount", isMut: true, isSigner: false },
                { name: "userDestinationTokenAccount", isMut: true, isSigner: false },
                { name: "destinationMint", isMut: false, isSigner: false },
                { name: "eventAuthority", isMut: false, isSigner: false },
                { name: "program", isMut: false, isSigner: false }
            ],
            args: [
                {
                    name: "routePlan",
                    type: {
                        vec: {
                            defined: "RoutePlanStep"
                        }
                    }
                },
                { name: "inAmount", type: "u64" },
                { name: "quotedOutAmount", type: "u64" },
                { name: "slippageBps", type: "u16" },
                { name: "platformFeeBps", type: "u8" }
            ],
            returns: "u64"
        }
    ],
    types: [
        {
            name: "RoutePlanStep",
            type: {
                kind: "struct",
                fields: [
                    { name: "percent", type: "u8" },
                    { name: "inputIndex", type: "u8" },
                    { name: "outputIndex", type: "u8" },
                    { name: "swap", type: { defined: "Swap" } }
                ]
            }
        },
        {
            name: "Swap",
            type: {
                kind: "enum",
                variants: [
                    { name: "Raydium" },
                    { name: "PumpdotfunAmmBuy" },
                    { name: "PumpdotfunAmmSell" }
                ]
            }
        }
    ]
} as const;

import { PublicKey } from "@solana/web3.js";

export const JUPITER_PROGRAM_ID = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

export const jupiterIdl = {
    version: "0.1.0",
    name: "jupiter",
    instructions: [
        {
            name: "route",
            accounts: [
                { name: "tokenProgram", mut: false, signer: false },
                { name: "userTransferAuthority", mut: false, signer: true },
                { name: "userSourceTokenAccount", mut: true, signer: false },
                { name: "userDestinationTokenAccount", mut: true, signer: false },
                { name: "destinationTokenAccount", mut: true, signer: false },
                { name: "destinationMint", mut: false, signer: false },
                { name: "platformFeeAccount", mut: true, signer: false },
            ],
            args: [
                { name: "routePlan", type: { vec: { defined: "RoutePlanStep" } } },
                { name: "inAmount", type: "u64" },
                { name: "quotedOutAmount", type: "u64" },
                { name: "slippageBps", type: "u16" },
                { name: "platformFeeBps", type: "u8" },
            ],
            returns: "u64",
        },
        {
            name: "exactOutRoute",
            accounts: [
                { name: "tokenProgram", mut: false, signer: false },
                { name: "userTransferAuthority", mut: false, signer: true },
                { name: "userSourceTokenAccount", mut: true, signer: false },
                { name: "userDestinationTokenAccount", mut: true, signer: false },
                { name: "destinationTokenAccount", mut: true, signer: false },
                { name: "sourceMint", mut: false, signer: false },
                { name: "destinationMint", mut: false, signer: false },
                { name: "platformFeeAccount", mut: true, signer: false },
            ],
            args: [
                { name: "routePlan", type: { vec: { defined: "RoutePlanStep" } } },
                { name: "outAmount", type: "u64" },
                { name: "quotedInAmount", type: "u64" },
                { name: "slippageBps", type: "u16" },
                { name: "platformFeeBps", type: "u8" },
            ],
            returns: "u64",
        },
    ],
    accounts: [],
    types: [
        {
            name: "RoutePlanStep",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "swap",
                        type: {
                            defined: "Swap",
                        },
                    },
                    {
                        name: "percent",
                        type: "u8",
                    },
                    {
                        name: "inputIndex",
                        type: "u8",
                    },
                    {
                        name: "outputIndex",
                        type: "u8",
                    },
                ],
            },
        },
        {
            name: "Swap",
            type: {
                kind: "enum",
                variants: [
                    { name: "Raydium" },
                    { name: "Saber" },
                    { name: "Mercurial" },
                    { name: "Step" },
                    { name: "TokenSwap" },
                    { name: "Sencha" },
                ],
            },
        },
    ],
} as any;

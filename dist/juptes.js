"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jupiter_1 = require("./parser/jupiter"); // adjust the import path
const web3_js_1 = require("@solana/web3.js");
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("mainnet-beta"));
const parser = new jupiter_1.JupiterParser(connection);
const txSig = "369ukiJrjH47bKYAtX2jogX5N754yon3D9W8nmKsG8j76WHdhkMrL3CXdjZBLrFrDThF8JZYpLVe6xmwrRFG2Awo";
(async () => {
    const tx = await connection.getParsedTransaction(txSig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (!tx) {
        console.log("Transaction not found.");
        return;
    }
    const result = await parser.parse(tx);
    console.dir(result, { depth: null });
})();
//# sourceMappingURL=juptes.js.map
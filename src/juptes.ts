import { JupiterParser } from "./parser/jupiter"; // adjust the import path
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"));
const parser = new JupiterParser(connection);

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

import { JupiterParser } from "./parser/jupiter"; // adjust the import path
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"));
const parser = new JupiterParser(connection);

const txSig = "9nyvDgS5u1BnTnHNb9X1TTbz75efi328BXHC38BTcm9EStuCN9A3cotBBGk7MEST8agWW733u7u4bWDsVLpKKSs";

(async () => {
    const tx = await connection.getParsedTransaction(txSig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    // const tx2 = await connection.getParsedTransaction("3uAq9zTpUyn6zieBoLaBz9QDC5NJYmL6ev25c4L6bYNW45uUGRyHQHXhZ6UvmqojcRUxw21dF4ZZBbR7nQeLr6Ts", { commitment: "confirmed", maxSupportedTransactionVersion: 0 });

    if (!tx) {
        console.log("Transaction not found.");
        return;
    }

    const result = await parser.parse(tx);
    console.dir(result, { depth: null });
})();

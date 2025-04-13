import { ParsedTransactionWithMeta, Connection } from "@solana/web3.js";
import { AsyncBaseParser } from "../../core/base";
import { JupiterTransaction } from "./types";
export declare class JupiterParser implements AsyncBaseParser<JupiterTransaction> {
    private connection;
    private tokenMap;
    constructor(connection: Connection);
    private initTokenMap;
    parse(tx: ParsedTransactionWithMeta): Promise<JupiterTransaction | null>;
    parseMultiple(txns: ParsedTransactionWithMeta[]): Promise<JupiterTransaction[] | null>;
}
//# sourceMappingURL=index.d.ts.map
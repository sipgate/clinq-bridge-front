import * as redis from "redis";
import { promisify } from "util";
import { log } from "./logging";
import { IKeyValueStore } from "./models";

export class RedisKeyValueStore implements IKeyValueStore {
    private client;
    private ttlSeconds: number;
    private rdel;
    private rget;
    private rset;

    constructor(url: string, ttlSeconds: number) {
        const client = redis.createClient({
            url,
        });

        this.client = client;
        this.ttlSeconds = ttlSeconds;
        this.rdel = promisify(client.del).bind(client);
        this.rget = promisify(client.get).bind(client);
        this.rset = promisify(client.set).bind(client);

        client.on("error", (error) => {
            log.warn("Redis Error", { error });
        });
    }

    public async get(k): Promise<any> {
        const jsonk = JSON.stringify(k);

        const jsonv = await this.rget(jsonk);

        if (jsonv) {
            return JSON.parse(jsonv);
        } else {
            return undefined;
        }
    }

    public async delete(k): Promise<any> {
        const jsonk = JSON.stringify(k);

        return this.rdel(jsonk);
    }

    public async set(k, v): Promise<any> {
        const jsonk = JSON.stringify(k);
        const jsonv = JSON.stringify(v);

        if (this.ttlSeconds) {
            return this.rset(jsonk, jsonv, "EX", this.ttlSeconds);
        } else {
            return this.rset(jsonk, jsonv);
        }
    }
}

import { IKeyValueStore } from "./models";

interface ICacheItem {
    timestamp: number;
    data: any;
}

export class Cache {
    private kvstore: IKeyValueStore;
    private ttlSeconds: number;

    constructor(kvstore: IKeyValueStore, ttlSeconds: number) {
        this.kvstore = kvstore;
        this.ttlSeconds = ttlSeconds;
    }

    public async get(key) {
        return this.kvstore.get(key);
    }

    public async put(key, value) {
        return this.kvstore.set(key, value);
    }
}

import { IKeyValueStore } from "./models";

interface ICacheItem {
    timestamp: number;
    value: any;
}

export class Cache {
    private kvstore: IKeyValueStore;
    private ttlSeconds: number;

    constructor(kvstore: IKeyValueStore, ttlSeconds: number) {
        this.kvstore = kvstore;
        this.ttlSeconds = ttlSeconds;
    }

    public async get(key) {
        const isExpired = (item: ICacheItem): boolean =>
            (Date.now() - item.timestamp) / 1000 > this.ttlSeconds;

        const cacheItem: ICacheItem = await this.kvstore.get(key);

        let resultValue;
        if (cacheItem) {
            if (!isExpired(cacheItem)) {
                resultValue = cacheItem.value;
            } else {
                await this.kvstore.delete(key);
            }
        }

        return resultValue;
    }

    public async put(key, value) {
        const cacheItem: ICacheItem = {
            timestamp: Date.now(),
            value,
        };

        await this.kvstore.set(key, cacheItem);

        return cacheItem;
    }
}

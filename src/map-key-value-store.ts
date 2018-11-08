import { IKeyValueStore } from "./models";

export class MapKeyValueStore implements IKeyValueStore {
    private map: Map<any, any>;

    constructor() {
        this.map = new Map<any, any>();
    }

    public async get(k) {
        return this.map.get(k);
    }

    public async delete(k) {
        return this.map.delete(k);
    }

    public async set(k, v) {
        return this.map.set(k, v);
    }
}

export interface IKeyValueStore {
    get: (k) => Promise<any>;
    delete: (k) => Promise<any>;
    set: (k, v) => Promise<any>;
}

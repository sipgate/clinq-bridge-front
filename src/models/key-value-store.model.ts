export interface IKeyValueStore {
    get: (k) => Promise;
    delete: (k) => Promise;
    set: (k, v) => Promise;
}

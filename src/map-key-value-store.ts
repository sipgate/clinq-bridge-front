import { IKeyValueStore } from "./models";

export class MapKeyValueStore implements IKeyValueStore {
  private map: Map<any, any>;

  constructor() {
    this.map = new Map<any, any>();
  }

  public async get(k): Promise<any> {
    return this.map.get(k);
  }

  public async delete(k): Promise<any> {
    return this.map.delete(k);
  }

  public async set(k, v): Promise<any> {
    return this.map.set(k, v);
  }
}

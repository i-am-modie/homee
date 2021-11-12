import EventEmitter from "events";
import { Yeelight } from "./__types__/Yeelight";

export interface YeelightService extends EventEmitter {
  initializeSearcher(): void;
  terminateSearcher(): void;
  upsertBulb(bulb: Yeelight): Promise<void>;
  findBulbById(id: string): Yeelight | undefined;
  setName(bulbOrItsId: Yeelight | string, name: string): void;
  getState(bulbOrItsId: Yeelight | string): Promise<Yeelight>;
}

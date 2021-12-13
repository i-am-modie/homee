import { Bulb, BulbWithStatus } from "../models/Bulb";

export interface ClientService {
  getBulb(roomId: string, bulbId: string): Promise<BulbWithStatus>;
  getBulbs(roomId: string): Promise<Bulb[]>;
  renameBulb(roomId: string, bulbId: string, name: string): Promise<void>;
  setBulbPower(roomId: string, bulbId: string, on: boolean): Promise<void>;
  setBulbBrightness(
    roomId: string,
    bulbId: string,
    brightness: number
  ): Promise<void>;
}

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
  setBulbRGB(
    roomId: string,
    bulbId: string,
    red: number,
    green: number,
    blue: number,
    lightness: number
  ): Promise<void>;
  setBulbCT(
    roomId: string,
    bulbId: string,
    ct: number,
    lightness: number
  ): Promise<void>;
}

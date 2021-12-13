import EventEmitter from "events";
import { RGB } from "./__types__/RGB";
import { TransitionEffect } from "./__types__/TransitionEffect";
import { Yeelight, YeelightWithStatus } from "./__types__/Yeelight";

export interface YeelightService extends EventEmitter {
  initializeSearcher(): void;
  terminateSearcher(): void;
  upsertBulb(bulb: Yeelight): Promise<void>;
  findBulbById(id: string): Promise<YeelightWithStatus | undefined>;
  setName(bulbOrItsId: Yeelight | string, name: string): Promise<void>;
  getState(bulbOrItsId: Yeelight | string): Promise<Yeelight>;
  getAllBulbs(): Promise<Yeelight[]>;
  setHSL(
    bulbOrItsId: Yeelight | string,
    hue: number,
    saturation: number,
    lightness: number,
    effect?: TransitionEffect,
  ): Promise<void>;
  setRGBL(
    bulbOrItsId: Yeelight | string,
    rgb: RGB,
    lightness: number,
    effect?: TransitionEffect,
  ): Promise<void>;
  setBright(
    bulbOrItsId: Yeelight | string,
    lightness: number,
    effect?: TransitionEffect,
  ): Promise<void>;
  setPower(
    bulbOrItsId: Yeelight | string,
    turnOn: boolean,
    effect?: TransitionEffect,
  ): Promise<void>;
  setCt(
    bulbOrItsId: Yeelight | string,
    ct: number,
    lightness: number,
    effect?: TransitionEffect,
  ): Promise<void>;
}

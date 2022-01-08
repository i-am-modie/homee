import { YeelightMode } from "./YeelightMode.enum.js";
import { YeelightModel } from "./YeelightModel.enum.js";

export interface Yeelight {
  id: string;
  name?: string;
  location: string;
  port: number;
  model: YeelightModel;
  colorMode: YeelightMode;
  available_actions: string[];
  power: boolean;
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
  bright: number;
}
export interface YeelightWithStatus extends Yeelight {
  status: boolean;
}

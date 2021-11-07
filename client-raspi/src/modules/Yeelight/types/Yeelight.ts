import { YeelightMode } from "../YeelightMode.enum.js";
import { YeelightModel } from "../YeelightModel.enum.js";

export interface Yeelight {
  id: string;
  name?: string;
  location: string;
  model: YeelightModel;
  colorMode: YeelightMode;
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
}

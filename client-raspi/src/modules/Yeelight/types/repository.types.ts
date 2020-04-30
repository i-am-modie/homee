import { YeelightModels } from "@server/modules/Yeelight/YeelightModels.enum";
import { YeelightModes } from "@server/modules/Yeelight/YeelightModes.enum";

export interface Yeelight {
  id: string;
  name?: string;
  ip: string;
  port: number;
  model: YeelightModels;
  colorMode: YeelightModes;
  rgb: number;
  hue: number;
  sat: number;
  ct: number;
  sunsetHour: number; // format: HHMM
  deepNightHour: number; // format: HHMM
  sunsetCTChangeTimeout?: number; // in seconds
  deepNightCTChangeTimeout?: number; // in seconds
}

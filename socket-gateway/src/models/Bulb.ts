import { AvailableCommands } from "./AvailableCommands";
import { YeelightMode } from "./YeelightMode.enum";
import { YeelightModel } from "./YeelightModel.enum";

export interface Bulb {
  id: string;
  name?: string;
  model: YeelightModel;
  colorMode: YeelightMode;
  available_actions: AvailableCommands[];
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
  power: boolean;
  bright: number;
}

export interface BulbWithStatus extends Bulb {
  status: boolean;
}

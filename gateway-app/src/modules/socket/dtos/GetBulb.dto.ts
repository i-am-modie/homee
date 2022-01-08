import { YeelightMode } from "../../Yeelight/__types__/YeelightMode.enum";
import { YeelightModel } from "../../Yeelight/__types__/YeelightModel.enum";
import { AvailableCommands } from "./AvailableCommands";

export interface GetBulbDtoPayload {
  bulbId: string;
}

export interface GetBulbDtoResponse {
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
}

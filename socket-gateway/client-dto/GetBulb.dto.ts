import { YeelightMode } from "./YeelightMode.enum";
import { YeelightModel } from "./YeelightModel.enum";
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
}

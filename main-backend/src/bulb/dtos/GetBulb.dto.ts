import { AvailableCommands } from "../../models/AvailableCommands";
import { YeelightMode } from "../../models/YeelightMode.enum";
import { YeelightModel } from "../../models/YeelightModel.enum";

export interface GetBulbResponseBodyDto {
  id: string;
  name?: string;
  model: YeelightModel;
  colorMode: YeelightMode;
  available_actions: AvailableCommands[];
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
  status: boolean;
  power: boolean;
  bright: number;
  sharedWith: string[],
  isShared: boolean,
}

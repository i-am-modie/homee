import { AvailableCommands } from "../../models/AvailableCommands";
import { YeelightMode } from "../../models/YeelightMode.enum";
import { YeelightModel } from "../../models/YeelightModel.enum";

export interface RefetchBulbsResponseBodyDto {
  bulbs: RefetchBulbsBulbsResponseBodyDto[];
}

export interface RefetchBulbsBulbsResponseBodyDto {
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

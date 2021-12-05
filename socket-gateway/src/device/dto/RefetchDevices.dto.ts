import { AvailableCommands } from "../../models/AvailableCommands";
import { YeelightMode } from "../../models/YeelightMode.enum";
import { YeelightModel } from "../../models/YeelightModel.enum";

export interface RefetchDevicesResponseBodyDto {
  bulbs: RefetchDevicesBulbsResponseBodyDto[];
}

export interface RefetchDevicesBulbsResponseBodyDto {
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

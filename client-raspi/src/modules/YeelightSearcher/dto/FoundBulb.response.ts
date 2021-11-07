import { decodeBase64 } from "../../helpers/decodeBase64.js";
import { Yeelight } from "../../Yeelight/types/Yeelight.js";
import { YeelightMode } from "../../Yeelight/YeelightMode.enum.js";
import { YeelightModel } from "../../Yeelight/YeelightModel.enum.js";

export enum FoundBulbResponseModel {
  COLOR = "color",
  MONO = "mono",
}

export enum FoundBulbResponsePowerState {
  ON = "on",
  OFF = "off",
}

export enum FoundBulbResponseColorMode {
  COLOR = 1,
  CT = 2,
  HSV = 3,
  DAYTIME = 7,
}

export interface FoundBulbResponseDTO {
  "CACHE-CONTROL": string;
  /** @deprecated only for SSDP confirmation */
  DATE: string;
  /** @deprecated only for SSDP confirmation */
  EXT: string;
  /** @deprecated only for SSDP confirmation */
  SERVER: string;
  LOCATION: string;
  ID: string;
  MODEL: FoundBulbResponseModel;
  FW_VER: string;
  SUPPORT: string;
  POWER: FoundBulbResponsePowerState;
  /**
    @min 1
    @max 100
  */
  BRIGHT: string;
  COLOR_MODE: FoundBulbResponseColorMode;
  CT: string;
  RGB: string;
  HUE: string;
  SAT: string;
  /** name in base64 */
  NAME: string;
}

export const mapFoundBulbResponseDTOToYeelightModel = (
  dto: FoundBulbResponseDTO,
): Yeelight => ({
  colorMode: dto.COLOR_MODE as unknown as YeelightMode,
  ct: Number(dto.COLOR_MODE),
  hue: Number(dto.HUE),
  id: dto.ID,
  location: dto.LOCATION,
  model: dto.MODEL as unknown as YeelightModel,
  rgb: dto.RGB,
  sat: Number(dto.SAT),
  name: dto.NAME && decodeBase64(dto.NAME),
});

import { AvailableCommands } from "./AvailableCommands";

export type ExecuteCommandPayload = {
  bulbId: string;
} & (
  | ExecuteCommandSetName
  | ExecuteCommandSetHSV
  | ExecuteCommandSetRGBL
  | ExecuteCommandSetBright
  | ExecuteCommandSetPower
  | ExecuteCommandSetCT
);

export interface ExecuteCommandSetName {
  command: AvailableCommands.SET_NAME;
  params: [name: string];
}

export interface ExecuteCommandSetHSV {
  command: AvailableCommands.SET_HSV;
  params: [
    /**
     *  @min 0
     *  @max 360
     */
    hue: number,
    /**
     * @min 0
     * @max 100
     */
    saturation: number,
    /**
     * @min 0
     * @max 100
     */
    lightness: number,
    effect?: ExecuteCommandPayloadParamEffect,
  ];
}

export interface ExecuteCommandSetRGBL {
  command: AvailableCommands.SET_RGB;
  params: [
    /**
     * @min 0
     * @max 255
     */
    red: number,
    /**
     * @min 0
     * @max 255
     */
    green: number,
    /**
     * @min 0
     * @max 255
     */
    blue: number,
    /**
     * @min 0
     * @max 100
     */
    lightness: number,
    effect?: ExecuteCommandPayloadParamEffect,
  ];
}

export interface ExecuteCommandSetBright {
  command: AvailableCommands.SET_BRIGHT;
  params: [
    /**
     * @min 0
     * @max 100
     */
    lightness: number,
    effect?: ExecuteCommandPayloadParamEffect,
  ];
}

export interface ExecuteCommandSetPower {
  command: AvailableCommands.SET_POWER;
  params: [power: boolean, effect?: ExecuteCommandPayloadParamEffect];
}

export interface ExecuteCommandSetCT {
  command: AvailableCommands.SET_CT;
  params: [
    /**
     * @min 1800
     * @max 6500
     */
    ct: number,
    /**
     * @min 0
     * @max 100
     */ lightness: number,
    effect?: ExecuteCommandPayloadParamEffect,
  ];
}

export type ExecuteCommandPayloadParamEffect = {
  effect: ExecuteCommandPayloadParamEffectTransitionMode;
  /** @min(30) */
  durationInMs: number;
};

export enum ExecuteCommandPayloadParamEffectTransitionMode {
  SMOOTH = "smooth",
  SUDDEN = "sudden",
}

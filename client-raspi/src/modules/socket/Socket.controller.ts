import { Socket } from "socket.io-client";
import autoBind from "auto-bind";
import { Logger } from "../Logger/Logger";
import { YeelightService } from "../Yeelight/Yeelight.service";
import { Yeelight } from "../Yeelight/__types__/Yeelight";
import { SocketEvent } from "./__types__/SocketEvents";
import { ValidationError } from "../Yeelight/Errors/Validation.error.js";
import { BulbNotFoundError } from "../Yeelight/Errors/BulbNotFound.error.js";
import { GetBulbDtoPayload } from "./dtos/GetBulb.dto";
import {
  ExecuteCommandPayload,
  ExecuteCommandPayloadParamEffect,
} from "./dtos/ExecuteCommand.dto";
import { AvailableCommands } from "./dtos/AvailableCommands.js";
import { TransitionEffect } from "../Yeelight/__types__/TransitionEffect.js";
import { TransitionModeEnum } from "../Yeelight/__types__/TransitionMode.enum";
import { disconnect } from "process";
import { inspect } from "util";

type SocketEventObject = [name: SocketEvent, handler: SocketEventObjectHandler];

type SocketEventObjectHandler = (
  [...data]: any,
  callback?: SocketEventObjectHandlerCallback,
) => Promise<void>;

type SocketEventObjectHandlerCallback = (
  err: string | undefined,
  [...data]?: any,
) => void;

type SocketEvents = {
  [key in SocketEvent]: SocketEventObject[1];
};

export class SocketController {
  constructor(
    private readonly _logger: Logger,
    private readonly _socket: Socket,
    private readonly _yeelightService: YeelightService,
  ) {
    autoBind(this);

    const socketEvents: SocketEvents = {
      getBulbs: this.handleGetAll,
      getBulb: this.handleGetBulb,
      executeCommand: this.handleExecuteCommand,
    };

    Object.entries(socketEvents).forEach(([key, value]) => {
      console.log(`Registering ${key}`);
      this._socket.on(key, value);
    });

    this._socket.on("disconnect", () => {
      console.log("disconnected");
    });

    this._socket.on("connect_error", (err) => {
      console.log("connection erorr");
      console.log(err instanceof Error); // true
      console.log(err.message); // not authorized '
    });
  }

  private async handleGetAll(
    payload: unknown,
    cb?: SocketEventObjectHandlerCallback,
  ): Promise<void> {
    cb?.(undefined, await this._yeelightService.getAllBulbs());
  }

  private async handleGetBulb(
    { bulbId }: Partial<GetBulbDtoPayload> = {},
    cb?: SocketEventObjectHandlerCallback,
  ): Promise<void> {
    try {
      const bulbData = await this.getBulb(bulbId);
      cb?.(undefined, bulbData);
    } catch (err) {
      cb?.(err instanceof Error ? err.message : "Unknown error");
    }
  }

  private async handleExecuteCommand(
    payload: Partial<ExecuteCommandPayload> = {},
    cb?: SocketEventObjectHandlerCallback,
  ) {
    console.log(`executing ${inspect(payload)}`);
    try {
      const bulbData = await this.getBulb(payload.bulbId);
      if (
        !payload.command ||
        !Object.values(AvailableCommands).includes(payload.command)
      ) {
        throw new ValidationError(
          "command",
          `in available commands [${Object.values(AvailableCommands).join(
            ",",
          )}]`,
        );
      }
      if (!bulbData.available_actions.includes(payload.command)) {
        throw new ValidationError("command", `supported by bulb`);
      }
      await this.executeCertainCommand(
        bulbData,
        payload as ExecuteCommandPayload,
      );
      cb?.(undefined, { status: "Ok" });
    } catch (err) {
      cb?.(err instanceof Error ? err.message : "Unknown error");
    }
  }

  private executeCertainCommand(
    bulb: Yeelight,
    commandPayload: ExecuteCommandPayload,
  ) {
    switch (commandPayload.command) {
      case AvailableCommands.SET_HSV:
        const [hsvHue, hsvSat, hsvLightness, hsvEffectRaw] =
          commandPayload.params;
        const hsvEffect = this.mapPayloadEffectToTransitionEffect(hsvEffectRaw);

        return this._yeelightService.setHSL(
          bulb,
          hsvHue,
          hsvSat,
          hsvLightness,
          hsvEffect,
        );

      case AvailableCommands.SET_BRIGHT:
        const [brightValue, brightEffectRaw] = commandPayload.params;
        const brightEffect =
          this.mapPayloadEffectToTransitionEffect(brightEffectRaw);

        return this._yeelightService.setBright(bulb, brightValue, brightEffect);

      case AvailableCommands.SET_CT:
        const [ctValue, ctLightness, ctEffectRaw] = commandPayload.params;
        const ctEffect = this.mapPayloadEffectToTransitionEffect(ctEffectRaw);

        return this._yeelightService.setCt(
          bulb,
          ctValue,
          ctLightness,
          ctEffect,
        );

      case AvailableCommands.SET_NAME:
        const [name] = commandPayload.params;

        return this._yeelightService.setName(bulb, name);

      case AvailableCommands.SET_POWER:
        const [power, powerEffectRaw] = commandPayload.params;
        const powerEffect =
          this.mapPayloadEffectToTransitionEffect(powerEffectRaw);

        return this._yeelightService.setPower(bulb, power, powerEffect);
      case AvailableCommands.SET_RGB:
        const [rgbRed, rgbGreen, rgbBlue, rgbLightness, rgbEffectRaw] =
          commandPayload.params;
        const rgbEffect = this.mapPayloadEffectToTransitionEffect(rgbEffectRaw);

        return this._yeelightService.setRGBL(
          bulb,
          {
            blue: rgbBlue,
            green: rgbGreen,
            red: rgbRed,
          },
          rgbLightness,
          rgbEffect,
        );
      default:
        const _: never = commandPayload;
        throw new Error("Unknown command");
    }
  }

  private async getBulb(bulbId: string | undefined): Promise<Yeelight> {
    if (!bulbId) {
      throw new ValidationError("bulbid", "defined");
    }
    const bulbData = await this._yeelightService.findBulbById(bulbId);
    if (!bulbData) {
      throw new BulbNotFoundError(bulbId);
    }
    return bulbData;
  }

  private mapPayloadEffectToTransitionEffect(
    effect: ExecuteCommandPayloadParamEffect | undefined,
  ): TransitionEffect | undefined {
    if (!effect) {
      return undefined;
    }

    return {
      durationInMs: effect.durationInMs,
      effect: effect.effect as unknown as TransitionModeEnum,
    };
  }
}

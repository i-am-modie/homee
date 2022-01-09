import { Socket } from "socket.io-client";
import autoBind from "auto-bind";
import { Logger } from "../Logger/Logger";
import { YeelightService } from "../Yeelight/Yeelight.service";
import { Yeelight, YeelightWithStatus } from "../Yeelight/__types__/Yeelight";
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
import { GetBulbsDtoResponse } from "./dtos/GetBulbs.dto";
import { encodeBase64 } from "../helpers/encodeBase64.js";

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
      this._logger.log(`Registering ${key}`);
      this._socket.on(key, value);
    });

    this._socket.on("disconnect", () => {
      this._logger.log("disconnected");
    });

    this._socket.on("connect_error", (err) => {
      this._logger.log("connection erorr");
      this._logger.log(err instanceof Error); // true
      this._logger.log(err.message); // not authorized '
    });
  }

  private async handleGetAll(
    payload: unknown,
    cb?: SocketEventObjectHandlerCallback,
  ): Promise<void> {
    this._logger.log("Refetching all bulbs");
    const bulbs: Yeelight[] = await this._yeelightService.getAllBulbs();
    const dto: GetBulbsDtoResponse = {
      bulbs: bulbs.map(({ location, port, ...bulb }) => ({
        ...bulb,
      })) as unknown as GetBulbsDtoResponse["bulbs"],
    };
    this._logger.log("got bulbs responding");
    cb?.(undefined, dto);
  }

  private async handleGetBulb(
    { bulbId }: Partial<GetBulbDtoPayload> = {},
    cb?: SocketEventObjectHandlerCallback,
  ): Promise<void> {
    try {
      const loggerAction = this._logger.beginAction(
        `Getting bulb info ${bulbId}`,
      );
      const bulbData = await this.getBulb(bulbId);
      const { location, port, ...bulb } = bulbData;

      cb?.(undefined, bulb);
      this._logger.endAction(loggerAction);
    } catch (err) {
      cb?.(err instanceof Error ? err.message : "Unknown error");
    }
  }

  private async handleExecuteCommand(
    payload: Partial<ExecuteCommandPayload> = {},
    cb?: SocketEventObjectHandlerCallback,
  ) {
    this._logger.log(`executing ${inspect(payload)}`);
    try {
      const bulbData = await this.getBulb(payload.bulbId);
      if (!bulbData.status) {
        throw new Error("bulb is offline");
      }
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
        const b64Name = encodeBase64(name);

        return this._yeelightService.setName(bulb, b64Name);

      case AvailableCommands.SET_POWER:
        const [power, powerEffectRaw] = commandPayload.params;
        const powerEffect =
          this.mapPayloadEffectToTransitionEffect(powerEffectRaw);
        this._logger.log(
          `Setting ${bulb.id} power with params ${commandPayload.params}`,
        );
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

  private async getBulb(
    bulbId: string | undefined,
  ): Promise<YeelightWithStatus> {
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

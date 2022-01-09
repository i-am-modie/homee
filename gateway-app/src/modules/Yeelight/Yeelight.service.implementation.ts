import EventEmitter from "events";
import autoBind from "auto-bind";
import { decodeBase64 } from "../helpers/decodeBase64.js";
import { YeelightConnectionService } from "./ConnectionService/YeelightConnection.service.js";
import { DefaultTransitionEffect } from "./DefaultTransitionEffect.js";
import { BulbNotFoundError } from "./Errors/BulbNotFound.error.js";
import { ValidationError } from "./Errors/Validation.error.js";
import { YeelightRepository } from "./Repository/Yeelight.repository.js";
import YeelightSearcher from "./Searcher/YeelightSearcher.js";
import { YeelightSearcherEvents } from "./Searcher/YeelightSearcherEvents.enum.js";
import { YeelightService } from "./Yeelight.service.js";
import { yeelightServiceEvents } from "./yeelightServiceEvents.js";
import { RGB } from "./__types__/RGB.js";
import { TransitionEffect } from "./__types__/TransitionEffect.js";
import { TransitionModeEnum } from "./__types__/TransitionMode.enum.js";
import { Yeelight, YeelightWithStatus } from "./__types__/Yeelight.js";
import { YeelightMode } from "./__types__/YeelightMode.enum.js";
import { truthy } from "../helpers/truthyfilter.js";
import { inspect } from "util";

export class YeelightServiceImplementation
  extends EventEmitter
  implements YeelightService
{
  constructor(
    private readonly _yeelightSearcher: YeelightSearcher,
    private readonly _yeelightRepository: YeelightRepository,
    private readonly _yeelightConnectionService: YeelightConnectionService,
  ) {
    super();
    autoBind(this);
  }
  public async getAllBulbs(): Promise<Array<Yeelight>> {
    const bulbs = this._yeelightRepository.getYeelights();
    return (
      await Promise.allSettled(
        bulbs.map(async (bulb) => {
          try {
            return await this.getState(bulb);
          } catch {
            return undefined;
          }
        }),
      )
    )
      .map((promise) => {
        if (promise.status === "fulfilled") {
          return promise.value!;
        }
        return undefined;
      })
      .filter(truthy);
  }

  public initializeSearcher() {
    this._yeelightSearcher.init();
    this._yeelightSearcher.on(YeelightSearcherEvents.newBulbData, (data) => {
      this.emit(yeelightServiceEvents.newBulbData, data);
    });

    this.on(yeelightServiceEvents.getBulbs, () => {
      this._yeelightSearcher.emit(YeelightSearcherEvents.getBulbs);
    });
  }

  public terminateSearcher() {
    this._yeelightSearcher.terminate();
    this.removeAllListeners(yeelightServiceEvents.getBulbs);
  }

  public upsertBulb(bulb: Yeelight): Promise<void> {
    return this._yeelightRepository.upsertBulb(bulb);
  }

  public async findBulbById(
    id: string,
  ): Promise<YeelightWithStatus | undefined> {
    try {
      const bulb = await this.getState(id);
      return { ...bulb, status: true };
    } catch (err) {
      const bulbFromDb = await this._yeelightRepository.findBulbById(id);
      if (!bulbFromDb) {
        return undefined;
      }
      return {
        ...bulbFromDb,
        power: false,
        status: false,
      };
    }
  }

  public async setName(
    bulbOrItsId: Yeelight | string,
    name: string,
  ): Promise<void> {
    const bulb = this.getBulb(bulbOrItsId);

    await this._yeelightConnectionService.executeCommands(bulb, [
      {
        command: "set_name",
        params: [name],
      },
    ]);
  }

  public async setBright(
    bulbOrItsId: Yeelight | string,
    lightness: number,
    effect: TransitionEffect = DefaultTransitionEffect,
  ): Promise<void> {
    if (lightness < 0 || lightness > 100) {
      throw new ValidationError("lightness", "between 0 and 100");
    }

    this.validateTransitionEffect(effect);

    const bulb = this.getBulb(bulbOrItsId);

    await this._yeelightConnectionService.executeCommands(bulb, [
      {
        command: "set_bright",
        params: [lightness, effect.effect, effect.durationInMs],
      },
    ]);
  }

  public async setCt(
    bulbOrItsId: Yeelight | string,
    ct: number,
    lightness: number,
    effect: TransitionEffect = DefaultTransitionEffect,
  ): Promise<void> {
    if (ct < 1700 || ct > 6500) {
      throw new ValidationError("lightness", "between 1700 and 6500");
    }
    if (lightness < 0 || lightness > 100) {
      throw new ValidationError("lightness", "between 0 and 100");
    }

    this.validateTransitionEffect(effect);

    const bulb = this.getBulb(bulbOrItsId);

    await this._yeelightConnectionService.executeCommands(bulb, [
      {
        command: "set_ct_abx",
        params: [ct, effect.effect, Math.round(effect.durationInMs / 2)],
      },
      {
        command: "set_bright",
        params: [lightness, effect.effect, Math.round(effect.durationInMs / 2)],
      },
    ]);
  }

  public async setPower(
    bulbOrItsId: Yeelight | string,
    turnOn: boolean,
    effect: TransitionEffect = DefaultTransitionEffect,
  ): Promise<void> {
    this.validateTransitionEffect(effect);

    const bulb = this.getBulb(bulbOrItsId);

    await this._yeelightConnectionService.executeCommands(bulb, [
      {
        command: "set_power",
        params: [turnOn ? "on" : "off", effect.effect, effect.durationInMs],
      },
    ]);
  }

  public async setHSL(
    bulbOrItsId: Yeelight | string,
    hue: number,
    saturation: number,
    lightness: number,
    effect: TransitionEffect = DefaultTransitionEffect,
  ): Promise<void> {
    if (hue < 0 || hue > 360) {
      throw new ValidationError("hue", "between 0 and 360");
    }

    if (saturation < 0 || saturation > 360) {
      throw new ValidationError("saturation", "between 0 and 100");
    }

    if (lightness < 0 || lightness > 100) {
      throw new ValidationError("lightness", "between 0 and 100");
    }

    this.validateTransitionEffect(effect);

    const bulb = this.getBulb(bulbOrItsId);

    await this._yeelightConnectionService.executeCommands(bulb, [
      {
        command: "set_hsv",
        params: [
          hue,
          saturation,
          effect.effect,
          Math.round(effect.durationInMs / 2),
        ],
      },
      {
        command: "set_bright",
        params: [lightness, effect.effect, Math.round(effect.durationInMs / 2)],
      },
    ]);
  }

  public async setRGBL(
    bulbOrItsId: Yeelight | string,
    rgb: RGB,
    lightness: number,
    effect: TransitionEffect = DefaultTransitionEffect,
  ): Promise<void> {
    if (rgb.red < 0 || rgb.red > 255) {
      throw new ValidationError("rgb.red", "between 0 and 255");
    }
    if (rgb.green < 0 || rgb.green > 255) {
      throw new ValidationError("rgb.green", "between 0 and 255");
    }
    if (rgb.blue < 0 || rgb.blue > 255) {
      throw new ValidationError("rgb.blue", "between 0 and 255");
    }

    if (lightness < 0 || lightness > 100) {
      throw new ValidationError("lightness", "between 0 and 100");
    }

    this.validateTransitionEffect(effect);

    const bulb = this.getBulb(bulbOrItsId);
    const rgbHex = (rgb.red << 16) | (rgb.green << 8) | rgb.blue;

    await this._yeelightConnectionService.executeCommands(bulb, [
      {
        command: "set_rgb",
        params: [rgbHex, effect.effect, Math.round(effect.durationInMs / 2)],
      },
      {
        command: "set_bright",
        params: [lightness, effect.effect, Math.round(effect.durationInMs / 2)],
      },
    ]);
  }

  public async getState(bulbOrItsId: Yeelight | string): Promise<Yeelight> {
    const bulb = this.getBulb(bulbOrItsId);
    const params = [
      "color_mode",
      "ct",
      "hue",
      "rgb",
      "sat",
      "name",
      "power",
      "bright",
    ];

    const [{ response }] =
      await this._yeelightConnectionService.executeCommands(bulb, [
        {
          command: "get_prop",
          params,
        },
      ]);

    return {
      colorMode: response[0] as unknown as YeelightMode,
      ct: Number(response[1]),
      hue: Number(response[2]),
      id: bulb.id,
      location: bulb.location,
      port: bulb.port,
      model: bulb.model,
      rgb: response[3],
      sat: Number(response[4]),
      name: decodeBase64(response[5]),
      power: response?.[6] === "on",
      available_actions: bulb.available_actions,
      bright: Number(response?.[7]),
    };
  }

  private getBulb(bulbOrItsId: Yeelight | string): Yeelight {
    if (typeof bulbOrItsId === "string") {
      const bulb = this._yeelightRepository.findBulbById(bulbOrItsId);
      if (!bulb) {
        throw new BulbNotFoundError(bulbOrItsId);
      }

      return bulb;
    }

    return bulbOrItsId;
  }

  private validateTransitionEffect(effect: TransitionEffect) {
    if (effect.durationInMs < 30) {
      throw new ValidationError("transition duration", "longer than 30ms");
    }

    if (!Object.values(TransitionModeEnum).includes(effect.effect)) {
      throw new ValidationError(
        "transition effect",
        `must be one of [${Object.values(TransitionModeEnum).join(",")}]`,
      );
    }
  }
}

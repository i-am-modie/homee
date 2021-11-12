import EventEmitter from "events";
import { decodeBase64 } from "../helpers/decodeBase64.js";
import { YeelightConnectionService } from "./ConnectionService/YeelightConnection.service.js";
import { BulbNotFoundError } from "./Errors/BulbNotFound.error.js";
import { YeelightRepository } from "./Repository/Yeelight.repository.js";
import YeelightSearcher from "./Searcher/YeelightSearcher.js";
import { YeelightSearcherEvents } from "./Searcher/YeelightSearcherEvents.enum.js";
import { YeelightService } from "./Yeelight.service.js";
import { yeelightServiceEvents } from "./yeelightServiceEvents.js";
import { Yeelight } from "./__types__/Yeelight.js";
import { YeelightMode } from "./__types__/YeelightMode.enum.js";

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

  public findBulbById(id: string): Yeelight | undefined {
    return this._yeelightRepository.findBulbById(id);
  }

  public setName(bulbOrItsId: Yeelight | string, name: string): void {
    const bulb = this.getBulb(bulbOrItsId);

    this._yeelightConnectionService.executeCommands(bulb, [
      {
        command: "set_name",
        params: [name],
      },
    ]);
  }

  public async getState(bulbOrItsId: Yeelight | string): Promise<Yeelight> {
    const bulb = this.getBulb(bulbOrItsId);
    const params = ["color_mode", "ct", "hue", "rgb", "sat", "name"];

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
      available_actions: bulb.available_actions,
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
}

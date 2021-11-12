import { EventEmitter } from "events";
import pkg from "node-ssdp";

import { Logger } from "../../Logger/Logger.js";
import {
  FoundBulbResponseDTO,
  mapFoundBulbResponseDTOToYeelightModel,
} from "./dto/FoundBulb.response.js";
import { YeelightSearcherEvents } from "./YeelightSearcherEvents.enum.js";
const { Client } = pkg;

export default class YeelightSearcher extends EventEmitter {
  private _client: pkg.Client;
  private _isInitialized: boolean = false;

  constructor(private readonly _logger: Logger) {
    super();
    const config = { ssdpPort: 1982, sourcePort: 1982 };
    this._client = new Client({ ...config });
  }

  public init() {
    if (this._isInitialized) {
      return;
    }

    this._client.on("response", (data) =>
      this.emit(
        YeelightSearcherEvents.newBulbData,
        mapFoundBulbResponseDTOToYeelightModel(
          data as unknown as FoundBulbResponseDTO,
        ),
      ),
    );

    this.on(YeelightSearcherEvents.getBulbs, () => {
      this.search();
    });

    this._isInitialized = true;
  }

  public terminate() {
    if (!this._isInitialized) {
      return;
    }

    this._client.removeAllListeners();
    this.removeAllListeners(YeelightSearcherEvents.getBulbs);

    this._isInitialized = false;
  }

  private search() {
    const loggerAction = this._logger.beginAction("Searching bulbs");
    this._client.search("wifi_bulb");
    this._logger.endAction(loggerAction);
  }
}

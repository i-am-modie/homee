import { EventEmitter } from "events";
import pkg from "node-ssdp";

import { Logger } from "../../Logger/Logger.js";
import {
  FoundBulbResponseDTO,
  mapFoundBulbResponseDTOToYeelightModel,
} from "./dto/FoundBulb.response.js";
import { yeelightSearcherEvents } from "./yeelightSearcherEvents.js";
const { Client } = pkg;

export default class YeelightSearcher extends EventEmitter {
  client: pkg.Client;
  bulbs: string[] = [];
  constructor(private readonly _logger: Logger) {
    super();
    const config = { ssdpPort: 1982, sourcePort: 1982 };
    this.client = new Client({ ...config });

    this.client.on("response", (data) =>
      this.emit(
        yeelightSearcherEvents.newBulbData,
        mapFoundBulbResponseDTOToYeelightModel(
          data as unknown as FoundBulbResponseDTO,
        ),
      ),
    );

    this.on(yeelightSearcherEvents.getBulbs, () => {
      this.search();
    });

    this.search();
  }

  search = () => {
    this._logger.log("Searching bulbs");
    this.client.search("wifi_bulb");
  };
}

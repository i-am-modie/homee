// eslint-disable-next-line import/order

import "reflect-metadata";
import dotenv from "dotenv";
import { Logger } from "./modules/Logger/Logger.js";
import { Yeelight } from "./modules/Yeelight/types/Yeelight.js";
import { YeelightRepository } from "./modules/Yeelight/Yeelight.repository.js";
import YeelightSearcher from "./modules/YeelightSearcher/YeelightSearcher.js";
import { yeelightSearcherEvents } from "./modules/YeelightSearcher/yeelightSearcherEvents.js";

dotenv.config();

const logger = new Logger();
const searcher = new YeelightSearcher(logger);
const yeelightRepository = new YeelightRepository(process.env.LOW_DB_PATH);

console.log("listening");
setInterval(() => {
  searcher.emit(yeelightSearcherEvents.getBulbs);
}, 1000 * 180);

searcher.on(yeelightSearcherEvents.newBulbData, (data: Yeelight) => {
  logger.log(data);
  yeelightRepository.upsertBulb(data);
});

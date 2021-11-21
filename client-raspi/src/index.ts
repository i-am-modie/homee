import "reflect-metadata";
import dotenv from "dotenv";
import { Logger } from "./modules/Logger/Logger.js";
import { Yeelight } from "./modules/Yeelight/__types__/Yeelight.js";
import { yeelightRepositoryFactory } from "./modules/Yeelight/Repository/Yeelight.repository.js";
import YeelightSearcher from "./modules/Yeelight/Searcher/YeelightSearcher.js";
import { YeelightConnectionServiceImplementation } from "./modules/Yeelight/ConnectionService/YeelightConnection.service.implementation.js";
import { YeelightConnectionService } from "./modules/Yeelight/ConnectionService/YeelightConnection.service";
import { YeelightServiceImplementation } from "./modules/Yeelight/Yeelight.service.implementation.js";
import { YeelightService } from "./modules/Yeelight/Yeelight.service.js";
import { YeelightServiceEvents } from "./modules/Yeelight/__types__/YeelightServiceEvents.enum.js";
import { yeelightServiceEvents } from "./modules/Yeelight/yeelightServiceEvents.js";
import { createSocketClient } from "./modules/socket/client/socketClient.js";
import { SocketController } from "./modules/socket/Socket.controller.js";

dotenv.config();

const logger = new Logger();
const yeelightSearcher = new YeelightSearcher(logger);
const yeelightRepository = await yeelightRepositoryFactory(
  logger,
  process.env.LOW_DB_PATH!,
);
const yeelightConnectionService: YeelightConnectionService =
  new YeelightConnectionServiceImplementation(logger);
const yeelightService: YeelightService = new YeelightServiceImplementation(
  yeelightSearcher,
  yeelightRepository,
  yeelightConnectionService,
);

const socket = createSocketClient(process.env.API_URL!, process.env.API_TOKEN!);
const socketController = new SocketController(logger, socket, yeelightService);

logger.log("App started");

yeelightService.initializeSearcher();
yeelightService.emit(YeelightServiceEvents.getBulbs);
// * desk    "0x0000000007e7a51b"
// * salon   "0x0000000008014c43"

setInterval(() => {
  yeelightService.emit(YeelightServiceEvents.getBulbs);
}, 1000 * 180);

yeelightService.on(yeelightServiceEvents.newBulbData, (data: Yeelight) => {
  yeelightService.upsertBulb(data);
});

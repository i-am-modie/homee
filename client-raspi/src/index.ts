// eslint-disable-next-line import/order

import "reflect-metadata";
import dotenv from "dotenv";
import { Logger } from "./modules/Logger/Logger.js";
import { Yeelight } from "./modules/Yeelight/__types__/Yeelight.js";
import {
  YeelightRepository,
  yeelightRepositoryFactory,
} from "./modules/Yeelight/Repository/Yeelight.repository.js";
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
yeelightService.setCt("0x0000000007e7a51b", 4200, 100);

setInterval(() => {
  yeelightService.emit(YeelightServiceEvents.getBulbs);
}, 1000 * 180);

yeelightService.on(yeelightServiceEvents.newBulbData, (data: Yeelight) => {
  yeelightService.upsertBulb(data);
});

// setTimeout(() => {
//   let onoff = true;

//   setInterval(async () => {
//     try {
//       yeelightService
//         .getState("")
//         .then((data) => logger.log(data));
//     } catch (err) {
//       logger.error(err);
//     }
//   }, 2000);
// }, 5000);

// setTimeout(() => {
//   let onoff = true;

//   setInterval(() => {
//     yeelightConnectionService.executeCommands(
//       yeelightRepository.getBulbById("0x0000000007e7a51b"),
//       [
//         {
//           command: "toggle",
//         },
//       ],
//     );
//   }, 2000);
// }, 5000);

// setTimeout(() => {
//   let onoff = true;

//   setInterval(() => {
//     const r = (Math.random() * 255 * 65536) | 0
//     const g = (Math.random() * 255 * 256) | 0
//     const b = (Math.random() * 255 * 1) | 0

//     const rgb = r+g+b;
//     yeelightConnectionService.executeCommands(
//       yeelightRepository.getBulbById("0x0000000007e7a51b"),
//       [
//         {
//           command: "set_rgb",
//           params: [rgb, "smooth", 1000]
//         },
//       ],
//     );
//   }, 1000);
// }, 500);

// setTimeout(() => {
//   yeelightConnectionService.executeCommands(
//     yeelightRepository.getBulbById("0x0000000007e7a51b"),
//     [
//       {
//         command: "set_name",
//         params: ["Y2VudHJ1bSBzdGVyb3dhbmlhIHdzemVjaHN3aWF0ZW0="],
//       },
//     ],
//   );
//   yeelightConnectionService.executeCommands(
//     yeelightRepository.getBulbById("0x0000000008014c43"),
//     [
//       {
//         command: "set_name",
//         params: ["c2Fsb24="],
//       },
//     ],
//   );
// }, 5000);

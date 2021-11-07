// eslint-disable-next-line import/order

import "reflect-metadata";
import dotenv from "dotenv";
import { Logger } from "./modules/Logger/Logger.js";
import { Yeelight } from "./modules/YeelightRepository/types/Yeelight.js";
import { YeelightRepository } from "./modules/YeelightRepository/Yeelight.repository.js";
import YeelightSearcher from "./modules/YeelightSearcher/YeelightSearcher.js";
import { yeelightSearcherEvents } from "./modules/YeelightSearcher/yeelightSearcherEvents.js";
import { YeelightConnectionService } from "./modules/YeelightService/YeelightConnectionService.js";

dotenv.config();

const logger = new Logger();
const searcher = new YeelightSearcher(logger);
const yeelightRepository = new YeelightRepository(
  logger,
  process.env.LOW_DB_PATH,
);
const yeelightConnectionService = new YeelightConnectionService(logger);

console.log("listening");
setInterval(() => {
  searcher.emit(yeelightSearcherEvents.getBulbs);
}, 1000 * 180);

searcher.on(yeelightSearcherEvents.newBulbData, (data: Yeelight) => {
  logger.log(data);
  yeelightRepository.upsertBulb(data);
});

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

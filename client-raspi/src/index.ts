// eslint-disable-next-line import/order
import "./configure";

import "reflect-metadata";

import YeelightSearcher from "@server/modules/YeelightSearcher/YeelightSearcher";

const temp = new YeelightSearcher();
console.log("listening")
setInterval(temp.search, 1000 * 30);

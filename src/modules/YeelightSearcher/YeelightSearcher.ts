import { Client, SsdpHeaders } from "node-ssdp";
import { decodeBase64 } from "@server/modules/helpers/decodeBase64";

export default class YeelightSearcher {
  client: Client;
  bulbs: string[] = [];
  constructor() {
    this.client = new Client({ ssdpPort: 1982 });

    this.client.on("response", data => this.addIfNotExists(data));

    this.search();
  }

  addIfNotExists(data: SsdpHeaders) {
    if (!data.ID) {
      return;
    }
    if (!this.bulbs.some(it => it === data.ID)) {
      const parsedData = { ...data, NAME: decodeBase64(data.NAME as string) };
      this.bulbs.push(data.ID.toString());
      console.log(parsedData);
    }
  }
  search = () => this.client.search("wifi_bulb");
}

import path, { join } from "path";
import { Low, JSONFile } from "lowdb";
import { Yeelight } from "./types/Yeelight.js";
import { fileURLToPath } from "url";
import { Logger } from "../Logger/Logger.js";

const __dirname = path.dirname(
  join(fileURLToPath(import.meta.url), "../../.."),
);
type Scheme = { lights: { [id: string]: Yeelight } };

export class YeelightRepository {
  private _db: Low<Scheme>;

  constructor(private readonly _logger: Logger, path: string) {
    // Use JSON file for storage
    const file = join(__dirname, path);
    const adapter = new JSONFile<Scheme>(file);
    this._db = new Low<Scheme>(adapter);
    this._db.data ||= { lights: {} };
  }

  public getYeelights(): Yeelight[] {
    return Object.values(this._db.data?.lights ?? {});
  }

  public getBulbByName(name: string): Yeelight | undefined {
    return (
      this._db.data?.lights &&
      Object.values(this._db.data.lights).find((light) => light.name === name)
    );
  }

  public getBulbById(id: string): Yeelight | undefined {
    return this._db.data?.lights[id];
  }

  public async upsertBulb(yeelight: Yeelight) {
    this._logger.log(`upserting bulb ${yeelight.id}`)
    this._db.data!.lights[yeelight.id] = yeelight;
    this._db.write();
  }
}

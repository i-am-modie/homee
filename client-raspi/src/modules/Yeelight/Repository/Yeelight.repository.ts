import path, { join } from "path";
import { Low, JSONFile } from "lowdb";
import autoBind from "auto-bind";
import { Yeelight } from "../__types__/Yeelight.js";
import { fileURLToPath } from "url";
import { Logger } from "../../Logger/Logger.js";

const __dirname = path.dirname(
  join(fileURLToPath(import.meta.url), "../../../.."),
);
type Scheme = { lights: { [id: string]: Yeelight } };

export const yeelightRepositoryFactory = async (
  logger: Logger,
  path: string,
) => {
  const yeelightRepository = new YeelightRepository(logger, path);
  await yeelightRepository.createConnection();

  return yeelightRepository;
};

export class YeelightRepository {
  private _db: Low<Scheme>;
  private _isConnected = false;

  constructor(private readonly _logger: Logger, path: string) {
    autoBind(this);
    // Use JSON file for storage
    const filePath = join(__dirname, path);
    const adapter = new JSONFile<Scheme>(filePath);
    this._db = new Low<Scheme>(adapter);
    this._db.data ||= { lights: {} };
  }
  public async createConnection() {
    if (this._isConnected) {
      return;
    }
    await this._db.read();
    this._isConnected = true;
  }

  public getYeelights(): Yeelight[] {
    return Object.values(this._db.data?.lights ?? {});
  }

  public findBulbByName(name: string): Yeelight | undefined {
    return (
      this._db.data?.lights &&
      Object.values(this._db.data.lights).find((light) => light.name === name)
    );
  }

  public findBulbById(id: string): Yeelight | undefined {
    return this._db.data?.lights[id];
  }

  public async upsertBulb(yeelight: Yeelight) {
    this._db.data!.lights[yeelight.id] = yeelight;
    await this._db.write();
  }
}

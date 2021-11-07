import path, { join } from "path";
import { Low, JSONFile } from "lowdb";
import { Yeelight } from "./types/Yeelight.js";
import { fileURLToPath } from "url";

// // Read data from JSON file, this will set db.data content
// await db.read()

// // If file.json doesn't exist, db.data will be null
// // Set default data
// // db.data = db.data || { posts: [] } // Node < v15.x
// db.data ||= { posts: [] }             // Node >= 15.x

// // Create and query items using plain JS
// db.data.posts.push('hello world')
// db.data.posts[0]

// // You can also use this syntax if you prefer
// const { posts } = db.data
// posts.push('hello world')

// // Write db.data content to db.json
const __dirname = path.dirname(
  join(fileURLToPath(import.meta.url), "../../.."),
);
type Scheme = { lights: { [id: string]: Yeelight } };

export class YeelightRepository {
  private _db: Low<Scheme>;

  constructor(path: string) {
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
    this._db.data!.lights[yeelight.id] = yeelight;
    this._db.write();
  }
}

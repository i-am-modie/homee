import { inspect } from "util";
import { getCurrentDate } from "../helpers/getCurrentDate.js";

export class Logger {
  public log(message: any) {
    console.log(`${this.getPrefix()} - ${inspect(message)}`);
  }

  private getPrefix(): string {
    return `[Gateway: ${getCurrentDate().toISOString()} ]`;
  }
}

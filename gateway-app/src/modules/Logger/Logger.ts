import { inspect } from "util";
import autoBind from "auto-bind";
import { getCurrentDate } from "../helpers/getCurrentDate.js";

export interface LoggerActionInProgressInfo {
  actionInfo: string;
  beginTime: Date;
}

export class Logger {
  constructor() {
    autoBind(this);
  }

  public log(message: any) {
    console.log(`${this.getPrefix()} - ${inspect(message)}`);
  }

  public error(message: any) {
    console.error(`${this.getPrefix()} - ${inspect(message)}`);
  }

  public warn(message: any) {
    console.warn(`${this.getPrefix()} - ${inspect(message)}`);
  }

  public beginAction(actionInfo: string): LoggerActionInProgressInfo {
    console.log(`${this.getPrefix()} - Began action - ${actionInfo}`);
    return {
      actionInfo,
      beginTime: getCurrentDate(),
    };
  }

  public endAction(actionInfo: LoggerActionInProgressInfo, result?: string) {
    const executionTimeInMs =
      getCurrentDate().valueOf() - actionInfo.beginTime.valueOf();
    console.log(
      `${this.getPrefix()} - Ended action in ${executionTimeInMs}ms - ${
        actionInfo.actionInfo
      } ${result ? `with result: ${result}` : ""}`,
    );
  }

  private getPrefix(): string {
    return `[Gateway: ${getCurrentDate().toISOString()} ]`;
  }
}

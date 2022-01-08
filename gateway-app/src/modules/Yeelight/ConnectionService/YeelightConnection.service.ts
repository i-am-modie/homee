import { Yeelight } from "../__types__/Yeelight.js";
import { YeelightCommands } from "./YeelightCommands.js";

export interface YeelightConnectionServiceCommand {
  command: YeelightCommands;
  params?: Array<string | number>;
}

export interface YeelightConnectionServiceCommandResponse {
  command: string;
  params?: Array<string | number>;
  response: string[];
}
export interface YeelightConnectionService {
  executeCommands(
    target: Yeelight,
    commands: YeelightConnectionServiceCommand[],
  ): Promise<YeelightConnectionServiceCommandResponse[]>;
}

import { Yeelight } from "../Yeelight.js";

export interface YeelightConnectionServiceCommand {
  command: string;
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
  ): Promise<YeelightConnectionServiceCommandResponse[]>
}

import net from "net";
import { inspect } from "util";
import autoBind from "auto-bind";
import { generateRandomId } from "../../helpers/generateRandomId.js";
import { Logger } from "../../Logger/Logger.js";
import { Yeelight } from "../__types__/Yeelight.js";
import {
  YeelightConnectionService,
  YeelightConnectionServiceCommand,
  YeelightConnectionServiceCommandResponse,
} from "./YeelightConnection.service.js";
import { resolve } from "path/posix";
import { rejects } from "assert";

interface YeelightConnectionServiceCommandWithId
  extends YeelightConnectionServiceCommand {
  id: number;
}

type YeelightRequestSuccessResponse = {
  id: string;
  result: string[];
};

type YeelightRequestFailureResponse = {
  id: string;
  error: string[];
};

type YeelightRequestResponse = YeelightRequestSuccessResponse &
  YeelightRequestFailureResponse;

export class YeelightConnectionServiceImplementation
  implements YeelightConnectionService
{
  // * Max yeelight request id is as it's stored in 4 bytes (2^32-1 )
  private readonly MAX_SAFE_REQUEST_ID = 4294967295;

  constructor(private readonly _logger: Logger) {
    autoBind(this);
  }

  public async executeCommands(
    target: Yeelight,
    commands: YeelightConnectionServiceCommand[],
  ): Promise<YeelightConnectionServiceCommandResponse[]> {
    const actionLog = this._logger.beginAction(
      `Executing ${commands.length} on ${target.id} - ${
        target.name ?? "unnamed"
      }`,
    );

    if (!commands?.length) {
      this._logger.warn("Executed 0 commands on ${}");
      return [];
    }

    if (!this.areConstrainsFulfilled(target, commands)) {
      throw new Error("constraint check failed");
    }

    const commandsWithIds = this.mapCommandsToCommandsWithId(commands);

    let connection: net.Socket;

    try {
      connection = await this.openTCPConnection(target);
      const responses = [];

      for (const command of commandsWithIds) {
        responses.push(await this.executeCommand(connection, command));
      }

      return this.mapCommandsAndResponsesToResults(commandsWithIds, responses);
      this._logger.endAction(actionLog);
    } catch (err) {
      throw err;
    } finally {
      this.closeTCPConnection(connection!);
    }
  }

  private openTCPConnection(target: Yeelight): Promise<net.Socket> {
    return new Promise((resolve, rejects) => {
      const client = new net.Socket();
      try {
        const connection = client.connect(target.port, target.location);
        client.on("connect", () => resolve(connection));
        client.on("error", (err) => rejects(err));
      } catch (err) {
        client.destroy();
        rejects(err);
      }
    });
  }

  private closeTCPConnection(connection: net.Socket) {
    connection?.destroy();
  }

  private executeCommand(
    connection: net.Socket,
    command: YeelightConnectionServiceCommandWithId,
  ): Promise<YeelightRequestSuccessResponse> {
    const suffix: string = "\r\n";

    const rawCommandObject = {
      id: command.id,
      method: command.command,
      params: command.params?.length ? command.params : undefined,
    };

    const rawCommandString = JSON.stringify(rawCommandObject) + suffix;
    const commandLogAction = this._logger.beginAction(
      `Executing command ${inspect(rawCommandObject)}`,
    );

    return new Promise<YeelightRequestSuccessResponse>((resolve, reject) => {
      connection.write(rawCommandString, (err) => {
        if (err) {
          return reject(err);
        }
      });
      connection.on("data", (data) => {
        try {
          const responseString: string = data.toString();
          const response: YeelightRequestResponse = JSON.parse(responseString);
          if (response.error) {
            this._logger.error(
              `Command ${
                command.id
              } failed to execute with error ${response && response.error && response.error?.join?.(" ")}`,
            );
            return reject(response);
          }
          this._logger.endAction(
            commandLogAction,
            `[${response.result.join(",")}]`,
          );
          return resolve(response);
        } catch (err) {
          this._logger.error(
            `Command ${command.id} failed to execute with error ${err}`,
          );
          return reject(err);
        }
      });
      connection.on("error", (err) => reject(err));
    });
  }

  private areConstrainsFulfilled(
    target: Yeelight,
    commandObjects: YeelightConnectionServiceCommand[],
  ) {
    const commands = commandObjects.map((it) => it.command);

    return commands.every((command) =>
      target.available_actions.includes(command),
    );
  }

  private mapCommandsToCommandsWithId(
    commands: YeelightConnectionServiceCommand[],
  ): YeelightConnectionServiceCommandWithId[] {
    return commands.map((command) => ({
      ...command,
      id: generateRandomId(this.MAX_SAFE_REQUEST_ID),
    }));
  }

  private mapCommandsAndResponsesToResults(
    commandWihId: YeelightConnectionServiceCommandWithId[],
    responses: YeelightRequestSuccessResponse[],
  ): YeelightConnectionServiceCommandResponse[] {
    const responsesObject = responses.reduce<{
      [key: string]: YeelightRequestSuccessResponse;
    }>((resultObject, response) => {
      resultObject[response.id] = response;
      return resultObject;
    }, {});

    return commandWihId.map((command) => ({
      command: command.command,
      params: command.params,
      response: responsesObject[command.id]?.result || [],
    }));
  }
}

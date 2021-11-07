import net from "net";
import { Logger } from "../Logger/Logger.js";
import { Yeelight } from "../YeelightRepository/types/Yeelight.js";

export interface YeelightConnectionServiceCommand {
  command: string;
  params?: Array<string | number>;
}

export class YeelightConnectionService {
  constructor(private readonly _logger: Logger) {}

  public async executeCommands(
    target: Yeelight,
    commands: YeelightConnectionServiceCommand[],
  ): Promise<void> {
    const actionLog = this._logger.beginAction(
      `Executing ${commands.length} on ${target.id}`,
    );

    if (!commands?.length) {
      this._logger.warn("Executed 0 commands on ${}");
      return;
    }

    if (!this.areConstrainsFulfilled(target, commands)) {
      throw new Error("constraint check failed");
    }

    let connection: net.Socket;

    try {
      connection = this.openTCPConnection(target);

      for (const command of commands) {
        await this.executeCommand(connection, command);
      }

      this._logger.endAction(actionLog);
    } catch (err) {
      throw err;
    } finally {
      this.closeTCPConnection(connection);
    }
  }

  private openTCPConnection(target: Yeelight): net.Socket {
    const client = new net.Socket();
    try {
      return client.connect(target.port, target.location);
    } catch (err) {
      client.destroy();
      throw err;
    }
  }

  private closeTCPConnection(connection: net.Socket) {
    connection.destroy();
  }

  private executeCommand(
    connection: net.Socket,
    command: YeelightConnectionServiceCommand,
  ): Promise<void> {
    const suffix: string = "\r\n";

    const rawCommandObject = {
      id: 0,
      method: command.command,
      params: command.params?.length ? command.params : undefined,
    };

    const rawCommandString = JSON.stringify(rawCommandObject) + suffix;
    this._logger.log(`Executing command ${rawCommandObject}`);
    this._logger.log(`Executing command ${rawCommandString}`);
    return new Promise<void>((resolve, reject) => {
      connection.write(rawCommandString, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
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
}

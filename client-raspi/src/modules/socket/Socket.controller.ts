import { Socket } from "socket.io-client";
import autoBind from "auto-bind";
import { Logger } from "../Logger/Logger";
import { YeelightService } from "../Yeelight/Yeelight.service";
import { Yeelight } from "../Yeelight/__types__/Yeelight";
import { SocketEvent } from "./__types__/SocketEvents";
import { ValidationError } from "../Yeelight/Errors/Validation.error.js";
import { BulbNotFoundError } from "../Yeelight/Errors/BulbNotFound.error.js";

type SocketEventObject = [name: SocketEvent, handler: SocketEventObjectHandler];

type SocketEventObjectHandler = (
  [...data]: any,
  callback?: SocketEventObjectHandlerCallback,
) => Promise<void>;

type SocketEventObjectHandlerCallback = (
  err: Error | undefined,
  [...data]?: any,
) => void;

type SocketEvents = {
  [key in SocketEvent]: SocketEventObject[1];
};

export class SocketController {
  constructor(
    private readonly _logger: Logger,
    private readonly _socket: Socket,
    private readonly _yeelightService: YeelightService,
  ) {
    autoBind(this);

    const socketEvents: SocketEvents = {
      getBulbs: this.handleGetAll,
      getBulb: this.handleGetBulb,
      executeCommand: async () => {},
    };

    Object.entries(socketEvents).forEach(([key, value]) => {
      this._socket.on(key, value);
    });
  }

  private async handleGetAll(
    cb?: SocketEventObjectHandlerCallback,
  ): Promise<void> {
    cb?.(undefined, await this._yeelightService.getAllBulbs());
  }

  private async handleGetBulb(
    bulbId?: string,
    cb?: SocketEventObjectHandlerCallback,
  ): Promise<void> {
    if (!bulbId) {
      cb?.(new ValidationError("bulbid", "defined"));
      return;
    }
    const bulbData = await this._yeelightService.findBulbById(bulbId);
    if (!bulbData) {
      cb?.(new BulbNotFoundError(bulbId));
      return;
    }

    cb?.(undefined, bulbData);
  }
}

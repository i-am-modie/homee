import { rejects } from "assert";
import { inject, injectable } from "inversify";
import { resolve } from "path";
import { Server, Socket } from "socket.io";
import { GetBulbsDtoResponse } from "../../client-dto/GetBulbs.dto";
import { SocketEvents } from "../../client-dto/SocketEvents.enum";
import { injectables } from "../ioc/injectables";
import { Bulb } from "../models/Bulb";
import { ClientService } from "./Client.service";

@injectable()
export class ClientServiceImplementation implements ClientService {
  constructor(
    @inject(injectables.Socket) private readonly socket: Server,
    @inject(injectables.SocketList)
    private readonly socketList: Map<string, Socket>
  ) {}

  public getBulbs(roomId: string): Promise<Bulb[]> {
    console.log(`getting bulbs for ${roomId}`);
    const deviceSocket = this.socketList.get(roomId);
    if (!deviceSocket) {
      throw new Error("no connection");
    }
    return new Promise((resolve, rejects) => {
      deviceSocket.emit(
        SocketEvents.GET_BULBS,
        {},
        (err: Error, bulbs: GetBulbsDtoResponse) => {
          if (err) {
            rejects(err);
          }

          resolve(bulbs.bulbs as unknown as Bulb[]);
        }
      );
    });
  }
}

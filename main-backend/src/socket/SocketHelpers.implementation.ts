import { inject, injectable } from "inversify";
import { Server } from "socket.io";
import { injectables } from "../ioc/injectables";
import { SocketHelpers } from "./SocketHelpers";

@injectable()
export class SocketHelpersImplementation implements SocketHelpers {
  constructor(@inject(injectables.Socket) private readonly socket: Server) {}

  getUsersInRoomCount(socketName: string): number {
    return this.socket.sockets.adapter.rooms.get(socketName)?.size || 0;
  }
}

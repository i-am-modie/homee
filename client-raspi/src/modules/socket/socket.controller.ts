import { Socket } from "socket.io-client";

export class socketController {
  constructor(private readonly _socket: Socket) {}
}

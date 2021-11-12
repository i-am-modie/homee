import { io, Socket } from "socket.io-client";

export const createSocketClient = (url: string): Socket => io(url);

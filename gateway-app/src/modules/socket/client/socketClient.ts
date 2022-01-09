import { io, Socket } from "socket.io-client";

export const createSocketClient = (url: string, token: string): Socket => {
  return io(url, {
    auth: {
      token: `Bearer ${token}`,
    },
  });
};

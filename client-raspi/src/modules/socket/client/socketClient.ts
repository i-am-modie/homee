import { io, Socket } from "socket.io-client";

export const createSocketClient = (url: string, token: string): Socket => {
  console.log("connecting to", url, token);
  return io(url, {
    auth: {
      token: `Bearer ${token}`,
    },
  });
};

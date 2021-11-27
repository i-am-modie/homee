import { Socket } from "socket.io";
import { verifyToken } from "../socketClientJwtHelper";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;
  try {
    verifyToken(token);
    next();
  } catch (err) {
    socket.disconnect();
    next(new Error("Auth failed"));
  }
};

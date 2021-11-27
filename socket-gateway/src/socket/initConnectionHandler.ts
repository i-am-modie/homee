import { PrismaClient } from ".prisma/client";
import { Socket } from "socket.io";
import { verifyToken } from "./socketClientJwtHelper";

export const initConnectionHandler = async (
  socket: Socket,
  prisma: PrismaClient
) => {
  const token = socket?.handshake?.auth?.token;

  try {
    const { userId } = verifyToken(token);
    const room = await prisma.room.findUnique({
      where: {
        userId,
      },
    });

    if (!room) {
      console.log(`no room for user ${userId}`);
      throw new Error(`no room for user ${userId}`);
    }
    socket.join(room.room);
    console.log(`socket ${socket.id} joined room ${room.room}`);
  } catch (err) {
    console.log(err);
    console.log(`failed to authenticate ${token}`);
    socket.disconnect();
    return;
  }
};

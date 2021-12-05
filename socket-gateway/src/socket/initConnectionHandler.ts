import { PrismaClient } from ".prisma/client";
import { Server, Socket } from "socket.io";
import { verifyToken } from "./socketClientJwtHelper";

export const initConnectionHandler = async (
  io: Server,
  socket: Socket,
  prisma: PrismaClient,
  socketLists: Map<string, Socket>
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
    const alreadyConnectedUsersCount =
      io.sockets.adapter.rooms.get(room.room)?.size ?? 0;
    if (alreadyConnectedUsersCount > 0) {
      console.log(
        "room is already full disconnect all your devices and try again"
      );
      throw new Error(
        "room is already full disconnect all your devices and try again"
      );
    }

    (socket as any).user = { id: userId, room: room.room };
    socket.join(room.room);
    socketLists.set(room.room, socket);
    console.log(`socket ${socket.id} joined room ${room.room}`);
  } catch (err) {
    console.log(err);
    console.log(`failed to authenticate ${token}`);
    socket.disconnect();
    return;
  }
};

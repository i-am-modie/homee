import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "./src/helpers/socketClientJwtHelper";
import { randomUUID } from "crypto";
import { AvailableCommands } from "./client-dto/AvailableCommands";
import { ExecuteCommandPayload } from "./client-dto/ExecuteCommand.dto";

const port = process.env.PORT || 6000;

let app = express();
const prisma = new PrismaClient();

app.use(cors());
let server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

let io = new Server(server, {
  cors: {
    origin: "*",
    methods: "*",
  },
});

io.use(async (socket, next) => {
  console.log("in auth middleware");
  const token = socket.handshake.auth.token;
  try {
    verifyToken(token);
    console.log("passed auth middleware");
    next();
  } catch (err) {
    socket.disconnect();
    next(new Error("Auth failed"));
  }
});
io.on("connection", async (socket) => {
  const token = socket.handshake.auth.token;
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

  console.log("connected", socket.handshake.auth?.token);

  // socket.emit("getBulb", { bulbId: "dupa" }, (err?: string, data?: any) => {
  //   if (err) {
  //     console.log("error", err);
  //   }
  // });
  socket.emit(
    "getBulbs",
    { bulbId: "0x0000000007e7a51b" },
    (err?: string, data?: any) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("sucess", data);
      }
    }
  );
  // socket.emit(
  //   "getBulb",
  //   { bulbId: "0x0000000007e7a51b" },
  //   (err?: string, data?: any) => {
  //     if (err) {
  //       console.log("error", err);
  //     } else {
  //       console.log("sucess", data);
  //     }
  //   }
  // );

  socket.emit(
    "executeCommand",
    {
      bulbId: "0x0000000007e7a51b",
      command: AvailableCommands.SET_BRIGHT,
      params: [100],
    } as ExecuteCommandPayload,
    (err?: string, data?: any) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("sucess", data);
      }
    }
  );
  // setInterval(() => {
  //   socket.emit("getBulbs", (data: any) => console.log(data));
  // }, 5000);
});

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

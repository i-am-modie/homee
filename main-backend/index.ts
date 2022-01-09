import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import http from "http";
import "reflect-metadata";
import { Server, Socket } from "socket.io";
import { AvailableCommands } from "./client-dto/AvailableCommands";
import { ExecuteCommandPayload } from "./client-dto/ExecuteCommand.dto";
import { registerControllers } from "./src/helpers/registerControllers";
import { initContainer } from "./src/ioc/init";
import { injectables } from "./src/ioc/injectables";
import { initConnectionHandler } from "./src/socket/initConnectionHandler";
import { socketAuthMiddleware } from "./src/socket/middlewares/socketAuthMiddleware";

const port = process.env.PORT || 5000;

let app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

const prisma = new PrismaClient();
const container = initContainer(prisma, io, app);
const socketsList = container.get<Map<string, Socket>>(injectables.SocketList);
registerControllers(container);

io.use(socketAuthMiddleware);
io.on("connection", async (socket) => {
  await initConnectionHandler(io, socket, prisma, socketsList);

  socket.on("disconnect", async () => {
    const socketRoom = (socket as any).user?.room;

    if (!socketRoom) {
      return;
    }
    socketsList.delete(socketRoom);
  });
});

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

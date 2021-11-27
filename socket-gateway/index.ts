import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import http from "http";
import "reflect-metadata";
import { Server } from "socket.io";
import { registerControllers } from "./src/helpers/registerControllers";
import { initContainer } from "./src/ioc/init";
import { initConnectionHandler } from "./src/socket/initConnectionHandler";
import { socketAuthMiddleware } from "./src/socket/middlewares/socketAuthMiddleware";

const port = process.env.PORT || 6000;

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

registerControllers(container);

io.use(socketAuthMiddleware);
io.on("connection", async (socket) => {
  await initConnectionHandler(socket, prisma);

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

  // socket.emit(
  //   "executeCommand",
  //   {
  //     bulbId: "0x0000000007e7a51b",
  //     command: AvailableCommands.SET_BRIGHT,
  //     params: [100],
  //   } as ExecuteCommandPayload,
  //   (err?: string, data?: any) => {
  //     if (err) {
  //       console.log("error", err);
  //     } else {
  //       console.log("sucess", data);
  //     }
  //   }
  // );
  // setInterval(() => {
  //   socket.emit("getBulbs", (data: any) => console.log(data));
  // }, 5000);
});

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

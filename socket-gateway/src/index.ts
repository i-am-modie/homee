import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const port = process.env.PORT || 6000;

let app = express();

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

io.on("connection", (socket) => {
  console.log("connected", socket.handshake.auth?.token);

  socket.emit("getBulb", "dupa", (err?: Error, data?: any) => {
    if (err) {
      console.log("error", err);
    }
  });
  socket.emit("getBulb", "0x0000000007e7a51b", (err?: Error, data?: any) => {
    if (err) {
      console.log("error", err);
    } else {
      console.log("sucess", data);
    }
  });
  // setInterval(() => {
  //   socket.emit("getBulbs", (data: any) => console.log(data));
  // }, 5000);
});

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

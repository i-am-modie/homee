import { PrismaClient } from ".prisma/client";
import { Container } from "inversify";
import { Server } from "socket.io";
import { Express } from "express";
import { injectables } from "./injectables";
import { SocketHelpers } from "../socket/SocketHelpers";
import { SocketHelpersImplementation } from "../socket/SocketHelpers.implementation";
import { CryptoHelpers } from "../crypto/CryptoHelpers";
import { CryptoHelpersImplementation } from "../crypto/CryptoHelpers.implementation";
import { JWTHelper } from "../jwt/JWTHelper";
import { UserController } from "../user/User.controller";
import { JWTHelperImplementation } from "../jwt/JWTHelper.implementation";
import { DeviceController } from "../device/Device.controller";

const initContainer = (prisma: PrismaClient, io: Server, app: Express) => {
  const containerToInit = new Container();
  containerToInit
    .bind<PrismaClient>(injectables.Prisma)
    .toDynamicValue(() => prisma);
  containerToInit.bind<Server>(injectables.Socket).toDynamicValue(() => io);
  containerToInit
    .bind<Express>(injectables.HttpServer)
    .toDynamicValue(() => app);
  containerToInit
    .bind<SocketHelpers>(injectables.SocketHelpers)
    .to(SocketHelpersImplementation);
  containerToInit
    .bind<CryptoHelpers>(injectables.CryptoHelpers)
    .to(CryptoHelpersImplementation);
  containerToInit
    .bind<JWTHelper>(injectables.JWTHelper)
    .to(JWTHelperImplementation);

  containerToInit
    .bind<{}>(injectables.controllers.UserController)
    .to(UserController);
  containerToInit
    .bind<{}>(injectables.controllers.DeviceController)
    .to(DeviceController);
  return containerToInit;
};

export { initContainer };

export const injectables = {
  Prisma: Symbol.for("Prisma"),
  Socket: Symbol.for("Socket"),
  SocketList: Symbol.for("SocketList"),
  SocketHelpers: Symbol.for("SocketHelpers"),
  HttpServer: Symbol.for("HttpServer"),
  CryptoHelpers: Symbol.for("CryptoHelpers"),
  JWTHelper: Symbol.for("JWTHelper"),
  ClientService: Symbol.for("ClientServiceImplementation"),
  controllers: {
    UserController: Symbol.for("UserController"),
    DeviceController: Symbol.for("DeviceController"),
    BulbController: Symbol.for("BulbController"),
  },
};

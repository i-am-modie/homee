export const injectables = {
  Prisma: Symbol.for("Prisma"),
  Socket: Symbol.for("Socket"),
  SocketHelpers: Symbol.for("SocketHelpers"),
  HttpServer: Symbol.for("HttpServer"),
  CryptoHelpers: Symbol.for("CryptoHelpers"),
  JWTHelper: Symbol.for("JWTHelper"),
  controllers: {
    UserController: Symbol.for("UserController"),
    DeviceController: Symbol.for("DeviceController"),
  },
};

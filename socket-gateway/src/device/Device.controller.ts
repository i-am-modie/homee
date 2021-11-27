import { PrismaClient } from "@prisma/client";
import autoBind from "auto-bind";
import { Express, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { nanoid } from "nanoid";
import { isLoggedIn } from "../auth/isLoggedIn";
import { LoggedRequest } from "../auth/LoggedRequest";
import { CryptoHelpers } from "../crypto/CryptoHelpers";
import { injectables } from "../ioc/injectables";
import { JWTHelper } from "../jwt/JWTHelper";

@injectable()
export class DeviceController {
  public readonly prefix = "/devices";
  constructor(
    @inject(injectables.HttpServer) private readonly http: Express,
    @inject(injectables.Prisma) private readonly db: PrismaClient,
    @inject(injectables.CryptoHelpers)
    private readonly cryptoHelpers: CryptoHelpers,
    @inject(injectables.JWTHelper)
    private readonly JWTHelper: JWTHelper
  ) {
    console.log("registering device endpoints");
    autoBind(this);
    http.post(
      this.prefixedUrl(""),
      isLoggedIn(this.JWTHelper),
      this.handleNewDevice
    );
  }
  private async handleNewDevice(req: Request, res: Response) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;

    const room = await this.db.room.findUnique({ where: { userId } });
    if (!room) {
      await this.db.room.create({
        data: {
          room: nanoid(),
          userId,
        },
      });
    }

    res.send(
      this.JWTHelper.generateDeviceToken({
        userId: loggedReq.user.userId,
      })
    );
  }
  private prefixedUrl(url: string): string {
    return `${this.prefix}${url}`;
  }
}

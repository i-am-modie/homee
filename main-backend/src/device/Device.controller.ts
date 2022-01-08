import { PrismaClient } from "@prisma/client";
import autoBind from "auto-bind";
import { Express, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { nanoid } from "nanoid";
import { Server } from "socket.io";
import { isLoggedIn } from "../auth/isLoggedIn";
import { LoggedRequest } from "../auth/LoggedRequest";
import { ClientService } from "../client/Client.service";
import { injectables } from "../ioc/injectables";
import { JWTHelper } from "../jwt/JWTHelper";
import { generateToken } from "../socket/socketClientJwtHelper";
import { SocketHelpers } from "../socket/SocketHelpers";
import { RegenerateDeviceTokenResponseBodyDto } from "./dto/RegenerateDeviceToken.dto";

@injectable()
export class DeviceController {
  public readonly prefix = "/devices";
  constructor(
    @inject(injectables.HttpServer) private readonly http: Express,
    @inject(injectables.Prisma) private readonly db: PrismaClient,
    @inject(injectables.Socket) private readonly socket: Server,
    @inject(injectables.SocketHelpers)
    private readonly socketHelpers: SocketHelpers,
    @inject(injectables.ClientService)
    private readonly clientService: ClientService,
    @inject(injectables.JWTHelper)
    private readonly JWTHelper: JWTHelper
  ) {
    console.log("registering device endpoints");
    autoBind(this);

    http.get(
      this.prefixedUrl("/status"),
      isLoggedIn(this.JWTHelper),
      this.handleGetDeviceStatus
    );

    http.post(
      this.prefixedUrl("/token/regenerate"),
      isLoggedIn(this.JWTHelper),
      this.handleRegenerateDeviceToken
    );
  }

  private async createRoomIfNotExist(userId: number) {
    const room = await this.db.room.findUnique({ where: { userId } });
    if (!room) {
      await this.db.room.create({
        data: {
          room: nanoid(),
          userId,
        },
      });
    }
  }

  private async handleGetDeviceStatus(req: Request, res: Response) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;

    const room = await this.db.room.findUnique({ where: { userId } });
    if (!room) {
      return res.send({
        status: false,
      });
    }

    const roomSubscribers = this.socketHelpers.getUsersInRoomCount(room.room);
    const isDeviceAvailable = roomSubscribers > 0;

    return res.send({
      status: isDeviceAvailable,
    });
  }

  private async handleRegenerateDeviceToken(req: Request, res: Response) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;

    await this.db.token.deleteMany({
      where: {
        userId,
      },
    });

    const deviceToken = generateToken({
      userId,
    });

    await this.db.token.create({
      data: {
        token: deviceToken,
        userId,
      },
    });
    await this.createRoomIfNotExist(userId);
    const response: RegenerateDeviceTokenResponseBodyDto = {
      token: deviceToken,
    };

    return res.send(response);
  }
  private prefixedUrl(url: string): string {
    return `${this.prefix}${url}`;
  }
}

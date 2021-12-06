import { PrismaClient } from "@prisma/client";
import autoBind from "auto-bind";
import { Express, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { Server } from "socket.io";
import { isLoggedIn } from "../auth/isLoggedIn";
import { LoggedRequest } from "../auth/LoggedRequest";
import { ClientService } from "../client/Client.service";
import { injectables } from "../ioc/injectables";
import { JWTHelper } from "../jwt/JWTHelper";
import { Bulb } from "../models/Bulb";
import { YeelightMode } from "../models/YeelightMode.enum";
import { YeelightModel } from "../models/YeelightModel.enum";
import { SocketHelpers } from "../socket/SocketHelpers";
import {
  RefetchBulbsResponseBodyDto
} from "./dtos/RefetchBulbs.dto";

@injectable()
export class BulbController {
  public readonly prefix = "/bulbs";
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
    console.log("registering bulbs endpoints");
    autoBind(this);

    http.get(
      this.prefixedUrl("/"),
      isLoggedIn(this.JWTHelper),
      this.handleRefetchDevices
    );
  }

  private async handleRefetchDevices(
    req: Request,
    res: Response<RefetchBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    try {
      const room = await this.db.room.findUnique({ where: { userId } });
      if (!room) {
        return res.send({ bulbs: [] });
      }

      const fetchedBulbs: Bulb[] = await this.clientService.getBulbs(room.room);

      await Promise.all(
        fetchedBulbs.map(async (bulb) => {
          console.log(JSON.stringify(bulb.available_actions).length);
          return this.db.bulb.upsert({
            where: {
              id: bulb.id,
            },
            update: {
              ...bulb,
              available_actions: JSON.stringify(bulb.available_actions),
              colorMode: +bulb.colorMode as YeelightMode,
            },
            create: {
              ...bulb,
              available_actions: JSON.stringify(bulb.available_actions),
              colorMode: +bulb.colorMode as YeelightMode,
              userId: userId,
            },
          });
        })
      );

      const allBulbsFromDb = await this.db.bulb.findMany({
        where: {
          userId,
        },
      });

      return res.send({
        bulbs: allBulbsFromDb.map((bulb) => ({
          ...bulb,
          name: bulb.name || undefined,
          colorMode: bulb.colorMode as YeelightMode,
          model: bulb.model as YeelightModel,
          available_actions: JSON.parse(bulb.available_actions),
        })),
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private prefixedUrl(url: string): string {
    return `${this.prefix}${url}`;
  }
}

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
import { AvailableCommands } from "../models/AvailableCommands";
import { Bulb, BulbWithStatus } from "../models/Bulb";
import { YeelightMode } from "../models/YeelightMode.enum";
import { YeelightModel } from "../models/YeelightModel.enum";
import { SocketHelpers } from "../socket/SocketHelpers";
import { GetBulbResponseBodyDto } from "./dtos/GetBulb.dto";
import { GetBulbsResponseBodyDto } from "./dtos/GetBulbs.dto";

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
      this.handleGetDevices
    );

    http.get(
      this.prefixedUrl("/:id"),
      isLoggedIn(this.JWTHelper),
      this.handleGetDevice
    );

    http.patch(
      this.prefixedUrl("/:id/name"),
      isLoggedIn(this.JWTHelper),
      this.handleNameChange
    );

    http.post(
      this.prefixedUrl("/:id/power"),
      isLoggedIn(this.JWTHelper),
      this.handleSwitchPower
    );

    http.post(
      this.prefixedUrl("/:id/brightness"),
      isLoggedIn(this.JWTHelper),
      this.handleSetBright
    );

    http.post(
      this.prefixedUrl("/:id/rgb"),
      isLoggedIn(this.JWTHelper),
      this.handleSetRGB
    );

    http.post(
      this.prefixedUrl("/:id/ct"),
      isLoggedIn(this.JWTHelper),
      this.handleSetCT
    );

    http.delete(
      this.prefixedUrl("/:id"),
      isLoggedIn(this.JWTHelper),
      this.handleRemoveBulb
    );
  }

  private async handleGetDevices(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    try {
      const room = await this.db.room.findUnique({ where: { userId } });
      if (!room) {
        return res.send({ bulbs: [] });
      }

      const fetchedBulbs: Bulb[] = await this.clientService.getBulbs(room.room);
      console.log("fb", fetchedBulbs);

      await Promise.all(
        fetchedBulbs.map(async ({ power, ...bulb }) => {
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
          power:
            fetchedBulbs.find((fbulb) => fbulb.id === bulb.id)?.power || false,
        })),
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private async handleGetDevice(
    req: Request,
    res: Response<GetBulbResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest<{}, { id?: string }>;
    const userId = loggedReq.user.userId;
    const bulbId = loggedReq.params.id;
    try {
      const room = await this.db.room.findUnique({ where: { userId } });
      if (!room) {
        return res.status(404);
      }
      if (!bulbId) {
        return res.status(400);
      }

      const bulb = await this.db.bulb.findFirst({
        where: {
          id: bulbId,
          userId,
        },
      });

      if (!bulb) {
        return res.status(404);
      }

      const fetchedBulb = await this.clientService.getBulb(room.room, bulbId);

      if (!fetchedBulb) {
        return res.send({
          ...bulb,
          name: bulb.name || "",
          model: bulb.model as YeelightModel,
          available_actions: bulb.available_actions.split(
            ","
          ) as AvailableCommands[],
          status: false,
          power: false,
        });
      }
      const { power, status, ...fetchedBulbWithoutState } = fetchedBulb;

      await this.db.bulb.update({
        where: {
          id: bulbId,
        },
        data: {
          ...fetchedBulbWithoutState,
          available_actions: fetchedBulb.available_actions.join(","),
        },
      });

      return res.send({
        ...fetchedBulb,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occurred");
    }
  }

  private async handleNameChange(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    try {
      const room = await this.db.room.findUnique({ where: { userId } });
      if (!room) {
        return res.sendStatus(400);
      }

      const bulb = await this.db.bulb.findFirst({
        where: {
          userId,
          id: req.params.id,
        },
      });
      if (!bulb) {
        return res.sendStatus(400);
      }

      await this.clientService.renameBulb(
        room.room,
        req.params.id,
        req.body.name
      );

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private async handleSwitchPower(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    if (req.body.power === undefined || typeof req.body.power !== "boolean") {
      return res.sendStatus(400);
    }

    try {
      const room = await this.getRoomForUser(userId);
      if (!room) {
        return res.sendStatus(400);
      }

      const bulb = await this.getBulbForUser(userId, req.params.id);
      if (!bulb) {
        return res.sendStatus(400);
      }

      await this.clientService.setBulbPower(
        room.room,
        req.params.id,
        req.body.power
      );

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private async handleSetBright(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    const brightness = req.body.brightness;

    if (
      brightness === undefined ||
      typeof brightness !== "number" ||
      brightness < 0 ||
      brightness > 100
    ) {
      return res.sendStatus(400);
    }

    try {
      const room = await this.getRoomForUser(userId);
      if (!room) {
        return res.sendStatus(400);
      }

      const bulb = await this.getBulbForUser(userId, req.params.id);
      if (!bulb) {
        return res.sendStatus(400);
      }

      await this.clientService.setBulbBrightness(
        room.room,
        req.params.id,
        brightness
      );

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private async handleSetRGB(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    const rgb = req.body.rgb;
    const lightness = req.body.lightness;

    if (
      rgb === undefined ||
      typeof rgb !== "number" ||
      rgb < 0 ||
      rgb > 16711680
    ) {
      return res.sendStatus(400);
    }
    if (
      lightness === undefined ||
      typeof lightness !== "number" ||
      lightness < 0 ||
      lightness > 100
    ) {
      return res.sendStatus(400);
    }

    try {
      const room = await this.getRoomForUser(userId);
      if (!room) {
        return res.sendStatus(400);
      }

      const bulb = await this.getBulbForUser(userId, req.params.id);
      if (!bulb) {
        return res.sendStatus(400);
      }

      await this.clientService.setBulbRGB(
        room.room,
        req.params.id,
        rgb >> 16,
        (rgb >> 8) & 255,
        rgb & 255,
        lightness
      );

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private async handleSetCT(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    const ct = req.body.ct;
    const lightness = req.body.lightness;

    if (ct === undefined || typeof ct !== "number" || ct < 1700 || ct > 6500) {
      return res.sendStatus(400);
    }
    if (
      lightness === undefined ||
      typeof lightness !== "number" ||
      lightness < 0 ||
      lightness > 100
    ) {
      return res.sendStatus(400);
    }

    try {
      const room = await this.getRoomForUser(userId);
      if (!room) {
        return res.sendStatus(400);
      }

      const bulb = await this.getBulbForUser(userId, req.params.id);
      if (!bulb) {
        return res.sendStatus(400);
      }

      await this.clientService.setBulbCT(
        room.room,
        req.params.id,
        ct,
        lightness
      );

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private async handleRemoveBulb(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    try {
      const { count } = await this.db.bulb.deleteMany({
        where: {
          id: req.params.id,
          userId,
        },
      });
      if (!count) {
        return res.sendStatus(404);
      }

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private getRoomForUser(userId: number) {
    return this.db.room.findUnique({ where: { userId } });
  }

  private getBulbForUser(userId: number, bulbId: string) {
    return this.db.bulb.findFirst({
      where: {
        userId,
        id: bulbId,
      },
    });
  }

  private prefixedUrl(url: string): string {
    return `${this.prefix}${url}`;
  }
}

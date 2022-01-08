import { PrismaClient, Bulb as BulbEntity } from "@prisma/client";
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
import {
  GetBulbsBulbsResponseBodyDto,
  GetBulbsResponseBodyDto,
} from "./dtos/GetBulbs.dto";

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
      this.prefixedUrl("/:id/share"),
      isLoggedIn(this.JWTHelper),
      this.shareBulb
    );

    http.delete(
      this.prefixedUrl("/:id/share"),
      isLoggedIn(this.JWTHelper),
      this.unshareBulb
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
      let fetchedBulbs: Bulb[] = [];
      if (room) {
        fetchedBulbs = await this.clientService.getBulbs(room.room);
      }

      console.log("fb", fetchedBulbs);

      await Promise.all(
        fetchedBulbs.map(async ({ power, ...bulb }) => {
          console.log(JSON.stringify(bulb.available_actions));
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

      const allOwnedBulbsFromDb = await this.db.bulb.findMany({
        where: {
          userId,
        },
        include: {
          sharedWith: {
            include: {
              user: true,
            },
          },
        },
      });

      const allSharedBulbsFromDb = await this.db.sharedBulbs.findMany({
        where: {
          userId,
        },
        include: {
          bulb: true,
        },
      });
      console.log("asbfd", allSharedBulbsFromDb);

      const allBulbsFromDb: Omit<GetBulbsBulbsResponseBodyDto, "power">[] = [
        ...allOwnedBulbsFromDb.map<Omit<GetBulbsBulbsResponseBodyDto, "power">>(
          (bulb) => ({
            ...bulb,
            name: bulb.name || undefined,
            sharedWith: bulb.sharedWith.map((shared) => shared.user.username),
            model: bulb.model as YeelightModel,
            available_actions: JSON.parse(bulb.available_actions),
            isShared: false,
          })
        ),
        ...allSharedBulbsFromDb.map<
          Omit<GetBulbsBulbsResponseBodyDto, "power">
        >((bulb) => ({
          ...bulb.bulb,
          name: bulb.bulb.name || undefined,
          sharedWith: [],
          model: bulb.bulb.model as YeelightModel,
          available_actions: bulb.bulb.available_actions.split(
            ","
          ) as AvailableCommands[],
          isShared: true,
        })),
      ];

      return res.send({
        bulbs: allBulbsFromDb.map((bulb) => ({
          ...bulb,
          colorMode: bulb.colorMode as YeelightMode,
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
      if (!bulbId) {
        return res.sendStatus(400);
      }
      const room = await this.getRoomForUser(userId, bulbId);
      if (!room) {
        return res.sendStatus(404);
      }

      const bulb = await this.getBulbForUser(userId, bulbId);

      if (!bulb) {
        return res.sendStatus(404);
      }

      console.log("getting bulb", room.room, bulbId);
      const fetchedBulb = await this.clientService.getBulb(room.room, bulbId);

      console.log("got bulb", fetchedBulb);
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
          isShared: bulb.userId !== userId,
          sharedWith:
            bulb.userId !== userId
              ? []
              : bulb.sharedWith.map((shared) => shared.user.username),
        });
      }
      const { power, status, ...fetchedBulbWithoutState } = fetchedBulb;

      await this.db.bulb.update({
        where: {
          id: bulbId,
        },
        data: {
          ...fetchedBulbWithoutState,
          available_actions: JSON.stringify(fetchedBulb.available_actions),
        },
      });

      return res.send({
        ...fetchedBulb,
        isShared: bulb.userId !== userId,
        sharedWith:
          bulb.userId !== userId
            ? []
            : bulb.sharedWith.map((shared) => shared.user.username),
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occurred");
    }
  }

  private async shareBulb(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    const bulbId = req.params.id;
    const usernameToShareTo = req.body.username;
    if (!usernameToShareTo) {
      return res.sendStatus(400);
    }

    const ownedBulb = await this.db.bulb.findFirst({
      where: {
        id: bulbId,
        userId,
      },
    });

    if (!ownedBulb) {
      return res.sendStatus(404);
    }

    const userToShareTo = await this.db.user.findFirst({
      where: { username: usernameToShareTo },
    });

    if (!userToShareTo) {
      return res.sendStatus(404);
    }

    await this.db.sharedBulbs.create({
      data: {
        bulbId: ownedBulb.id,
        userId: userToShareTo.userId,
      },
    });

    return res.sendStatus(200);
  }
  private async unshareBulb(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    const bulbId = req.params.id;
    const usernameToUnshare = req.body.username;
    if (!usernameToUnshare) {
      return res.sendStatus(400);
    }

    const ownedBulb = await this.db.bulb.findFirst({
      where: {
        id: bulbId,
        userId,
      },
    });

    if (!ownedBulb) {
      return res.sendStatus(404);
    }

    const userToUnshare = await this.db.user.findFirst({
      where: { username: usernameToUnshare },
    });

    if (!userToUnshare) {
      return res.sendStatus(404);
    }

    await this.db.sharedBulbs.delete({
      where: {
        userId_bulbId: {
          bulbId,
          userId: userToUnshare.userId,
        },
      },
    });
    return res.sendStatus(200);
  }

  private async handleNameChange(
    req: Request,
    res: Response<GetBulbsResponseBodyDto | string>
  ) {
    const loggedReq = req as LoggedRequest;
    const userId = loggedReq.user.userId;
    const bulbId = req.params.id;

    try {
      const room = await this.getRoomForUser(userId, bulbId);
      if (!room) {
        return res.sendStatus(400);
      }

      const bulb = await this.getBulbForUser(userId, bulbId);
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
      const room = await this.getRoomForUser(userId, req.params.id);
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
      const room = await this.getRoomForUser(userId, req.params.id);
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
      const room = await this.getRoomForUser(userId, req.params.id);
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
      const room = await this.getRoomForUser(userId, req.params.id);
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
    const bulbId = req.params.id
    try {
      const { count } = await this.db.bulb.deleteMany({
        where: {
          id: bulbId,
          userId,
        },
      });
      if(count){
        await this.db.sharedBulbs.deleteMany({
          where: {
            bulbId,
          }
        })
      }
      if (!count) {
        const { count: countOfShared } = await this.db.sharedBulbs.deleteMany({
          where: {
            bulbId,
            userId,
          },
        });
        if (!countOfShared) {
          return res.sendStatus(404);
        }
      }

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error occured");
    }
  }

  private async getRoomForUser(userId: number, bulbId: string) {
    const bulb = await this.db.bulb.findFirst({
      where: { id: bulbId },
      include: { sharedWith: true },
    });
    if (!bulb) {
      throw new Error("no bulb");
    }
    const bulbUsers = [bulb.userId, ...bulb.sharedWith.map((it) => it.userId)];
    if (!bulbUsers.includes(userId)) {
      throw new Error("no bulb");
    }
    return this.db.room.findUnique({ where: { userId: bulb.userId } });
  }

  private async getBulbForUser(userId: number, bulbId: string) {
    const ownedbulb = await this.db.bulb.findFirst({
      where: {
        userId,
        id: bulbId,
      },
      include: {
        sharedWith: {
          include: { user: true },
        },
      },
    });
    if (ownedbulb) {
      return ownedbulb;
    }

    console.log("looking for bulb for", userId, bulbId);
    const sharedBulb = await this.db.sharedBulbs.findFirst({
      where: {
        userId,
        bulbId,
      },
      include: {
        bulb: {
          include: {
            sharedWith: {
              include: { user: true },
            },
          },
        },
      },
    });
    return sharedBulb?.bulb;
  }

  private prefixedUrl(url: string): string {
    return `${this.prefix}${url}`;
  }
}

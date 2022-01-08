import { rejects } from "assert";
import { inject, injectable } from "inversify";
import { resolve } from "path";
import { Server, Socket } from "socket.io";
import { GetBulbDtoResponse } from "../../client-dto/GetBulb.dto";
import { GetBulbsDtoResponse } from "../../client-dto/GetBulbs.dto";
import { SocketEvents } from "../../client-dto/SocketEvents.enum";
import { injectables } from "../ioc/injectables";
import { AvailableCommands } from "../models/AvailableCommands";
import { Bulb, BulbWithStatus } from "../models/Bulb";
import { ClientService } from "./Client.service";

@injectable()
export class ClientServiceImplementation implements ClientService {
  constructor(
    @inject(injectables.Socket) private readonly socket: Server,
    @inject(injectables.SocketList)
    private readonly socketList: Map<string, Socket>
  ) {}
  public setBulbCT(
    roomId: string,
    bulbId: string,
    ct: number,
    lightness: number
  ): Promise<void> {
    const deviceSocket = this.getDeviceSocket(roomId);

    return new Promise((resolve, rejects) => {
      deviceSocket.emit(
        SocketEvents.EXECUTE_COMMAND,
        {
          command: AvailableCommands.SET_CT,
          bulbId,
          params: [ct, lightness],
        },
        (err: Error, bulbs: GetBulbsDtoResponse) => {
          const timeout = setTimeout(() => {
            rejects("timeout");
          }, 5000);
          if (err) {
            clearTimeout(timeout);
            return rejects(err);
          }

          clearTimeout(timeout);
          return resolve();
        }
      );
    });
  }
  public setBulbRGB(
    roomId: string,
    bulbId: string,
    red: number,
    green: number,
    blue: number,
    lightness: number
  ): Promise<void> {
    const deviceSocket = this.getDeviceSocket(roomId);

    return new Promise((resolve, rejects) => {
      deviceSocket.emit(
        SocketEvents.EXECUTE_COMMAND,
        {
          command: AvailableCommands.SET_RGB,
          bulbId,
          params: [red, green, blue, lightness],
        },
        (err: Error, bulbs: GetBulbsDtoResponse) => {
          const timeout = setTimeout(() => {
            rejects("timeout");
          }, 5000);
          if (err) {
            clearTimeout(timeout);
            return rejects(err);
          }

          clearTimeout(timeout);
          return resolve();
        }
      );
    });
  }

  public setBulbBrightness(
    roomId: string,
    bulbId: string,
    brightness: number
  ): Promise<void> {
    const deviceSocket = this.getDeviceSocket(roomId);

    return new Promise((resolve, rejects) => {
      deviceSocket.emit(
        SocketEvents.EXECUTE_COMMAND,
        {
          command: AvailableCommands.SET_BRIGHT,
          bulbId,
          params: [brightness],
        },
        (err: Error, bulbs: GetBulbsDtoResponse) => {
          if (err) {
            rejects(err);
          }

          resolve();
        }
      );
    });
  }
  public setBulbPower(
    roomId: string,
    bulbId: string,
    on: boolean
  ): Promise<void> {
    const deviceSocket = this.getDeviceSocket(roomId);

    return new Promise((resolve, rejects) => {
      deviceSocket.emit(
        SocketEvents.EXECUTE_COMMAND,
        {
          command: AvailableCommands.SET_POWER,
          bulbId,
          params: [on],
        },
        (err: Error, bulbs: GetBulbsDtoResponse) => {
          if (err) {
            rejects(err);
          }

          resolve();
        }
      );
    });
  }
  public renameBulb(
    roomId: string,
    bulbId: string,
    name: string
  ): Promise<void> {
    const deviceSocket = this.getDeviceSocket(roomId);
    return new Promise((resolve, rejects) => {
      deviceSocket.emit(
        SocketEvents.EXECUTE_COMMAND,
        {
          command: AvailableCommands.SET_NAME,
          bulbId,
          params: [name],
        },
        (err: Error, bulbs: GetBulbsDtoResponse) => {
          if (err) {
            rejects(err);
          }

          resolve();
        }
      );
    });
  }

  public async getBulbs(roomId: string): Promise<Bulb[]> {
    console.log(`getting bulbs for ${roomId}`);
    try {
      const deviceSocket = this.getDeviceSocket(roomId);
      return new Promise((resolve, rejects) => {
        deviceSocket.emit(
          SocketEvents.GET_BULBS,
          {},
          (err: Error, bulbs: GetBulbsDtoResponse) => {
            if (err) {
              rejects(err);
            }

            resolve(bulbs.bulbs as unknown as Bulb[]);
          }
        );
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async getBulb(
    roomId: string,
    bulbId: string
  ): Promise<BulbWithStatus | undefined> {
    console.log(`getting bulb status for ${bulbId}`);
    try {
      const deviceSocket = this.getDeviceSocket(roomId);
      return new Promise((resolve, rejects) => {
        deviceSocket.emit(
          SocketEvents.GET_BULB,
          {
            bulbId,
          },
          (err: Error, bulb: GetBulbDtoResponse) => {
            console.log("got response");
            if (err) {
              rejects(err);
            }
            console.log(bulb);

            resolve({ ...bulb, colorMode: Number(bulb.colorMode) });
          }
        );
      });
    } catch (err) {
      return undefined;
    }
  }

  private getDeviceSocket(roomId: string) {
    const deviceSocket = this.socketList.get(roomId);
    if (!deviceSocket) {
      throw new Error("no connection");
    }
    return deviceSocket;
  }
}

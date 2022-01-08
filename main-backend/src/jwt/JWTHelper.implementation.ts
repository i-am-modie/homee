import { addHours } from "date-fns";
import { injectable } from "inversify";
import { sign, verify } from "jsonwebtoken";
import { getCurrentDate } from "../helpers/getCurrentDate";
import { DeviceTokenPayload } from "./DeviceTokenPayload";
import { JWTHelper } from "./JWTHelper";
import { TokenPayload } from "./TokenPayload";

@injectable()
export class JWTHelperImplementation implements JWTHelper {
  public generateDeviceToken(payload: DeviceTokenPayload): string {
    return sign(payload, process.env.SOCKET_CLIENT_JWT_SECRET!);
  }
  public verifyToken(tokenWithPrefix: string | undefined): TokenPayload {
    if (!tokenWithPrefix) {
      throw new Error("No token");
    }

    const [, token] = tokenWithPrefix.split(" ");

    if (!token) {
      throw new Error("No token");
    }

    return verify(token, process.env.APP_JWT_SECRET!) as {
      userId: number;
    };
  }
  public generateToken(payload: TokenPayload): string {
    return sign(
      { ...payload, exp: addHours(getCurrentDate(), 24).valueOf() / 1000 },
      process.env.APP_JWT_SECRET!
    );
  }
}

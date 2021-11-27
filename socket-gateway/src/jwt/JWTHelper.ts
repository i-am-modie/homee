import { DeviceTokenPayload } from "./DeviceTokenPayload";
import { TokenPayload } from "./TokenPayload";

export interface JWTHelper {
  verifyToken(token: string | undefined): TokenPayload;
  generateToken(payload: TokenPayload): string;
  generateDeviceToken(payload: DeviceTokenPayload): string;
}

import { sign, verify } from "jsonwebtoken";
import { TokenPayload } from "../jwt/TokenPayload";
export const verifyToken = (
  tokenWithPrefix: string | undefined
): { userId: number } => {
  if (!tokenWithPrefix) {
    throw new Error("No token");
  }

  const [, token] = tokenWithPrefix.split(" ");

  if (!token) {
    throw new Error("No token");
  }

  return verify(token, process.env.SOCKET_CLIENT_JWT_SECRET!) as {
    userId: number;
  };
};

export const generateToken = (payload: TokenPayload): string => {
  return sign({ ...payload }, process.env.SOCKET_CLIENT_JWT_SECRET!);
};

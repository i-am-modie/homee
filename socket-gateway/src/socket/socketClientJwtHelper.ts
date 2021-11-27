import { verify } from "jsonwebtoken";
export const verifyToken = (tokenWithPrefix: string): { userId: number } => {
  const [, token] = tokenWithPrefix.split(" ");

  if (!token) {
    throw new Error("No token");
  }

  return verify(token, process.env.SOCKET_CLIENT_JWT_SECRET!) as {
    userId: number;
  };
};

import { NextFunction, Request, Response } from "express";
import { JWTHelper } from "../jwt/JWTHelper";

export const isLoggedIn =
  (jwtHelper: JWTHelper) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedToken = jwtHelper.verifyToken(req.headers.authorization);

      (req as any).user = decodedToken;
      return next();
    } catch (err) {
      res.status(400).send(err);
    }
  };

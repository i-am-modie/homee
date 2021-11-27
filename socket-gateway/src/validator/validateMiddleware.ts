import { ClassConstructor } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { convertAndValidate } from "./convertAndValidate";

export const validateMiddleware =
  (type: ClassConstructor<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = await convertAndValidate(req.body, type);
      req.body = validatedBody;
      return next()
    } catch (err) {
      res.status(400).send(err);
    }
  };

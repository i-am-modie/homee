import { Request } from "express";
import { TokenPayload } from "../jwt/TokenPayload";

export type LoggedRequest<T = {}, P={}> = Request<P, {}, T> & { user: TokenPayload };

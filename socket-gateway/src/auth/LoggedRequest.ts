import { Request } from "express";
import { TokenPayload } from "../jwt/TokenPayload";

export type LoggedRequest<T = {}> = Request<{}, {}, T> & { user: TokenPayload };

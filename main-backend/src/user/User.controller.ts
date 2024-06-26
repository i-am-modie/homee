import { PrismaClient } from ".prisma/client";
import autoBind from "auto-bind";
import { Express, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { isLoggedIn } from "../auth/isLoggedIn";
import { LoggedRequest } from "../auth/LoggedRequest";
import { CryptoHelpers } from "../crypto/CryptoHelpers";
import { injectables } from "../ioc/injectables";
import { JWTHelper } from "../jwt/JWTHelper";
import { validateMiddleware } from "../validator/validateMiddleware";
import { MeResponseBodyDto } from "./dtos/Me.dto";
import { RegisterUserRequestBodyDto } from "./dtos/RegisterUser.dto";
import { UserLoginRequestBodyDto } from "./dtos/UserLogin.dto";

@injectable()
export class UserController {
  public readonly prefix = "/users";
  constructor(
    @inject(injectables.HttpServer) private readonly http: Express,
    @inject(injectables.Prisma) private readonly db: PrismaClient,
    @inject(injectables.CryptoHelpers)
    private readonly cryptoHelpers: CryptoHelpers,
    @inject(injectables.JWTHelper)
    private readonly JWTHelper: JWTHelper
  ) {
    console.log("registering user endpoints");
    autoBind(this);
    http.post(
      this.prefixedUrl("/login"),
      validateMiddleware(UserLoginRequestBodyDto),
      this.handleLogin
    );
    http.post(
      this.prefixedUrl("/register"),
      validateMiddleware(RegisterUserRequestBodyDto),
      this.handleRegister
    );
    http.get(
      this.prefixedUrl("/me"),
      isLoggedIn(this.JWTHelper),
      this.handleMe
    );
  }

  private async handleLogin(
    req: Request<{}, {}, UserLoginRequestBodyDto>,
    res: Response
  ) {
    const user = await this.db.user.findUnique({
      where: { username: req.body.username },
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid password or login" });
    }

    const isPasswordMatching = await this.cryptoHelpers.verifyPassword(
      user.password,
      req.body.password
    );

    if (!isPasswordMatching) {
      return res.status(400).send({ message: "Invalid password or login" });
    }

    const hashedPassword = await this.cryptoHelpers.hashPassword(
      req.body.password
    );

    res.send(this.JWTHelper.generateToken({ userId: user.userId }));
  }

  private async handleRegister(
    req: Request<{}, {}, RegisterUserRequestBodyDto>,
    res: Response
  ) {
    const possibleDuplicate = await this.db.user.findUnique({
      where: { username: req.body.username },
    });

    if (!!possibleDuplicate) {
      return res.status(400).send({ message: "username already taken" });
    }

    const hashedPassword = await this.cryptoHelpers.hashPassword(
      req.body.password
    );

    const createdUser = await this.db.user.create({
      data: {
        password: hashedPassword,
        username: req.body.username,
      },
    });

    res.send(this.JWTHelper.generateToken({ userId: createdUser.userId }));
  }

  private async handleMe(req: Request, res: Response) {
    const loggedReq = req as LoggedRequest;
    const user = await this.db.user.findUnique({
      where: { userId: loggedReq.user.userId },
    });

    if (!user) {
      return res.status(500).send({ message: "Unknown User" });
    }

    const response: MeResponseBodyDto = {
      userId: user.userId,
      username: user.username,
    };

    res.send(response);
  }

  private prefixedUrl(url: string): string {
    return `${this.prefix}${url}`;
  }
}

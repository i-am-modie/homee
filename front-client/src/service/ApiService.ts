import autoBind from "auto-bind";
import axios from "axios";
import { config } from "../constants/config";
import { MeResponseBodyDto } from "./dtos/Me.dto";
import { RefetchBulbsResponseBodyDto } from "./dtos/RefetchBulbs.dto";
import { RegenerateDeviceTokenResponseBodyDto } from "./dtos/RegenerateDeviceToken.dto";

export type RestMethod = "GET" | "POST";
export class ApiService {
  private token: string | undefined;

  constructor(token: string | undefined) {
    this.token = token;
    autoBind(this);
  }

  public updateToken(token: string | undefined) {
    this.token = token;
  }

  public refetchBulbs(): Promise<RefetchBulbsResponseBodyDto> {
    return this.callApiWithAuthorization<RefetchBulbsResponseBodyDto>(
      "GET",
      "/bulbs",
      {}
    );
  }

  public login(username: string, password: string): Promise<string> {
    return this.callApi<string>("POST", "/users/login", {
      username,
      password,
    });
  }

  public register(username: string, password: string): Promise<string> {
    return this.callApi<string>("POST", "/users/register", {
      username,
      password,
    });
  }

  public me(): Promise<MeResponseBodyDto> {
    return this.callApiWithAuthorization<MeResponseBodyDto>(
      "GET",
      "/users/me",
      {}
    );
  }

  public regenerateDeviceToken(): Promise<RegenerateDeviceTokenResponseBodyDto> {
    return this.callApiWithAuthorization<RegenerateDeviceTokenResponseBodyDto>(
      "POST",
      "/devices/token/regenerate",
      {}
    );
  }

  private async callApi<TResponseBody extends {}, TReqBody = {}>(
    method: RestMethod,
    path: string,
    body: TReqBody
  ): Promise<TResponseBody> {
    try {
      const response = await axios({
        url: this.getUrl(path),
        method,
        data: body,
      });
      return response.data;
    } catch (error) {
      const err = error as any;
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error("Unknown Error");
    }
  }

  private async callApiWithAuthorization<
    TResponseBody extends {},
    TReqBody = {}
  >(method: RestMethod, path: string, body: TReqBody): Promise<TResponseBody> {
    const response = await axios({
      url: this.getUrl(path),
      method,
      data: body,
      headers: { authorization: `Bearer ${this.token}` },
    });
    return response.data;
  }

  private getUrl(path: string) {
    return `${config.url}${path}`;
  }
}

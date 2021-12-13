import autoBind from "auto-bind";
import axios, { AxiosError } from "axios";
import { config } from "../constants/config";
import { MeResponseBodyDto } from "./dtos/Me.dto";
import { GetBulbsResponseBodyDto } from "./dtos/GetBulbs.dto";
import { RegenerateDeviceTokenResponseBodyDto } from "./dtos/RegenerateDeviceToken.dto";
import { GetBulbResponseBodyDto } from "./dtos/GetBulb.dto";

export type RestMethod = "GET" | "POST" | "PATCH" | "DELETE";
export class ApiService {
  private token: string | undefined;
  private logout: () => void;

  constructor(token: string | undefined, logout: () => void) {
    this.token = token;
    this.logout = logout;
    autoBind(this);
  }

  public updateToken(token: string | undefined) {
    this.token = token;
  }
  public updateLogout(logout: () => void) {
    this.logout = logout;
  }

  public getBulbs(): Promise<GetBulbsResponseBodyDto> {
    return this.callApiWithAuthorization<GetBulbsResponseBodyDto>(
      "GET",
      "/bulbs",
      {}
    );
  }

  public getBulb(bulbId: string): Promise<GetBulbResponseBodyDto> {
    return this.callApiWithAuthorization<GetBulbResponseBodyDto>(
      "GET",
      `/bulbs/${bulbId}`,
      {}
    );
  }

  public setBulbPower(bulbId: string, power: boolean): Promise<{}> {
    return this.callApiWithAuthorization<{}>("POST", `/bulbs/${bulbId}/power`, {
      power,
    });
  }

  public setBulbBrightness(bulbId: string, brightness: number): Promise<{}> {
    return this.callApiWithAuthorization<{}>(
      "POST",
      `/bulbs/${bulbId}/brightness`,
      {
        brightness,
      }
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

  public renameBulb(bulbId: string, newName: string): Promise<{}> {
    return this.callApiWithAuthorization<{}, { name: string }>(
      "PATCH",
      `/bulbs/${bulbId}/name`,
      { name: newName }
    );
  }

  public deleteBulb(bulbId: string): Promise<{}> {
    return this.callApiWithAuthorization("DELETE", `/bulbs/${bulbId}`, {});
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
    }).catch((err: AxiosError) => {
      if (err?.response?.status === 401) {
        this.logout();
        throw err;
      }

      throw err;
    });
    return response!.data;
  }

  private getUrl(path: string) {
    return `${config.url}${path}`;
  }
}

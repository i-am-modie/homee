import { createContext, useContext } from "react";
import { ApiService } from "../service/ApiService";

export const ApiServiceReactContext = createContext<ApiService>({} as any);

export const useApiService = () => useContext(ApiServiceReactContext);

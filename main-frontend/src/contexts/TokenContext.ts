import { createContext, useContext } from "react";

export interface TokenContext {
  token: string | undefined;
  setToken: (token: string | undefined) => void;
}

export const TokenReactContext = createContext<TokenContext>({
  token: undefined,
  setToken: () => {},
});

export const useToken = () => useContext(TokenReactContext);

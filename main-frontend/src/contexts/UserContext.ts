import { createContext, useContext } from "react";

export interface UserContext {
  userId: number;
  username: string;
}

export const UserReactContext = createContext<UserContext | undefined>(
  undefined
);

export const useUser = () => useContext(UserReactContext);

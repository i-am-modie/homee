import { FC, useEffect } from "react";
import { useNavigate } from "react-router";
import { routePaths } from "../constants/routePaths";
import { useToken } from "../contexts/TokenContext";

export const Logout: FC = () => {
  const navigate = useNavigate();
  const { setToken } = useToken();
  useEffect(() => {
    setToken(undefined);
    navigate(routePaths.login);
  });

  return null;
};

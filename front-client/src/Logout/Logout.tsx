import { message } from "antd";
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
    message.error("Session expired! Login again!")
  });

  return null;
};

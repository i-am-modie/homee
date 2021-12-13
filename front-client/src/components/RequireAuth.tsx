import { FC, useEffect } from "react";
import { useNavigate } from "react-router";
import { routePaths } from "../constants/routePaths";
import { useToken } from "../contexts/TokenContext";
import { useUser } from "../contexts/UserContext";

export interface RequireAuthProps {
  loading: boolean;
}
export const RequireAuth: FC<RequireAuthProps> = ({ children, loading }) => {
  const { token } = useToken();
  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    if (!loading && (!token || !user)) {
      navigate(routePaths.login);
    }
  });

  if (!token) {
    return null;
  }

  return <>{children}</> || null;
};

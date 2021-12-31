import "./App.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { createBrowserHistory } from "history";
import { routePaths } from "./constants/routePaths";
import { LoginPage } from "./Login/LoginPage";
import { TokenReactContext } from "./contexts/TokenContext";
import { ApiService } from "./service/ApiService";
import { ApiServiceReactContext } from "./contexts/ApiServiceContext";
import { RequireAuth } from "./components/RequireAuth";
import { RegistrationPage } from "./Registration/RegistrationPage";
import { WebsiteWrapper } from "./components/WebsiteWrapper";
import { UserContext, UserReactContext } from "./contexts/UserContext";
import { Logout } from "./Logout/Logout";
import { DevicesPage } from "./DevicesPage/DevicesPage";
import { RenameBulbPage } from "./Bulb/RenameBulbPage";
import { RemoveBulb } from "./Bulb/RemoveBulb";
import { BulbControlWrapper } from "./Bulb/Control/BulbControlWrapper";
import { ColorPicker } from "./Bulb/Control/ColorPicker/ColorPicker";

function App() {
  const [token, setTokenState] = useState<string | undefined>(
    localStorage.getItem("token") ?? undefined
  );
  const [user, setUser] = useState<UserContext | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const [apiServiceInstance] = useState(
    () => new ApiService(token, () => navigate(routePaths.logout))
  );

  useEffect(() => {
    apiServiceInstance.updateToken(token);
  }, [token, apiServiceInstance]);
  useEffect(() => {
    apiServiceInstance.updateLogout(() => navigate(routePaths.logout));
  }, [apiServiceInstance, navigate]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      if (token) {
        const userData = await apiServiceInstance.me();
        setUser({
          userId: userData.userId,
          username: userData.username,
        });
      }
      setLoading(false);
    })();
  }, [apiServiceInstance, token]);

  const setToken = useCallback(
    async (tokenToSet: string | undefined) => {
      if (tokenToSet) {
        apiServiceInstance.updateToken(tokenToSet);
        const userData = await apiServiceInstance.me();
        setUser({
          userId: userData.userId,
          username: userData.username,
        });
        localStorage.setItem("token", tokenToSet);
      } else {
        localStorage.removeItem("token");
      }

      setTokenState(tokenToSet);
    },
    [setTokenState, setUser, apiServiceInstance]
  );

  return (
    <TokenReactContext.Provider
      value={{
        setToken,
        token,
      }}
    >
      <ApiServiceReactContext.Provider value={apiServiceInstance}>
        <UserReactContext.Provider value={user}>
          <div className="App">
            <Routes>
              <Route path={routePaths.login} element={<LoginPage />} />
              <Route
                path={routePaths.register}
                element={<RegistrationPage />}
              />
              <Route path={routePaths.logout} element={<Logout />} />
              <Route path="/" element={<WebsiteWrapper loading={loading} />}>
                <Route path={routePaths.login} element={<LoginPage />} />
                <Route
                  path={routePaths.bulbs.changeName}
                  element={<RenameBulbPage />}
                />
                <Route
                  path={routePaths.bulbs.remove}
                  element={<RemoveBulb />}
                />
                <Route
                  path={routePaths.bulbs.control.main}
                  element={<BulbControlWrapper />}
                ></Route>
                <Route path={routePaths.devices} element={<DevicesPage />} />
                <Route
                  index={undefined}
                  path={routePaths.home}
                  element={<div>Welcome to Yeelight controlling App</div>}
                />
              </Route>
            </Routes>
          </div>
        </UserReactContext.Provider>
      </ApiServiceReactContext.Provider>
    </TokenReactContext.Provider>
  );
}

export default App;

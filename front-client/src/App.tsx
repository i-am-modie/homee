import "./App.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {
  const [token, setTokenState] = useState<string | undefined>(
    localStorage.getItem("token") ?? undefined
  );
  const [user, setUser] = useState<UserContext | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const apiServiceInstance = useMemo(() => new ApiService(undefined), []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      apiServiceInstance.updateToken(token);
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
      apiServiceInstance.updateToken(tokenToSet);
      if (tokenToSet) {
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
          <BrowserRouter>
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
                    path={routePaths.register}
                    element={<RegistrationPage />}
                  />
                  <Route
                    path={routePaths.devices}
                    element={<DevicesPage />}
                  />
                  <Route
                    index={undefined}
                    path={routePaths.home}
                    element={<div>asdasdasdas</div>}
                  />
                </Route>
              </Routes>
            </div>
          </BrowserRouter>
        </UserReactContext.Provider>
      </ApiServiceReactContext.Provider>
    </TokenReactContext.Provider>
  );
}

export default App;

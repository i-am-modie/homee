import { Link, Outlet } from "react-router-dom";
import { Layout, Menu, Skeleton } from "antd";
import {
  DesktopOutlined,
  BulbOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";
import { Logo } from "./atoms/Logo";
import { OutletWrapper } from "./OutletWrapper";
import { routePaths } from "../constants/routePaths";
import { RequireAuth } from "./RequireAuth";
import { useUser } from "../contexts/UserContext";
import { Bulb } from "../Bulbs/Bulb";
import { useApiService } from "../contexts/ApiServiceContext";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export interface WebsiteWrapperProps {
  loading: boolean;
}
export const WebsiteWrapper: FC<WebsiteWrapperProps> = ({ loading }) => {
  const [collapsed, setCollapse] = useState(false);
  const [bulbsLoading, setBulbsLoading] = useState(true);
  const [bulbs, setBulbs] = useState<Bulb[]>([]);
  const apiService = useApiService();
  const onCollapse = useCallback(() => {
    setCollapse(!collapsed);
  }, [collapsed, setCollapse]);
  const user = useUser()!;

  const refetchDevices = useCallback(async () => {
    const bulbs = await apiService.refetchBulbs();
    setBulbs(bulbs.bulbs as Bulb[]);
    setBulbsLoading(false);
  }, [apiService]);

  useEffect(() => {
    if (!loading) {
      refetchDevices();
      const interval = setInterval(async () => {
        await refetchDevices();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [apiService, refetchDevices, loading]);

  return (
    <RequireAuth loading={loading}>
      <Layout style={{ minHeight: "100vh" }}>
        <Skeleton loading={loading || bulbsLoading} active={true}>
          {user && (
            <>
              <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
                <Link to={routePaths.home}>
                  <Logo>{collapsed ? "YC" : "Yeelight Controller"}</Logo>
                </Link>
                <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
                  <SubMenu key="bulbs" icon={<BulbOutlined />} title="Bulbs">
                    {bulbs.map((bulb) => (
                      <Menu.Item key={bulb.id}>
                        {bulb.name || bulb.id}
                      </Menu.Item>
                    ))}
                  </SubMenu>
                  <Menu.Item key="device" icon={<DesktopOutlined />}>
                    <Link to={routePaths.devices}>Device</Link>
                  </Menu.Item>
                  <Menu.Item key="logout" icon={<LogoutOutlined />}>
                    <Link to={routePaths.logout}>Logout {user.username}</Link>
                  </Menu.Item>
                </Menu>
              </Sider>
              <Layout className="site-layout">
                <Header
                  className="site-layout-background"
                  style={{ padding: 0, marginBottom: "16px" }}
                />
                <Content style={{ margin: "0 16px", height: "100%" }}>
                  <OutletWrapper>
                    <Outlet />
                  </OutletWrapper>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                  Jan Dubniak &copy; 2022
                </Footer>
              </Layout>
            </>
          )}
        </Skeleton>
      </Layout>
    </RequireAuth>
  );
};

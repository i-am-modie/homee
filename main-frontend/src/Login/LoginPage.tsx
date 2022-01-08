import { Card, Form, Space, Typography } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { Input } from "../components/molecules/Input";
import { ButtonWithoutMargin } from "../components/atoms/Button";
import { useApiService } from "../contexts/ApiServiceContext";
import { useToken } from "../contexts/TokenContext";
import { useNavigate } from "react-router";
import { routePaths } from "../constants/routePaths";
import { LoginPageWrapper } from "./LoginPageWrapper";
import { Link } from "react-router-dom";

interface FormValues {
  username: string;
  password: string;
}

export const LoginPage: FC<{}> = () => {
  const apiService = useApiService();
  const { token, setToken } = useToken();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const navigate = useNavigate();

  const login = useCallback(
    async (values: FormValues) => {
      try {
        setSubmitError(undefined);
        const token = await apiService.login(values.username, values.password);

        await setToken(token);
        navigate(routePaths.home);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
          setSubmitError(err.message ?? "Unknown Error");
          return;
        }
        setSubmitError("Unknown Error");
      }
    },
    [apiService, setToken, navigate]
  );

  useEffect(() => {
    if (!!token) {
      navigate(routePaths.home);
    }
  });

  return (
    <LoginPageWrapper>
      <Card title="Login">
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={login}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your username!",
                min: 3,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
                min: 8,
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Typography.Text type="danger">{submitError ?? " "}</Typography.Text>
          <Form.Item wrapperCol={{ flex: "center" }}>
            <Space size="middle">
              <ButtonWithoutMargin htmlType="submit">Login</ButtonWithoutMargin>
              or
              <Link to={routePaths.register}>Register</Link>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </LoginPageWrapper>
  );
};

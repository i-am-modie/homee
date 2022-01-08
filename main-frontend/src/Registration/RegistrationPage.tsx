import { Card, Form, Space, Typography } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { Input } from "../components/molecules/Input";
import { Button } from "../components/atoms/Button";
import { useApiService } from "../contexts/ApiServiceContext";
import { useToken } from "../contexts/TokenContext";
import { useNavigate } from "react-router";
import { routePaths } from "../constants/routePaths";
import { Link } from "react-router-dom";
import { RegistrationPageWrapper } from "./RegistrationPageWrapper";

interface FormValues {
  username: string;
  password: string;
}

export const RegistrationPage: FC<{}> = () => {
  const apiService = useApiService();
  const { token, setToken } = useToken();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const navigate = useNavigate();

  const register = useCallback(
    async (values: FormValues) => {
      try {
        setSubmitError(undefined);
        const token = await apiService.register(
          values.username,
          values.password
        );

        setToken(token);
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
    <RegistrationPageWrapper>
      <Card title="Register">
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={register}
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
          <Form.Item
            wrapperCol={{ flex: "center" }}
            style={{ marginBottom: 0 }}
          >
            <Space size="middle">
              <Button htmlType="submit">Register</Button>
            </Space>
          </Form.Item>
          <span>
            or
            <Link to={routePaths.login}> Login </Link>
            if already registered
          </span>
        </Form>
      </Card>
    </RegistrationPageWrapper>
  );
};

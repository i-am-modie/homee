import { Alert, message, Typography } from "antd";
import { FC, useCallback, useState } from "react";
import { Button } from "../components/atoms/Button";
import { useApiService } from "../contexts/ApiServiceContext";

export const DevicesPage: FC = () => {
  const [token, setToken] = useState<string>();
  const apiService = useApiService();

  const regenerateToken = useCallback(async () => {
    try {
      const token = await apiService.regenerateDeviceToken();

      setToken(token.token);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        message.error(err.message ?? "Unknown Error");
        return;
      }
      message.error("Unknown Error");
    }
  }, [apiService]);

  return (
    <div>
      <Typography.Title>Regenerate Gateway Token</Typography.Title>
      <Typography.Title level={2}>
        Click below to regenerate gateway token.
        <Typography.Text strong>
          Previously authorized gateway will not be able to connect until
          you will provide new token to them.
        </Typography.Text>
      </Typography.Title>
      <Button onClick={regenerateToken}>Regenerate Token</Button>
      {token && <Alert message={`Your new token: ${token}`} type="success" />}
    </div>
  );
};

import { Progress } from "antd";
import { FC } from "react";

export interface StatusProps {
  ok: boolean;
}

export const Status: FC<StatusProps> = ({ ok }) => {
  return (
    <Progress
      type="circle"
      percent={100}
      status={ok ? "success" : "exception"}
      width={30}
    />
  );
};

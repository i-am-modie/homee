import { Button as AntdButton, ButtonProps as AntdButtonProps } from "antd";
import { FC } from "react";
import styled from "styled-components";

export type ButtonProps = AntdButtonProps;
export const ButtonComponent: FC<ButtonProps> = ({
  type = "primary",
  ...props
}) => <AntdButton {...props} type={type}></AntdButton>;

export const Button = styled(ButtonComponent)`
  margin-bottom: 25px;
`;

export const ButtonWithoutMargin = styled(Button)`
  margin-bottom: 0;
`;

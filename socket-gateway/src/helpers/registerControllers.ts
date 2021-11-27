import { Container } from "inversify";
import { injectables } from "../ioc/injectables";

export const registerControllers = (container: Container) => {
  container.get(injectables.controllers.UserController);
  container.get(injectables.controllers.DeviceController);
};

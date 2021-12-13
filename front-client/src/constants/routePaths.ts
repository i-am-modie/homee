const bulbsPrefix = "/bulbs";
const bulbsControlPrefix = `${bulbsPrefix}/:id/control`;

export const routePaths = {
  logout: "/logout",
  login: "/login",
  devices: "/devices",
  register: "/register",
  home: "/",
  bulbs: {
    main: bulbsPrefix,
    changeName: `${bulbsPrefix}/:id/name`,
    remove: `${bulbsPrefix}/:id/remove`,
    control: {
      main: bulbsControlPrefix,
    },
  },
};

export const buildBulbsControlMain = (bulbId: string) =>
  routePaths.bulbs.control.main.replace(":id", bulbId);

export const buildChangeBulbNamePath = (bulbId: string) =>
  routePaths.bulbs.changeName.replace(":id", bulbId);

export const buildRemoveBulbPath = (bulbId: string) =>
  routePaths.bulbs.remove.replace(":id", bulbId);

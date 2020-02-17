/* eslint-disable */
// Reflect Metadata API polyfill
import "reflect-metadata";

// auto remove comments from json (tsconfig)
import "json-comments";

// patch `require` calls to match with tsconfig aliases (paths config)
const tsConfig = require("../tsconfig.json");

const tsConfigPaths = require("tsconfig-paths");
tsConfigPaths.register({
  baseUrl: tsConfig.compilerOptions.baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

// load .env variables in local environment
import path from "path";

import loadDotEnv from "@server/common/helpers/env";
if (!process.env.IS_DOCKER) {
  loadDotEnv(path.resolve(__dirname, "../../.env"));
}

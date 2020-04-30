import fs from "fs";
import { parse } from "dotenv";

export default function loadDotEnv(path: string) {
  try {
    // read env file
    const envFile = fs.readFileSync(path);
    const envVariables = parse(envFile);

    // overwrite process env variables
    Object.entries(envVariables).forEach(([envKey, envVariable]) => {
      process.env[envKey] = envVariable;
    });
  } catch {
    console.log(`Loading env from '${path}' has failed.`);
  }
}

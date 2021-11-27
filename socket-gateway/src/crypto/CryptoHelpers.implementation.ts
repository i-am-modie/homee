import { CryptoHelpers } from "./CryptoHelpers";
import bcrypt from "bcrypt";
import { injectable } from "inversify";

@injectable()
export class CryptoHelpersImplementation implements CryptoHelpers {
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  verifyPassword(hash: string, passwordToVerify: string): Promise<boolean> {
    return bcrypt.compare(passwordToVerify, hash);
  }
}

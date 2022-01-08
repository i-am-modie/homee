export interface CryptoHelpers {
  hashPassword(password: string): Promise<string>;
  verifyPassword(hash: string, passwordToVerify: string): Promise<boolean>;
}

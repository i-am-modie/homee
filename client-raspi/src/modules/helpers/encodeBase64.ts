export const encodeBase64 = (ascii: string) =>
  Buffer.from(ascii, "ascii").toString("base64");

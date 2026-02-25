import crypto from "crypto";

export const md5LowerCase = (value: string): string => {
  return crypto.createHash("md5").update(value, "utf8").digest("hex");
};

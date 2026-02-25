import { md5LowerCase } from "../../utils/md5";
import { VEXORA } from "../../constants/vexora";

/**
 * Generate Vexora MD5 signature
 * Rules:
 * - Exclude sign
 * - Sort keys ASCII (A-Z)
 * - key=value concatenation
 * - Append secret
 * - MD5 → lowercase
 */
export const generateVexoraSign = (
  params: Record<string, any>,
  secret: string = VEXORA.SECRET_KEY,
): string => {
  const keys = Object.keys(params)
    .filter(
      (key) =>
        key !== "sign" &&
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== "",
    )
    .sort();

  let baseString = "";

  for (const key of keys) {
    baseString += `${key}=${String(params[key])}`;
  }

  const finalString = baseString + secret;

  return md5LowerCase(finalString);
};

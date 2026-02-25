export const VEXORA = {
  SANDBOX_BASE_URL: process.env.VEXORA_SANDBOX_BASE_URL!,
  MERCHANT_NO: process.env.VEXORA_MERCHANT_NO!,
  SECRET_KEY: process.env.VEXORA_SECRET_KEY!,
  CHARSET: process.env.VEXORA_CHARSET || "UTF-8",
  SIGN_TYPE: process.env.VEXORA_SIGN_TYPE || "MD5",
  TIMEOUT: Number(process.env.VEXORA_TIMEOUT || 10000),
};

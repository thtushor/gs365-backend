import jwt from "jsonwebtoken";

export function verifyJwt(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
}

export interface JwtPayload {
  id: number | null;
  email: string | null;
  username: string | null;
  role?: string | null;
  userType: "user" | "admin";
}

export type Unit =
  | "Years"
  | "Year"
  | "Yrs"
  | "Yr"
  | "Y"
  | "Weeks"
  | "Week"
  | "W"
  | "Days"
  | "Day"
  | "D"
  | "Hours"
  | "Hour"
  | "Hrs"
  | "Hr"
  | "H"
  | "Minutes"
  | "Minute"
  | "Mins"
  | "Min"
  | "M"
  | "Seconds"
  | "Second"
  | "Secs"
  | "Sec"
  | "s"
  | "Milliseconds"
  | "Millisecond"
  | "Msecs"
  | "Msec"
  | "Ms";

export type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

export type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;

export function generateJwtToken(
  payload: JwtPayload,
  expiresIn: StringValue | number = "1D"
): string {
  return jwt.sign({ ...payload }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: expiresIn,
  });
}

// Game session JWT functions
export function generateJWT(payload: any, expiresIn: string = "1h"): string {
  return jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: expiresIn,
  });
}

generateJWT.verify = function(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
};

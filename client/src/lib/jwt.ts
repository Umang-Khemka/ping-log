import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
}

export const signToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.verify(token, secret) as TokenPayload;
};
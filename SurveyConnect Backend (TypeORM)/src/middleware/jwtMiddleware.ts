import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../database/entity/User";

interface DecodedJwtPayload {
  userId: number;
}

export const createJwtToken = (userId: number): string => {
  return jwt.sign({ userId }, "your_secret_key", { expiresIn: "2h" });
};

export const verifyJwtToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication failed. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key") as DecodedJwtPayload;
    const user = await User.findOneBy({ user_id: decoded.userId });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    req.body.user = user.user_id;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Authentication failed. Invalid token." });
  }
};

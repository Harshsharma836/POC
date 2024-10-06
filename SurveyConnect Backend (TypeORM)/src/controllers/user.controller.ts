// src/controllers/userController.ts
import { Request, Response } from "express";
import { Container } from "typedi";
import { UserService } from "../services/user.service";

class UserController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Error("Email and password are required for login.");
      }

      const userServiceInstance: UserService = Container.get(UserService);
      const token = await userServiceInstance.login(email, password);
      res.json({ token });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, email } = req.body;

      if (!username || !password || !email) {
        throw new Error(
          "Username, password, and email are required for registration.",
        );
      }

      const userServiceInstance: UserService = Container.get(UserService);
      const token = await userServiceInstance.register(
        username,
        password,
        email,
      );
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default UserController;

// src/services/authService.ts
import { Service } from "typedi";
import bcrypt from "bcrypt";
import { User } from "../database/entity/User";
import { createJwtToken } from "../middleware/jwtMiddleware";

@Service()
export class UserService {
  async login(email: string, password: string): Promise<string> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Invalid username or password.");
    }
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid username or password.");
    }

    const token = createJwtToken(user.user_id);
    return token;
  }

  async register(
    username: string,
    password: string,
    email: string,
  ): Promise<string> {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
    }).save();
    const token = createJwtToken(newUser.user_id);
    return token;
  }
}

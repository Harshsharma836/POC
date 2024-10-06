import express from "express";
import UserController from "../controllers/user.controller";

const userRoute = express.Router();

userRoute.post("/login", UserController.login);
userRoute.post("/register", UserController.register);

export default userRoute;

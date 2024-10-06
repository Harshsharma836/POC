// src/helpers/interfaces.ts
import { Request as ExpressRequest } from "express";

export interface UserRequest extends ExpressRequest {
  user?: { user_id: number };
}

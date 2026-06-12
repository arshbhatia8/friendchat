import { Request, Response } from "express";
import * as userService from "@services/user.service";
import { sendSuccess } from "@utils/apiResponse";

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const users = await userService.getAllUsersWithStatus(req.userId!);
  sendSuccess(res, { users });
}

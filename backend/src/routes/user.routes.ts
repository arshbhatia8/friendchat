import { Router } from "express";
import * as ctrl from "@controllers/user.controller";
import { verifyToken } from "@middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, ctrl.getAllUsers);

export default router;

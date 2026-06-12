import { Router } from "express";
import * as ctrl from "@controllers/auth.controller";
import { verifyToken } from "@middleware/verifyToken";
import { validate }    from "@middleware/validate";
import { loginSchema, registerSchema } from "@validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login",    validate(loginSchema),    ctrl.login);
router.get( "/me",       verifyToken,               ctrl.getMe);
router.post("/refresh",                             ctrl.refresh);
router.post("/logout",                              ctrl.logout);

export default router;

import { Router } from "express";
import {registerUser,login,logoutUser} from "../controllers/auth.controls.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
} from "../validators/validator.js";
import { virifyJwt } from "../middleware/auth.middleware.js";


const router = Router();

router.route("/register").post(userRegisterValidator(),validate, registerUser);

router.route("/login").post(userLoginValidator(),validate, login);

router.route("/logout").post(virifyJwt,logoutUser);

export default router;

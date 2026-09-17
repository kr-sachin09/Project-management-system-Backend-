import { Router } from "express";
import {registerUser} from "../controllers/auth.controls.js";

const router = Router();

router.route("/register").post(registerUser);

export default router;

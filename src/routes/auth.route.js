import { Router } from "express";
import {registerUser,login,logoutUser, verifyEmail, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmailVerification} from "../controllers/auth.controls.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordvalidator,
  userResetForgotPasswordValidator,
  userChangeCurrentPasswordvalidator,
} from "../validators/validator.js";
import { virifyJwt } from "../middleware/auth.middleware.js";


const router = Router();

//Unsecured rotes


router.route("/register").post(userRegisterValidator(),validate, registerUser);

router.route("/login").post(userLoginValidator(),validate, login);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/forgot-password").post(userForgotPasswordvalidator(),validate,forgotPasswordRequest);

router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);


// Secured routes 

router.route("/logout").post(virifyJwt,logoutUser);

router.route("/current-user").post(virifyJwt,getCurrentUser);

router.route("/change-password").post(virifyJwt, userChangeCurrentPasswordvalidator(),validate,changeCurrentPassword);

router.route("/resend-email-verification").post(virifyJwt,resendEmailVerification)


export default router;

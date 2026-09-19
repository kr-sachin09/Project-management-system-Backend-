import { body } from "express-validator";


const userRegisterValidator = () => {
    return [
        body("email")
          .trim()
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Invalid Email"),
        body("username")
          .trim()
          .notEmpty()
          .withMessage("username required")
          .isLowercase()
          .withMessage("username must be in lowercase")
          .isLength({min:3})
          .withMessage("username is too sort.Minimum 3 characters required"),
        body("password")
          .trim()
          .notEmpty()
          .withMessage("Password is required"),
        body("fullname")
          .optional()
          .trim()
          .notEmpty()
          .withMessage("Fullname is required")

    ]
}

const userLoginValidator = () => {
  return [
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Email is not valid"),
    body("password")
      .notEmpty()
      .withMessage("password is required")
  ]
}

const userChangeCurrentPasswordvalidator = () => {
  return[
    body("oldPassword")
      .notEmpty()
      .withMessage("old password is required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required"),
  ]
}

const userForgotPasswordvalidator = () => {
  return [
    body("email")
      .isEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("Email is invalid")
  ]
};

const userResetForgotPasswordValidator = () => {
  return [
    body("password")
      .isEmpty()
      .withMessage("Password is required")
  ]
};


// const userChangeCurrentPasswordvalidator = () => {
//   return [body()];
// };


export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordvalidator,
  userForgotPasswordvalidator,
  userResetForgotPasswordValidator,
};
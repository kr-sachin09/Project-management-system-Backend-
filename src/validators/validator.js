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

export {userRegisterValidator,userLoginValidator};
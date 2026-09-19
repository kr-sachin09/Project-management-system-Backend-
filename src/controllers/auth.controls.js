import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { Apierror } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import { emailVerificationTemplate, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Apierror(500, "Access Token generation failed");
  }
};

const registerUser = asynchandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new Apierror(409, "This email or username already exist", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedtoken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationTemplate(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-mail/${unHashedtoken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationtoken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new Apierror(500, "Something went wrong , while registering user");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registration successfully and verification email sent on registered email",
      ),
    );
});

const login = asynchandler(async (req, res) => {
  const { email, password, username } = req.body;
  if (!email) {
    throw new Apierror(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Apierror(400, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new Apierror(400, "Invalide password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationtoken -emailVerificationExpiry",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});



export {registerUser,login};
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { Apierror } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import { emailVerificationTemplate, forgotEmailTemplate, sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";



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

const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:"",
      },
    },
    {
      new:true
    }
  );

  const options = {
    httpOnly : true,
    secure : true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));

});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current user fetched successfuly"))
});


const verifyEmail = asynchandler(async (req, res) => {
  const {verificationToken} = req.params

  if(!verificationToken){
    throw new Apierror(400,"Email verfication token not found")
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

  const user = await User.findOne({
    emailVerificationtoken:hashedToken,
    emailVerificationExpiry:{$gt:Date.now()}
  });

  if(!user){
    throw new Apierror(400,"Token is invalid or expire")
  };

  user.emailVerificationtoken = undefined;
  user.emailVerificationExpiry = undefined;

  user.emailVerifid = true;
  await user.save({validateBeforeSave:false});

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          emailVerifid : true,
        },
        "Email is verified",
      )
    )


});


const resendEmailVerification = asynchandler(async (req, res) => {
  const user = User.findById(req.user?._id)
  if(!user){
    throw new Apierror(404,"User doesn't exist");
  }

  if (user.emailVerifid) {
    throw new Apierror(409, "User is already verified");
  }

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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Email has been sent to your email ID"
      )
    )

});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new Apierror(401,"Unauthorized access")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new Apierror(401, "Invalide refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
      throw new Apierror(401, "Refresh token is expired");
    }

    const options= {
      httpOnly:true,
      secure:true
    };

    const {accessToken,refreshToken:newRefreshToken} = await generateAccessAndRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(
        200,
        {accessToken, refreshToken:newRefreshToken},
        "Access token refreshed"
        ));


  } catch (error) {
    throw new Apierror(401,"Invalid refresh token")
  }


});

const forgotPasswordRequest = asynchandler(async (req, res) => {
  const {email} = req.body

  const user = User.findOne({email});

  if(!user){
    throw new Apierror(404,"User does not exist")
  }

  const {unHashedtoken,hashedToken,tokenExpiry} = user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({validateBeforeSave:false});

  await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotEmailTemplate(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedtoken}`,
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail ID"
      )
    )


});

const resetForgotPassword = asynchandler(async (req, res) => {
  const {resetToken} = res.params
  const {newPassword} = res.body

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  const user = await User.findOne(
    {
      forgotPasswordToken:hashedToken,
      forgotPasswordExpiry:{$gt:Date.now()}
    }
  );

  if(!user){
    throw new Apierror(489,"Token is invalid or expired");
  }

  user.forgotPasswordExpiry = undefined
  user.forgotPasswordToken = undefined

  user.password = newPassword;

  await user.save({validateBeforeSave:false})

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password has been reset successfully"
      )
    )


});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const {oldPassword,newPassword} = req.body

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordValid){
    throw new Apierror(400,"Old password is wrong");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave:false})

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Current password updated"
      )
    )

});



export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
};
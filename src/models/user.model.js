import mongoose, {Schema} from "mongoose";
import brcypt from "brcypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const userSchema = new Schema(
    {
  avatar: {
    type: {
      url: String,
      localPath: String,
    },
    default: {
      url: "https://placehold.co/200x200",
      localPath:"",
    },
  },
  username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true,

  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,

  },
  fullName:{
    type:String,
    trim:true,
  },
  password:{
    type:String,
    required:[true,"Password is required"],
  },
  emailVerifid:{
    type:Boolean,
    default:false,
  },
  refreshToken:{
    type:String,
  },
  forgotPasswordToken:{
    type:String,
  },
  forgotPasswordExpiry:{
    type:Date,
  },
  emailVerificationtoken:{
    type:String,
  },
  emailVerificationExpiry:{
    type:Date,
  }
},
{
    timestamps:true
}
);

userSchema.pre("save",async function(next){
    if(!this.isModified(this.password))return next();
    this.password = await brcypt.hash(this.password,10)
    next()
});

userSchema.method.generateAccessToken = function (){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
  );
};

userSchema.method.generateRefreshToken = function (){
  return jwt.sign(
    {
      _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:REFRESH_TOKEN_EXPIRY
    }
  )
};

userSchema.method.generateTemporaryToken = function (){
  const unHashedtoken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedtoken)
    .digest("hex")
  const tokenExpiry = Date.now() + (20*60*1000);
  return {unHashedtoken,hashedToken,tokenExpiry};
}

export const user = mongoose.model("user",userSchema);
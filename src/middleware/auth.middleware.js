import {User} from "../models/user.model.js";
import { Apierror } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import { ProjectMember } from "../models/projectmember.model.js";
import mongoose from "mongoose";



export const virifyJwt = asynchandler(async (req, res, next)=>{
    const token =
      req.cookies?.accessToken||
      req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
        throw new Apierror(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationtoken -emailVerificationExpiry");

        if (!user) {
          throw new Apierror(401, "Invalid access token");
        }
        req.user = user
        next()
    } catch (error) {
          throw new Apierror(401, "Invalid access token");
    }
})

export const validateProjectPermission = (roles = []) =>{
  asynchandler(async (req, res, next)=>{
    const {projectId} = req.params

    if(!projectId){
      throw new Apierror(400,"Project Id is missing")
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new Apierror(400, "Project not found");
    }

    const given_Role = project?.role

    req.user.role = given_Role

    if(!roles.includes(given_Role)){
      throw new Apierror(203,"You are not allowed to do this")
    }

    next()
    
  })
}
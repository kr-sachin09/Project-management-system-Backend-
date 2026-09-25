import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { Apierror } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, userRoleEnum } from "../utils/constants.js";



const getProjectById = asynchandler(async (req, res) => {
  const { project_Id } = res.params;
  const project = await Project.findById(project_Id);

  if (!project) {
    throw new Apierror(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const getProjectMembers = asynchandler(async (req, res) => {
  const { project_Id } = req.params;
  const project = await Project.findById(project_Id);

  if (!project) {
    throw new Apierror(404, "Project not found");
  }

  const projectmembers = await ProjectMember.aggregate(
    [
      {
        $match:{
          project: new mongoose.Types.ObjectId(project_Id),
        },
      },{
        $lookup:{
          from:"users",
          localField:"user",
          foreignField:"_id",
          as:"user",
          pipeline:[
            {
              $project:{
                _id:1,
                username:1,
                fullName:1,
                avatar:1
              }
            }
          ]
        }
      },{
        $addFields:{
          user:{
            $arrayElemAt:["$user",0]
          }
        }
      },{
        $project:{
          project:1,
          user:1,
          role:1,
          createdAt:1,
          updatedAt:1,
          _id:0
        }
      }
    ]
  )

  return res 
    .status(200)
    .json(
      new ApiResponse(200,projectmembers, "Project member fetched")
    )

});

const createProject = asynchandler(async (req, res) => {
  const {name, description} = req.body 

  const project = await Project.create({
    name,
    description,
    createdBy:new mongoose.Types.ObjectId(req.user._id)
  });

  await ProjectMember.create({
    user:new mongoose.Types.ObjectId(req.user._id),
    project:new mongoose.Types.ObjectId(Project._id),
    role:userRoleEnum.ADMIN,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200,project, "Project created successfully")
    )

});

const updateProject = asynchandler(async (req, res) => {
    const { name, description } = req.body; 
    const {project_Id} = req.params

    const project = await Project.findByIdAndUpdate(
      project_Id,{
        name,
        description,

      },
      {new:true}
    );

    if(!project){
      throw new Apierror(404,"Project not found");
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200,project, "Project updated")
      );

});

const deleteProject = asynchandler(async (req, res) => {
  const {project_id} = req.params
  const project = await Project.findByIdAndDelete(project_id);

  if (!project) {
    throw new Apierror(404, "Project not found");
  }

  return res.status(200).json(new ApiResponse(200, project, "Project deleted"));
  
});

const addMembersToProject = asynchandler(async (req, res) => {
  const {email, role} = res.body
  const {project_Id} = res.params

  const user = await User.findOne({email})

  if(!user){
    throw new Apierror(404,"User does not exists")
  }

  await ProjectMember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(project_Id),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(project_Id),
      role:role
    },{
      new:true,
      upsert:true
    }
  );

  return res 
    .status(201)
    .json(
      new ApiResponse(201, {}, "Member added to project")
    )

});

const getProjects = asynchandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projects",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "projects",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "projects",
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          CreatedBy: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const updateMemberRole = asynchandler(async (req, res) => {
  const {project_Id, user_id} = res.params
  const {new_role} = res.body

  if(!AvailableUserRole.includes(new_role)){
    throw new Apierror(400,"Invalid role")
  }

  let projectmember = await ProjectMember.findOne({
    user:new mongoose.Types.ObjectId(user_id),
    project:new mongoose.Types.ObjectId(project_Id)
  })

  if (!projectmember) {
    throw new Apierror(400, "Invalid member");
  }

  projectmember = await projectmember.findByIdAndUpdate(
    projectmember._id,
    {
      role:new_role,
    },{
      new:true
    }
  );

  if (!projectmember) {
    throw new Apierror(400, "Invalid member");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200,projectmember, "Project member role updated")
    )

});

const deleteMember = asynchandler(async (req, res) => {
  const { project_Id, user_id } = res.params;

  let projectmember = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(user_id),
    project: new mongoose.Types.ObjectId(project_Id),
  });

  if (!projectmember) {
    throw new Apierror(400, "Invalid member");
  }

  projectmember = await projectmember.findByIdAndDelete(
    projectmember._id,
  );

  if (!projectmember) {
    throw new Apierror(400, "Invalid member");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projectmember, "Project member deleted"));
});

export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
}
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Subtask } from "../models/subtask.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { Apierror } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, userRoleEnum } from "../utils/constants.js";


const createTask = asynchandler(async (req, res,)=>{
    const {title, description, assignedTo, status} = req.body;
    const { projectId} = req.params;

    const project = await Project.findById(projectId);
    if(!project){
        throw new Apierror(404, "Project not found")
    };

    const files = req.files||[];
    const attachments = files.map((file)=>{
        return{
            url:`${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    })

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo):undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments

    });

    return res 
      .status(201)
      .json(
        new ApiResponse(201,task,"Task created")
      )

});

const getTask = asynchandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new Apierror(404, "Project not found");
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId)
  }).populate("assignedto", "avatar username fullName")

  return res
    .status(201)
    .json(
        new ApiResponse(201, tasks, "Task fetched")
    );

});

const deleteTask = asynchandler(async (req, res) => {});

const getTaskByID = asynchandler(async (req, res) => {
    const {taskId} = req.params

    const task = await Task.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(taskId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
          pipeline: [
            {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          ],
        },
      },
      {
        $lookup: {
          from: "Subtask",
          localField: "_id",
          foreignField: "task",
          as: "Subtask",
          pipeline: [
            {
              $lookup: {
                from: "User",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        _id:1,
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                ]
              },
            },
            {
                $addFields: {
                    createdBy: {
                        $arrayElemAt: ["$createdBy",0]
                    }
                }
            }
          ],
        },
      },
      {
        $addFields: {
            assignedTo:{
                $arrayElemAt: ["$assignedTo", 0]
            }
        }
      }
    ]);

    if(!task || task.length === 0){
        throw new Apierror(404, "Task not found")
    };

    return res  
      .status(200)
      .json(
        new ApiResponse(200,task[0],"Task fetched ")
      )
});

const updateTask = asynchandler(async (req, res) => {});

const createSubTask = asynchandler(async (req, res) => {});

const deleteSubTask = asynchandler(async (req, res) => {});

const updateSubTask = asynchandler(async (req, res) => {});

export{
    createTask,
    getTask,
    getTaskByID,
    deleteTask,
    updateTask,
    createSubTask,
    deleteSubTask,
    updateSubTask
}
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

});

const getTask = asynchandler(async (req, res) => {});

const deleteTask = asynchandler(async (req, res) => {});

const getTaskByID = asynchandler(async (req, res) => {});

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
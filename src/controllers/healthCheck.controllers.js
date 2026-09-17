import {ApiResponse} from "../utils/api-response.js";
import {asynchandler} from "../utils/async-handler.js";



const healthCheck = asynchandler(async (req,res)=>{
    res.status(200).json(new ApiResponse(200,{message:"Server is serving"}));
})

export {healthCheck};
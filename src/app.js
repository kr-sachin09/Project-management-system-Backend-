import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({
    extended:true,
    limit:"10kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",")||"http://localhost:573",
    credentials:true,
    methods:["GET","POST","DELETE","PUT","PATCH","OPTION"],
    allowedHeaders:["Content-Type","Authorization"],
}));

import healthCheckRouter from "./routes/healthCheck.routes.js";
import authrouter from "./routes/auth.route.js";
import projectRouter from "./routes/project.routes.js";


app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/auth", authrouter);
app.use("/api/v1/projects", projectRouter);




app.get("/", (req, res) => {
  res.send("You are on main page ");
});

app.get("/start", (req, res) => {
  res.send("This is a great start");
});


export default app;
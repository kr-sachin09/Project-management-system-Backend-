import express from "express";
import cors from "cors"

const app = express();

app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({
    extended:true,
    limit:"10kb"
}));
app.use(express.static("public"));

app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",")||"http://localhost:573",
    credentials:true,
    methods:["GET","POST","DELETE","PUT","PATCH","OPTION"],
    allowedHeaders:["Content-Type","Authorization"],
}));

import healthCheckRouter from "./routes/healthCheck.routes.js";
app.use("/api/v1/healthcheck",healthCheckRouter);



app.get("/", (req, res) => {
  res.send("You are on main page ");
});

app.get("/start", (req, res) => {
  res.send("This is a great start");
});


export default app;
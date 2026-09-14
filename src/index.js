import dotenv from "dotenv";
import app from "./app.js";
import mongoDB from "./db/database.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

mongoDB()
   .then(()=>{
    app.listen(port, () => {
      console.log(`Server is serving on port  http://localhost:${port}`);
    });
   })
  .catch((err)=>{
    console.error("Database connection failed ",err);
    process.exit(1);
  })
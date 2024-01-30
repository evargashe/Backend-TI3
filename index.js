import express  from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import  './scheduleTask.js';
import studentRoute from "./routes/studentRoute.js";
import adminRoute from "./routes/adminRoute.js";
import connectionDB from "./config/db.js";


const PORT = process.env.PORT || 4000

// read environment variables
dotenv.config();

const app = express();
app.use(cors()); // Habilitar CORS
app.use(cookieParser()); 

// indicate we pass JSON files
app.use(express.json());
// connection with the DB
connectionDB();


// redirect all urls
app.use("/api/students", studentRoute);
app.use("/api/admin", adminRoute);

app.listen(PORT, () => {
    console.log(`Funcionando en el puerto ${PORT}`);
});
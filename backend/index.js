import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";



//files
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"; 
import connectionRoutes from "./routes/connectionRoutes.js";
import aiChatRoutes from "./routes/aiChatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import weightRoutes from "./routes/weightRoutes.js";
import vaccinationRoutes from "./routes/vaccinationRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import heightRoutes from "./routes/heightRoutes.js";
import headCircumferenceRoutes from "./routes/headCircumferenceRoutes.js";
import nutritionFluidRoutes from "./routes/nutritionFluidRoutes.js";
import nutritionSolidRoutes from "./routes/nutritionSolidRoutes.js";



// Configuration
dotenv.config();
connectDB();
  

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

// routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/ai-chat", aiChatRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/weights", weightRoutes);
app.use("/api/v1/heights", heightRoutes);
app.use("/api/v1/head-circumference", headCircumferenceRoutes);
app.use("/api/v1/vaccinations", vaccinationRoutes);
app.use("/api/v1/medications", medicationRoutes);
app.use("/api/v1/nutrition-fluid", nutritionFluidRoutes);
app.use("/api/v1/nutrition-solid", nutritionSolidRoutes);
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

//H0M7SjiatTYxKC4g
//Username-Asitha

//
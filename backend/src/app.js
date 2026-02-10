import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import employeeAuthRoutes from "./routes/employeeAuthRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";



const app = express();




app.use(cors());
app.use(express.json());

// Routes
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employees", employeeRoutes); // For admin to manage employees
app.use("/api/employee", employeeAuthRoutes); // For employee self-service (login, me)
app.use("/api/analytics", analyticsRoutes);

export default app;

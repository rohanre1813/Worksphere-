import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";

import employeeRoutes from "./routes/employeeRoutes.js";
import employeeAuthRoutes from "./routes/employeeAuthRoutes.js";

import initSocket from "./controllers/sockets.js";

dotenv.config();

connectDB();

/*
==================================================
   CREATE HTTP SERVER
==================================================
*/
const server = http.createServer(app);

/*
==================================================
   SOCKET.IO SETUP
==================================================
*/
const io = new Server(server, {
   cors: {
      origin: "*",
   },
});

app.set("io", io); // Make generic io available in controllers

/*
   Initialize socket logic
*/
initSocket(io);

/*
==================================================
   ROUTES (Moved to app.js)
==================================================
*/
// app.use("/api/employees", employeeRoutes);
// app.use("/api/employee", employeeAuthRoutes);

/*
==================================================
   START SERVER
==================================================
*/
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
   console.log(`🚀 Server running on ${PORT}`);
});

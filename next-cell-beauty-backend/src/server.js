import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDb } from "./config/db.js";

let PORT = parseInt(process.env.PORT || "4001", 10);

const startServer = async (portToUse) => {
  try {
    await connectDb();
    const server = app
      .listen(portToUse, () => {
        console.log(`🚀 NEXT CELL BEAUTY Backend Server running on http://localhost:${portToUse}`);
        console.log(`📚 Swagger OpenAPI Documentation available at http://localhost:${portToUse}/api-docs`);
        console.log(`❤️ Health Check available at http://localhost:${portToUse}/healthz`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error(`❌ Port ${portToUse} is already in use. Backend must listen on port ${portToUse} because the frontend Vite proxy targets http://127.0.0.1:${portToUse}.`);
          console.error("   Stop the other process using this port, then start the backend again.");
          process.exit(1);
        } else {
          console.error("❌ Failed to start backend server:", err);
        }
      });
  } catch (err) {
    console.error("❌ Backend failed to connect to database:", err);
    process.exit(1);
  }
};

startServer(PORT);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/orgRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const apiRoutes = require("./routes/apiRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if(token) {
     next();
  } else {
     next(new Error("Authentication error"));
  }
});
app.set("io", io);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "SaaS Dashboard API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/core", apiRoutes);

app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

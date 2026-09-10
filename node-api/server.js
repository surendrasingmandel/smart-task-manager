const express = require("express");
const cors = require("cors");
const path = require("path");

require("./database");
const tasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "node-api" });
});

app.use("/api/tasks", tasksRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`Smart Task Manager running at http://localhost:${PORT}`);
});

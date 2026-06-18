require("dotenv").config({ path: "../.env" });

const express = require("express");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();

app.use(express.json());

app.use("/api", scheduleRoutes);

app.get("/", (req, res) => {
  res.send("Vehicle Scheduler API Running");
});

const PORT = 5000;

app.listen(PORT);
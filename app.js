const express = require("express");
const mongoose = require("mongoose");
const violationRoutes = require("./src/routes/violation-routes");

// const cors = require("cors");
const { PORT = 3000 } = process.env;
const URL = "mongodb://localhost:27017/mydb";

const app = express();
app.use(express.json());
app.use(violationRoutes);

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(`DB connection error: ${err}`));

app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`Listening port ${PORT}`)
);

// app.use(
//   cors({
//     origin: ["http://localhost:3001", "http://localhost:3000"],
//     credentials: true,
//   })
// );

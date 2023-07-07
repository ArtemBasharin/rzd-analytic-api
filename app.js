const express = require("express");
const mongoose = require("mongoose");
const violationRoutes = require("./src/routes/violation-routes");
const cors = require("cors");

const { PORT = 3001 } = process.env;
const URL = "mongodb://127.0.0.1:27017/mydb";

const app = express();
app.use(express.json());
app.use(violationRoutes);

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })

  .catch((err) => console.log(`DB connection error: ${err}`));

app.use(
  cors({
    origin: "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`Listening port ${PORT}`)
);

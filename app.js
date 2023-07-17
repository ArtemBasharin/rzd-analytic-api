const express = require("express");
const mongoose = require("mongoose");
const violationRoutes = require("./src/routes/violation-routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const bytes = require("bytes");

const { PORT = 3001 } = process.env;
const URL = "mongodb://127.0.0.1:27017/mydb";

const app = express();
app.use(bodyParser.json({ limit: 100000000, type: "application/json" }));
app.use(violationRoutes);

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })

  .catch((err) => console.log(`DB connection error: ${err}`));

app.use(
  cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 200,
  })
);

app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`Listening port ${PORT}`)
);

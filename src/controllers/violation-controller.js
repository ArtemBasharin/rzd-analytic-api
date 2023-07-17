const ObjectId = require("mongodb");
const Violation = require("../models/violation");
const violationID = "ID отказа";

const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getViolations = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "7200");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  console.log("req.query:", req.query);
  let minY = req.query.fromYear + "-01-01";
  let maxY = req.query.toYear + "-12-31";

  Violation.find({
    $and: [
      {
        "Начало отказа": { $gte: new Date(minY) },
      },
      { "Начало отказа": { $lte: new Date(maxY) } },
    ],
  })
    .then((violations) => {
      // console.log(violations);
      res.status(200).json(violations);
    })
    .catch((err) => handleError(res, err));
};

const addViolation = (req, res) => {
  const violation = new Violation(req.body);
  violation
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => handleError(res, err));
};

const removeDups = (req, res) => {
  Violation.find()
    .then((violations) => {
      violations.forEach(function (doc) {
        Violation.deleteMany({
          "ID отказа": doc["ID отказа"],
          _id: { $lt: doc._id },
        })
          // .then((res) => console.log(res))
          .catch((err) => handleError(res, err));
      });
    })
    // .then((result) => {
    //   res.status(200).json(result);
    // })
    .catch((err) => handleError(res, err));
};

const addBulkOfViolations = (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  Violation.find()
    .then((violations) => {
      violations.forEach(function (doc) {
        Violation.deleteMany({
          "ID отказа": doc["ID отказа"],
          _id: { $lt: doc._id },
        })
          .then((res) => console.log(res))
          .catch((err) => handleError(res, err));
      });
    })
    // .then((result) => {
    //   res.status(200).json(result);
    // })
    .catch((err) => handleError(res, err));

  let promises = [];

  if (Object.keys(req.body[0]).includes("Ответственный")) {
    console.log(req.body[0]);
    promises = req.body.map(function (el) {
      return Violation.updateOne(
        { "ID отказа": el["#"] },
        {
          "Виновное предприятие": el["Ответственный"].trim(),
        },
        { upsert: false }
      );
    });
  }

  if (Object.keys(req.body[0]).includes("Виновное предприятие")) {
    promises = req.body.map(function (el) {
      return Violation.replaceOne(
        { "ID отказа": el["ID отказа"] },
        {
          "ID отказа": el["ID отказа"],
          "Начало отказа": el["Начало отказа"],
          "Категория отказа": el["Категория отказа"],
          "Вид технологического нарушения":
            el["Вид технологического нарушения"],
          "Виновное предприятие": el["Виновное предприятие"],
          "Причина 2 ур": el["Причина 2 ур"],
          "Количество грузовых поездов(по месту)":
            el["Количество грузовых поездов(по месту)"],
          "Время грузовых поездов(по месту)":
            el["Время грузовых поездов(по месту)"],
          "Количество пассажирских поездов(по месту)":
            el["Количество пассажирских поездов(по месту)"],
          "Время пассажирских поездов(по месту)":
            el["Время пассажирских поездов(по месту)"],
          "Количество пригородных поездов(по месту)":
            el["Количество пригородных поездов(по месту)"],
          "Время пригородных поездов(по месту)":
            el["Время пригородных поездов(по месту)"],
          "Количество прочих поездов(по месту)":
            el["Количество прочих поездов(по месту)"],
          "Время прочих поездов(по месту)":
            el["Время прочих поездов(по месту)"],
        },
        { upsert: true }
      );
    });
  }

  Promise.all(promises).then((result) => {
    res.status(201).json(result[0]);
  });
};

const deleteViolations = (req, res) => {
  Violation.deleteMany()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => handleError(res, err));
};

const updateViolation = (req, res) => {
  Violation.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => handleError(res, err));
};

module.exports = {
  getViolations,
  addViolation,
  deleteViolations,
  removeDups,
  updateViolation,
  addBulkOfViolations,
};

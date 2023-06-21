const express = require("express");
const Violation = require("../models/violation");

const router = express.Router();

let startTime = "Начало отказа",
  failCategory = "Категория отказа",
  failKind = "Вид технологического нарушения",
  guiltyUnit = "Виновное предприятие",
  failReason = "Причина 2 ур",
  freightDelayed = "Количество грузовых поездов(по месту)",
  freightDuration = "Время грузовых поездов(по месту)",
  passDelayed = "Количество пассажирских поездов(по месту)",
  passDuration = "Время пассажирских поездов(по месту)",
  subDelayed = "Количество пригородных поездов(по месту)",
  subDuration = "Время пригородных поездов(по месту)",
  otherDelayed = "Количество прочих поездов(по месту)",
  otherDuration = "Время прочих поездов(по месту)";

const handleError = (res, error) => {
  res.status(500).json({ error });
};

router.get("/violations", (req, res) => {
  Violation.find()
    .then((violations) => {
      res.status(200).json(violations);
    })
    .catch(() => handleError(res, "Что-то пошло не так..."));
});

router.post("/violations", (req, res) => {
  const violation = new Violation(req.body);
  violation
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch(() => handleError(res, "Что-то пошло не так..."));
});

router.patch("/violations", (req, res) => {
  Violation.insertOne(req.body)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch(() => handleError(res, "Что-то пошло не так..."));
});

//delete all documents
router.delete("/violations", (req, res) => {
  Violation.deleteMany()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(() => handleError(res, "Что-то пошло не так..."));
});

router.patch("/violations/:id", (req, res) => {
  Violation.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => {
      console.log(req.body[startTime]);
      res.status(200).json(result);
    })
    .catch(() => handleError(res, "Что-то пошло не так..."));
});

module.exports = router;

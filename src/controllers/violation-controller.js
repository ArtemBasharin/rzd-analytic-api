const express = require("express");
const Violation = require("../models/violation");

const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getViolations = (req, res) => {
  Violation.find()
    .then((violations) => {
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

const addBulkOfViolations = (req, res) => {
  const bulk = req.body;
  console.log(bulk);
  Violation.find()
    .forEach(function (p) {
      // bulk.forEach((el) => {
      //   if (el["ID отказа"] === p["ID отказа"])
      //     return (p = Object.assign({}, el));
      // });
      return p;
    })
    .toArray()
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => handleError(res, err));

  bulk.forEach((element) => {
    Violation.findOneAndReplace({ "ID отказа": element.id }, element);
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
  updateViolation,
  addBulkOfViolations,
};

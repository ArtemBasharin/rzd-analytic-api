const Violation = require("../models/violation");
const violationID = "ID отказа";

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
  Violation.insertMany(req.body)
    .then((result) => {
      console.log(result);

      res.status(201).json(result);
    })
    .catch((err) => handleError(res, err));

  // Violation.find({}, { violationID: 1 })
  //   .sort({ _id: 1 })
  // .forEach(function (doc) {
  //   Violation.remove({
  //     _id: { $gt: doc._id },
  //     violationID: doc.violationID,
  //   });
  // })
  // .then((result) => {

  //   res.status(201).json(result);
  // })
  // .catch((err) => handleError(res, err));
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

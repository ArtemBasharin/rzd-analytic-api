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
  let updates = 0;
  let inserts = 0;
  Violation.find()
    .then((violations) => {
      let ids = [];
      violations.forEach((el) => ids.push(el[violationID]));
      req.body.forEach((el_bulk) => {
        if (ids.includes(el_bulk[violationID])) {
          Violation.updateOne({ violationID: el_bulk[violationID] }, [
            { $set: { el_bulk } },
          ]);
          updates += 1;
          console.log("updated for", el_bulk[violationID]);
        } else {
          const violation = new Violation(el_bulk);
          violation.save();
          inserts += 1;
          console.log("inserted for", el_bulk[violationID]);
        }
      });
    })
    .then((result) => {
      res.send(updates + " updated, " + inserts + " inserted");
      res.status(201).json(result);
    })
    .catch((err) => handleError(res, err));
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

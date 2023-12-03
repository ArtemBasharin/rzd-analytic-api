const express = require("express");
const router = express.Router();
const cors = require("cors");

const {
  getViolations,
  addViolation,
  deleteViolations,
  removeDups,
  updateViolation,
  addBulkOfViolations,
} = require("../controllers/violation-controller");

router.get("/violations", getViolations);
router.post("/violations", addViolation);

router.delete("/violations", deleteViolations);

router.delete("/removedups", removeDups);

router.patch("/violations/:id", updateViolation);

router.options("/add-bulk-of-violations", cors()); // enable pre-flight request
router.post("/add-bulk-of-violations", addBulkOfViolations);

module.exports = router;

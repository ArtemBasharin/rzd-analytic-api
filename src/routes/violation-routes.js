const express = require("express");
const router = express.Router();

const {
  getViolations,
  addViolation,
  deleteViolations,
  updateViolation,
  addBulkOfViolations,
} = require("../controllers/violation-controller");

router.get("/violations", getViolations);
router.post("/violations", addViolation);
router.delete("/violations", deleteViolations);
router.patch("/violations/:id", updateViolation);

router.post("/add-bulk-of-violations", addBulkOfViolations);

module.exports = router;

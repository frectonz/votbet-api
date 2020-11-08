const express = require("express");
const {
  createCanidate,
  getCanidate,
  updateCanidate,
  deleteCanidate,
  vote,
} = require("../controllers/canidates.controller");

const { protect } = require("../middlewares/auth");

const router = express.Router();

router.post("/", protect, createCanidate);
router.put("/:canidateId/vote", protect, vote);
router.put("/:canidateId", protect, updateCanidate);
router.get("/:canidateId", protect, getCanidate);
router.delete("/:canidateId", protect, deleteCanidate);

module.exports = router;

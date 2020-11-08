const express = require("express");
const {
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comments.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.post("/", protect, createComment);
router.put("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;

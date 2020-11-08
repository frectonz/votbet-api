const express = require("express");
const {
  register,
  login,
  addBio,
  updateDetails,
  updatePassword,
  getMe,
} = require("../controllers/auth.controller");

const router = express.Router();
const { protect } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.put("/bio", protect, addBio);
router.put("/updateDetails", protect, updateDetails);
router.put("/updatePassword", protect, updatePassword);
router.get("/me", protect, getMe);

module.exports = router;

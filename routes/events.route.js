const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  watchEventById,
  eventsBeingWatched,
  serachEvents,
} = require("../controllers/events.controller");

const { protect } = require("../middlewares/auth");

const router = express.Router();

router.post("/", protect, createEvent);
router.get("/", protect, getAllEvents);
router.get("/watching", protect, eventsBeingWatched);
router.put("/search/", protect, serachEvents);

router.get("/:eventId", protect, getEventById);
router.put("/:eventId", protect, updateEventById);
router.delete("/:eventId", protect, deleteEventById);
router.put("/:eventId/watch", protect, watchEventById);

module.exports = router;

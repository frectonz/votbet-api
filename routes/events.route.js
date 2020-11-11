const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  watchEventById,
  eventsBeingWatched,
  uploadEventPicture,
} = require("../controllers/events.controller");

const { protect } = require("../middlewares/auth");

const router = express.Router();

router.post("/", protect, createEvent);
router.get("/", protect, getAllEvents);
router.get("/watching", protect, eventsBeingWatched);

router.get("/:eventId", protect, getEventById);
router.put("/:eventId", protect, updateEventById);
router.delete("/:eventId", protect, deleteEventById);
router.put("/:eventId/watch", protect, watchEventById);
router.put("/:eventId/picture", protect, uploadEventPicture);

module.exports = router;

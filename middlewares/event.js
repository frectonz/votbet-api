const Event = require("../models/Event.model");
const asyncHandler = require("../utils/async");
const ErrorResponse = require("../utils/errResponse");

const getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  console.log(req.params);

  if (event) {
    req.event = event;
    next();
  } else {
    return next(new ErrorResponse("Event not found.", 404));
  }
});

module.exports = getEvent;

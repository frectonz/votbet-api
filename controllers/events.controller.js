const asyncHandler = require("../utils/async");
const Event = require("../models/Event.model");
const ErrorResponse = require("../utils/errResponse");
const Watch = require("../models/Watch.model");
const Canidate = require("../models/Canidate.model");
const Comment = require("../models/Comment.model");

// @desc      Create an event
// @route     POST /api/v1/events/
// @access    Private
exports.createEvent = asyncHandler(async (req, res, next) => {
  if (!req.user.verified) {
    return next(new ErrorResponse("Account is not verified.", 400));
  }

  const eventBody = {
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    creator: req.user._id,
  };

  let event = await Event.create(eventBody);
  event = await Event.findById(event._id).populate("creator");

  res.json({
    success: true,
    data: event,
  });
});

// @desc      Get all events
// @route     GET /api/v1/events/
// @access    Private
exports.getAllEvents = asyncHandler(async (req, res) => {
  const filter = req.query.filter || "ONGOING"; // ONGOING || ENDED || ALL
  const limit = parseInt(req.query.limit) || 10; // 10
  const page = parseInt(req.query.page) || 1; // 1
  const sortBy = req.query.sortBy; // CREATION || WATCHERS

  // ongoing => endDate > Date.now
  // ended => endDate < Date.now
  let events;
  let query;
  if (filter === "ONGOING") {
    query = { endDate: { $gt: Date.now() } };
  } else if (filter === "ENDED") {
    query = { endDate: { $lt: Date.now() } };
  } else {
    query = {};
  }

  events = Event.find(query);

  if (sortBy === "WATCHERS") {
    events = events.sort("-totalWatchers");
  } else {
    events = events.sort("-createdAt");
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments(query);

  events = events.skip(startIndex).limit(limit);

  const results = await events;

  let pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: results.length,
    pagination,
    data: results,
  });
});

// @desc      Get event by id.
// @route     GET /api/v1/events/:eventId
// @access    Private
exports.getEventById = asyncHandler(async (req, res, next) => {
  const id = req.params.eventId;
  const event = await Event.findById(id).populate("creator");
  const canidates = await Canidate.find({ eventId: id });
  const comments = await Comment.find({ eventId: id }).populate("creator");
  const watches = await Watch.find({ watching: id });

  const eventBody = { ...event._doc };
  eventBody.canidates = canidates;
  eventBody.comments = comments;
  eventBody.watches = watches;

  // comments and canidates
  res.status(200).json({
    success: true,
    data: eventBody,
  });
});

// @desc      Update an event
// @route     PUT /api/v1/events/:eventId
// @access    Private
exports.updateEventById = asyncHandler(async (req, res, next) => {
  const id = req.params.eventId;
  const { name, description } = req.body;
  let event = await Event.findById(id);

  if (String(event.creator) !== String(req.user._id)) {
    return next(new ErrorResponse("Can not update event", 400));
  }

  event = await Event.findByIdAndUpdate(
    id,
    { name, description },
    {
      new: true,
      runValidators: true,
    }
  ).populate("creator");

  // comments and canidates
  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc      Delete an event
// @route     DELETE /api/v1/events/:eventId
// @access    Private
exports.deleteEventById = asyncHandler(async (req, res, next) => {
  const id = req.params.eventId;
  const event = await Event.findById(id);

  if (!event) {
    return next(new ErrorResponse("Event not found", 400));
  }

  if (String(event.creator) !== String(req.user._id)) {
    return next(new ErrorResponse("Can not delete event", 400));
  }

  await event.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Watch or UnWatch an event
// @route     PUT /api/v1/events/:eventId/watch
// @access    Private
exports.watchEventById = asyncHandler(async (req, res, next) => {
  const watching = req.params.eventId;
  const watcher = req.user._id;

  let watch = await Watch.findOne({ watching, watcher });
  const event = await Event.findById(watching);

  if (!event) {
    return next(new ErrorResponse("Event not found.", 400));
  }

  if (watch) {
    await watch.remove();
    event.totalWatchers--;
    watch = {};
  } else {
    watch = await Watch.create({ watching, watcher });
    event.totalWatchers++;
  }
  await event.save();

  res.status(200).json({
    success: true,
    data: watch,
  });
});

// @desc      List event being watched by a user
// @route     GET /api/v1/events/watching
// @access    Private
exports.eventsBeingWatched = asyncHandler(async (req, res) => {
  const watches = await Watch.find({ watcher: req.user._id }).sort(
    "-createdAt"
  );
  const eventIds = watches.map((watch) => watch.watching);

  const events = [];
  for (const id of eventIds) {
    events.push(await Event.findById(id).populate("creator"));
  }

  res.json({
    success: true,
    data: events,
  });
});

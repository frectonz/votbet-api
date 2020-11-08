const Canidate = require("../models/Canidate.model");
const Vote = require("../models/Vote.model");
const asyncHandler = require("../utils/async");
const Event = require("../models/Event.model");
const ErrorResponse = require("../utils/errResponse");

// @desc      Create a canidate on an event
// @route     POST /api/v1/canidates
// @access    Private
exports.createCanidate = asyncHandler(async (req, res) => {
  const { name, description, eventId } = req.body;

  const canidate = await Canidate.create({
    name,
    description,
    eventId,
  });

  res.status(201).json({
    success: true,
    data: canidate,
  });
});

// @desc      Get a canidate by id.
// @route     GET /api/v1/canidates/:canidateId
// @access    Private
exports.getCanidate = asyncHandler(async (req, res, next) => {
  const id = req.params.canidateId;
  const canidate = await Canidate.findById(id).populate("eventId");

  if (!canidate) {
    return next(new ErrorResponse("Canidate is not found.", 400));
  }

  const canidateBody = { ...canidate._doc };

  if (canidate.eventId.endDate < Date.now()) {
    canidateBody.votes = await Vote.find({ voteTo: canidate._id });
  } else {
    canidateBody.votes = [];
  }

  res.status(200).json({
    success: true,
    data: canidateBody,
  });
});

// @desc      Update a canidate by id.
// @route     PUT /api/v1/canidates/:canidateId
// @access    Private
exports.updateCanidate = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const id = req.params.canidateId;
  const canidate = await Canidate.findById(id);

  if (!canidate) {
    return next(new ErrorResponse("Canidate is not found.", 400));
  }

  const eventId = canidate.eventId;
  const event = await Event.findById(eventId);

  if (String(event.creator) !== String(req.user._id)) {
    return next(new ErrorResponse("Can not update canidate", 400));
  }

  canidate.name = name || canidate.name;
  canidate.description = description || canidate.description;
  await canidate.save();

  res.status(200).json({
    success: true,
    data: canidate,
  });
});

// @desc      Delete a canidate by id.
// @route     PUT /api/v1/canidates/:canidateId
// @access    Private
exports.deleteCanidate = asyncHandler(async (req, res, next) => {
  const id = req.params.canidateId;
  const canidate = await Canidate.findById(id);

  if (!canidate) {
    return next(new ErrorResponse("Canidate is not found.", 400));
  }

  const event = await Event.findById(canidate.eventId);
  event.totalVotes -= canidate.totalVotes;
  await event.save();
  await canidate.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Vote or Unvote a canidate by id.
// @route     PUT /api/v1/canidates/:canidateId/vote
// @access    Private
exports.vote = asyncHandler(async (req, res, next) => {
  const userID = req.user._id;
  const canidateId = req.params.canidateId;

  let vote = await Vote.findOne({
    voteTo: canidateId,
    voteBy: userID,
  });

  const canidate = await Canidate.findById(canidateId);
  const event = await Event.findById(canidate.eventId);

  if (
    !(
      Date.parse(event.startDate) < Date.now() &&
      Date.parse(event.endDate) > Date.now()
    )
  ) {
    console.log("true");
    return next(new ErrorResponse("Can not vote", 400));
  } else {
    console.log("false");
  }

  if (vote) {
    await vote.remove();
    vote = {};
    canidate.totalVotes--;
    event.totalVotes--;
  } else {
    // increse the count of votes on the canidate
    canidate.totalVotes++;

    // increse the count of votes on the event
    event.totalVotes++;

    // create a vote document
    vote = await Vote.create({
      voteTo: canidateId,
      voteBy: userID,
    });
  }

  await canidate.save();
  await event.save();

  res.status(200).json({
    success: true,
    data: vote,
  });
});

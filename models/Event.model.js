const mongoose = require("mongoose");
const Comment = require("./Comment.model");
const Canidate = require("./Canidate.model");
const Watch = require("./Watch.model");

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    text: true,
    required: [true, "Please add an event name"],
  },
  description: {
    type: String,
    text: true,
    required: [true, "Please add an event description"],
  },
  startDate: {
    type: Date,
    required: [true, "Please add an event starting date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please add an event ending date"],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please add an event creator"],
  },
  totalWatchers: {
    type: Number,
    default: 0,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  picture: {
    type: String,
    default: "none",
  },
});

EventSchema.pre("remove", { document: true, query: true }, async function () {
  const id = String(this._id);

  // delete all canidates
  await Canidate.deleteMany({ eventId: id });
  // delete all comments
  await Comment.deleteMany({ eventId: id });
  // delete all watches
  await Watch.deleteMany({ watching: id });
});

EventSchema.methods.getComments = async function () {
  const eventId = this._id;
  return await Comment.find({ eventId });
};

EventSchema.methods.getCanidates = async function () {
  const eventId = this._id;
  return await Canidate.find({ eventId });
};

// get voters only if the event has ended

module.exports = mongoose.model("Event", EventSchema);

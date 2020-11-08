const mongoose = require("mongoose");
const Vote = require("./Vote.model");

const CanidateSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please add a canidate name"],
  },
  description: {
    type: String,
    unique: true,
    required: [true, "Please add a canidate description"],
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Please add an event"],
  },
  picture: {
    type: String,
    default: "none",
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
});

CanidateSchema.pre("remove", { document: true }, async function () {
  const id = String(this._id);
  // delete all votes
  await Vote.deleteMany({ voteTo: id });
});

// Get the votes casted to a canidate.
CanidateSchema.methods.getCanidates = async function () {
  const canidateId = this._id;
  return await Vote.find({ voteTo: canidateId });
};

module.exports = mongoose.model("Canidate", CanidateSchema);

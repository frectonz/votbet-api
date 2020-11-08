const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  voteBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please add a voter."],
  },
  voteTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Canidate",
    required: [true, "Please add a canidate to vote to."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vote", VoteSchema);

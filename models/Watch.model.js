const mongoose = require("mongoose");

const WatchSchema = mongoose.Schema({
  watching: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Please add an event to watch"],
  },
  watcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please add an event watcher"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Watch", WatchSchema);

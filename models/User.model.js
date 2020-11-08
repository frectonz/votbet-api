const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Event = require("./Event.model");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please add an email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 4,
    select: false,
  },
  bio: {
    type: String,
    default: "",
  },
  verified: {
    type: Boolean,
    default: false,
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

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  // sign the wole user because the token eixsts even though the password is changed.
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get events created by this user
UserSchema.methods.getEvents = async function () {
  const userId = this._id;

  if (this.verified) {
    return await Event.find({ creator: userId }).sort("-createdAt");
  } else {
    return [];
  }
};

module.exports = mongoose.model("User", UserSchema);

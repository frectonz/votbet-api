const asyncHandler = require("../utils/async");
const User = require("../models/User.model");
const ErrorResponse = require("../utils/errResponse");

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    verified: true,
  });

  sendTokenResponse(user, 201, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid email", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid password", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Add user bio
// @route     PUT /api/v1/auth/bio
// @access    Private
exports.addBio = asyncHandler(async (req, res, next) => {
  const { bio } = req.body;
  const id = req.user._id;

  if (!bio) {
    return next(new ErrorResponse("Please input a bio.", 400));
  }

  const user = await User.findByIdAndUpdate(id, { bio }, { new: true });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update user Details
// @route     PUT /api/v1/auth/updateDetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name || req.user.name,
    email: req.body.email || req.user.email,
  };
  const id = req.user._id;

  const user = await User.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { newPassword, oldPassword } = req.body;

  const user = await User.findById(id).select("+password");

  if (!oldPassword) {
    return next(new ErrorResponse("Please input the old password."));
  }

  if (!newPassword) {
    return next(new ErrorResponse("Please input the new password."));
  }

  // Check current password
  if (!(await user.matchPassword(oldPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     PUT /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const userBody = { ...user._doc };
  userBody.events = await user.getEvents();

  res.status(200).json({
    success: true,
    data: userBody,
  });
});

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    data: user,
  });
};

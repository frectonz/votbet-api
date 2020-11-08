const Comment = require("../models/Comment.model");
const asyncHandler = require("../utils/async");
const ErrorResponse = require("../utils/errResponse");

// @desc      Create a comment on an event.
// @route     POST /api/v1/comments
// @access    Private
exports.createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({
    text: req.body.text,
    creator: req.user._id,
    eventId: req.body.eventId,
  });

  res.status(201).json({
    success: true,
    data: comment,
  });
});

// @desc      Update a comment on an event.
// @route     PUT /api/v1/comments/:commentId
// @access    Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const text = req.body.text;
  let comment = await Comment.findById(commentId);

  if (String(comment.creator) !== String(req.user._id)) {
    return next(new ErrorResponse("Can not update comment", 400));
  }

  comment = await Comment.findByIdAndUpdate(
    commentId,
    { text },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc      Delete a comment on an event.
// @route     DELETE /api/v1/comments/:commentId
// @access    Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (String(comment.creator) !== String(req.user._id)) {
    return next(new ErrorResponse("Can not delete comment", 400));
  }

  await comment.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

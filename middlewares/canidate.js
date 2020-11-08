const asyncHandler = require("../utils/async");
const Canidate = require("../models/Canidate.model");
const ErrorResponse = require("../utils/errResponse");

const canidate = asyncHandler(async (req, res, next) => {
  const canidate = await Canidate.findById(req.params.canidate_id);

  if (canidate) {
    req.canidate = canidate;
  } else {
    return next(new ErrorResponse("Canidate not found.", 404));
  }
});

module.exports = canidate;

const User = require("./../models/userModel");
const catchAsync = require("./../util/catchAsync");

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    user: newUser,
  });
});

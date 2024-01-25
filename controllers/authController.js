const User = require("./../models/userModel");
const catchAsync = require("./../util/catchAsync");
const jwt = require("jsonwebtoken");

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  console.log(process.env.JWT_EXPIRES_IN);

  const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    token,
    user: newUser,
  });
});

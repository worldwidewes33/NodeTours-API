const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");
const catchAsync = require("./../util/catchAsync");
const APIError = require("./../util/apiError");

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    token,
    user: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Verify email and password were sent in the request
  if (!email || !password) {
    const error = new APIError("Please provide an email and password", 400);
    return next(error);
  }

  const user = await User.findOne({ email }).select("+password");
  const verifyPassword = await user?.verifyPassword(password, user.password);

  // Verify user exists and password matches
  if (!user || !verifyPassword) {
    const error = new APIError("The email or password is invalid", 401);
    return next(error);
  }

  // Sign token and send response
  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ status: "success", token });
});

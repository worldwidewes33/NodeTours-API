const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");
const catchAsync = require("./../util/catchAsync");
const APIError = require("./../util/apiError");

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordUpdatedAt } =
    req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordUpdatedAt,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
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
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ status: "success", token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get the token
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    const error = new APIError(
      "You need to login to access this resource",
      401
    );
    return next(error);
  }

  const token = req.headers.authorization.split(" ")[1];

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    const error = new APIError("You need to provide a valid jsonwebtoken", 401);
    return next(error);
  }

  // Check if the user exists
  const user = await User.findById(decoded.id);

  if (!user) {
    const error = new APIError("The user does not exist", 401);
    return next(error);
  }

  // Check to see if password has changed since jwt was signed
  if (user.passwordChangedAfter(decoded.iat)) {
    const error = new APIError(
      "User password has changed. Please login again.",
      401
    );
  }

  req.user = user;
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new APIError(
        `User is restricted from access this resource`,
        403
      );
      return next(error);
    }
    next();
  };
};

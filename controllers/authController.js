const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const APIError = require('../util/apiError');
const sendEmail = require('../util/email');

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
    status: 'success',
    token,
    user: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Verify email and password were sent in the request
  if (!email || !password) {
    const error = new APIError('Please provide an email and password', 400);
    return next(error);
  }

  const user = await User.findOne({ email }).select('+password');
  const verifyPassword = await user?.verifyPassword(password, user.password);

  // Verify user exists and password matches
  if (!user || !verifyPassword) {
    const error = new APIError('The email or password is invalid', 401);
    return next(error);
  }

  // Sign token and send response
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get the token
  if (!req.headers.authorization?.startsWith('Bearer')) {
    const error = new APIError('Please login to access this resource', 401);
    return next(error);
  }

  const token = req.headers.authorization.split(' ')[1];

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    const error = new APIError(
      'Invalid jsonwebtoken. Please login again.',
      401,
    );
    return next(error);
  }

  // Check if the user exists
  const user = await User.findById(decoded.id);

  if (!user) {
    const error = new APIError('The user does not exist', 401);
    return next(error);
  }

  // Check to see if password has changed since jwt was signed
  if (user.passwordChangedAfter(decoded.iat)) {
    const error = new APIError(
      'User password has changed. Please login again.',
      401,
    );
    next(error);
  }

  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new APIError(
        `User is not permitted to perform this action`,
        403,
      );
      return next(error);
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get the user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new APIError('No user exits with this email', 404);
    next(error);
  }

  // Generate random token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  const resetURL = `${req.protocol}://${req.get('host')}/api/users/${resetToken}`;
  const message = `Please reset your password by sending a PATCH request with the password and passwordConfirm to: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Please reset password. (Reset Token only good for 15 min)',
      message,
    });
    res
      .status(200)
      .json({ status: 'success', message: 'Reset url sent to user email.' });
  } catch (err) {
    //reset token properties if an error occurs
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const error = new APIError(
      'Unable to send password reset email. Please try again later!',
      500,
    );
    next(error);
  }
});

exports.resetPassword = (req, res, next) => {};

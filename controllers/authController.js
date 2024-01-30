const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const APIError = require('../util/apiError');
const sendEmail = require('../util/email');

const createSendJWT = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // cookie expires after 24 hours
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    .status(statusCode)
    .json({ status: 'success', user });
};

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

  createSendJWT(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Verify email and password were sent in the request
  if (!email || !password) {
    const error = new APIError('Please provide an email and password', 400);
    return next(error);
  }

  const user = await User.findOne({ email }).select('+password -__v');
  const passwordVerified = await user?.verifyPassword(password, user.password);

  // Verify user exists and password matches
  if (!user || !passwordVerified) {
    const error = new APIError('The email or password is invalid', 401);
    return next(error);
  }

  // Sign token and send response
  createSendJWT(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.access_token;
  // Get the token
  if (!token) {
    const error = new APIError('Please login to access this resource', 401);
    return next(error);
  }

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
    return next(error);
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
    return next(error);
  }

  // Generate random token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
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

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  }).select('-__v');

  if (!user) {
    const error = new APIError('Token is invalid or expired', 400);
    return next(error);
  }

  // Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // Sign token
  createSendJWT(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user with password
  const user = await User.findById(req.user.id).select('+password -__v');

  // verify password
  const passwordVerified = await user.verifyPassword(
    req.body.currentPassword,
    user.password,
  );

  if (!passwordVerified) {
    const error = new APIError('The password is incorrect', 401);
    return next(error);
  }

  // Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Sign token
  createSendJWT(user, 200, res);
});

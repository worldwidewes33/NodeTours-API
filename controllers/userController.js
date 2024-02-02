const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const APIError = require('../util/apiError');

// Helper functions
const filterObj = (obj, ...fields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};

// User Middleware functions
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-__v');

  res.status(200).json({ status: 'success', data: users });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Check if any password information was patched
  if (req.body.password || req.body.passwordConfirm) {
    const error = new APIError(
      'Cannot update user password. Please us route /updatePassword',
      400,
    );
    return next(error);
  }

  // Update user fields for name and email only
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filterObj(req.body, 'name', 'email'),
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

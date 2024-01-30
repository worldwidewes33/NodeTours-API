const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const APIError = require('../util/apiError');

const filterObj = (obj, ...fields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    const error = new APIError(
      'Cannot update user password. Please us route /updatePassword',
      400,
    );
    return next(error);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filterObj(req.body, 'name', 'email'),
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({ status: 'success', user: updatedUser });
});

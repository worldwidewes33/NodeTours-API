const crypto = require("crypto");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (val) {
        const emailRegEx = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegEx.test(val);
      },
      message: "Invalid email: {VALUE}",
    },
  },
  role: {
    type: String,
    default: "user",
    enum: {
      values: ["user", "guide", "lead-guide", "admin"],
      message:
        "A user's role can only be one of: user, guide, lead-guide, and admin",
    },
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "A password must be at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "The passwords do not match",
    },
  },
  passwordUpdatedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  // check if password has changed
  if (!this.isModified("password")) return next();

  // hash password and replace with the hashed value
  this.password = await bcrypt.hash(this.password, 12);

  // remove the passwordConfirm property
  this.passwordConfirm = undefined;
});

userSchema.methods.verifyPassword = async function (
  testPassword,
  userPassword
) {
  return await bcrypt.compare(testPassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (timestamp) {
  if (this.passwordUpdatedAt) {
    const passwordTimestamp = this.passwordUpdatedAt.getTime() / 1000;

    return passwordTimestamp > timestamp;
  }

  // default if password has not changed
  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 15 * 60 * 1000;

  console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;

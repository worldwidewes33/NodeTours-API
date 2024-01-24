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
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "A password must be at least 8 characters"],
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
});

userSchema.pre("save", async function (next) {
  // check if password has changed
  if (!this.isModified("password")) return next();

  // hash password and replace with the hashed value
  this.password = await bcrypt.hash(this.password, 12);

  // remove the passwordConfirm property
  this.passwordConfirm = undefined;
});

const User = mongoose.model("User", userSchema);

module.exports = User;

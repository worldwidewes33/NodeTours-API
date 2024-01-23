const mongoose = require("mongoose");

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
  passwordConfirmed: {
    type: String,
    required: [true, "Please confirm your password"],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

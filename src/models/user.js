const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,

      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Enter valid email");
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate(value) {
        if (!validator.isStrongPassword(value))
          throw new Error("Enter strong password");
      },
    },

    age: {
      type: Number,
      min: 18,
      max: 100,
    },

    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender must be male, female or other");
        }
      },
    },

    photoUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",

      validate(value) {
        if (!validator.isURL(value)) throw new Error("Enter valid URL");
      },
    },

    about: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "This is a default about section",
    },

    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "DEV@tinder123", {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (userPassword) {
  const user = this;

  const isValidPassword = await bcrypt.compare(userPassword, user.password);
  return isValidPassword;
};

module.exports = mongoose.model("User", userSchema);

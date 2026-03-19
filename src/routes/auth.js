const express = require("express");

const User = require("../models/user");
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, skills } = req.body;

    validateSignupData(req);

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    if (skills?.length > 10) {
      throw new Error("Skills should be less than 11");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      skills,
    });

    const savedUser = await user.save();

    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), //8 hours expiration
    });

    res.json({ message: "Signup successful", data: savedUser });
  } catch (error) {
    res.status(400).send("Error handling signup: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("invalid credentials");
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("invalid credentials");
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error("invalid credentials");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), //8 hours expiration
    });

    res.send(user);
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send("logout successful");
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
});

module.exports = authRouter;

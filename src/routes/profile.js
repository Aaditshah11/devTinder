const express = require("express");
const { userAuth } = require("../middleware/auth");
const {
  validateProfileUpdateData,
  validatePasswordUpdate,
} = require("../utils/validation");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "age",
      "about",
      "skills",
      "gender",
      "photoUrl",
    ];

    const isAllowedUpdate = Object.keys(req.body).every((field) =>
      allowedUpdates.includes(field),
    );

    if (!isAllowedUpdate) {
      throw new Error("Update not allowed");
    }

    validateProfileUpdateData(req);

    const user = req.user;

    Object.keys(req.body).forEach((field) => {
      user[field] = req.body[field];
    });

    await user.save();

    res.send(`${user.firstName}, your Profile updated successfully`, user);
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    await validatePasswordUpdate(req);
    const user = req.user;

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.send("password update success");
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;

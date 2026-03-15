const express = require("express");
const { userAuth } = require("../middleware/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

const SAFE_FIELDS = ["firstName", "lastName", "photoUrl", "about"];

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", SAFE_FIELDS);

    if (!connectionRequests)
      return res.status(404).json({ message: "no connection requests" });

    res.json({ message: "All connection requests", data: connectionRequests });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        status: "accepted",
      })
      .populate("fromUserId", SAFE_FIELDS)
      .populate("toUserId", SAFE_FIELDS);

    console.log(connections);

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString())
        return row.toUserId;
      else return row.fromUserId;
    });

    res.json({ message: "All connections", data });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit || 0;

    const loggedInUser = req.user;

    const existingConnections = await connectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    });

    const excludedUserIds = existingConnections.map((conn) => {
      return conn.fromUserId.equals(loggedInUser._id)
        ? conn.toUserId
        : conn.fromUserId;
    });

    const allExcludedIds = [...excludedUserIds, loggedInUser._id];

    const feed = await User.find({ _id: { $nin: allExcludedIds } })
      .select(SAFE_FIELDS)
      .skip(skip)
      .limit(limit);
    res.json({ message: "User feed fetched successfully", data: feed });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

module.exports = userRouter;

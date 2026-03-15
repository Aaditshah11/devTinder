const express = require("express");
const { userAuth } = require("../middleware/auth");
const connectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", ["firstName", "lastName", "photoUrl", "about"]);

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
      .populate("fromUserId", ["firstName", "lastName", "photoUrl", "about"])
      .populate("toUserId", ["firstName", "lastName", "photoUrl", "about"]);

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

module.exports = userRouter;

const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const user = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.userId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status))
        return res.json({ message: "invalid status" });

      const isUserExisting = await user.findById(toUserId);

      if (!isUserExisting) return res.json({ message: "user does not exist" });

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest)
        return res.json({ message: "connection already exist" });

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: "connection request sent successfully",
        data,
      });
    } catch (err) {
      res.status(401).send("ERROR: " + err.message);
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      //connection request allowed?
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status))
        return res.status(400).json({ message: "invalid status" });

      //connection req exist?
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest)
        return res
          .status(404)
          .json({ message: "connection req does not exist" });

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "connection request " + status, data });
    } catch (err) {
      res.status(401).send("ERROR: " + err.message);
    }
  },
);

module.exports = requestRouter;

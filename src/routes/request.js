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

module.exports = requestRouter;

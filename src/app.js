const express = require("express");
const { connectDB } = require("./config/database");
const User = require("./models/user");
const app = express();

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "Aadit",
    lastName: "Shah",
    emailId: "aadit@121",
  });

  try {
    await user.save();
    res.send("signup successful");
  } catch (error) {
    res.status(400).send("error handling signup" + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("database connection established");
    app.listen(3000, () => {
      console.log("server running on 3000");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
  });

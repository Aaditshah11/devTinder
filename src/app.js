const express = require("express");
const { connectDB } = require("./config/database");
const User = require("./models/user");
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.send("signup successful");
  } catch (error) {
    res.status(400).send("error handling signup" + error.message);
  }
});

//get /user by email
app.get("/user", async (req, res) => {
  const userEmail = req.query.emailId;

  try {
    const user = await User.find({ emailId: userEmail });

    if (!user) {
      return res.send("no users found");
    }

    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

//get all users
app.get("/feed", async (req, res) => {
  try {
    const users = await Users.find({});
    if (!users) res.send("No users");
    else res.send(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
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

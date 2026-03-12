const express = require("express");
const { connectDB } = require("./config/database");
const User = require("./models/user");
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    if (req.body?.skills?.length > 10)
      throw new Error("Skills should be less than 11");

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
    const users = await User.find({});
    if (!users) res.send("No users");
    else res.send(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
});

//delete by id
app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send("User deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  next();
});

//update user by id
app.patch("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "skills", "age"];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k),
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (data?.skills?.length > 10)
      throw new Error("Skills should be less than 11");

    const user = await User.findByIdAndUpdate(userId, data);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(user);
  } catch (err) {
    res.status(500).send("Error updating user. " + err.message);
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

const express = require("express");
const { connectDB } = require("./config/database");
const User = require("./models/user");
const app = express();
const { validateSignupData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth");

app.use(cookieParser());
app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, skills } = req.body;

    // 1️⃣ Validate input
    validateSignupData(req);

    // 2️⃣ Check duplicate email
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // 3️⃣ Validate skills length
    if (skills?.length > 10) {
      throw new Error("Skills should be less than 11");
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      skills,
    });

    // 6️⃣ Save to database
    await user.save();

    res.send("Signup successful");
  } catch (error) {
    res.status(400).send("Error handling signup: " + error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("Invalid credentials");
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), //8 hours expiration
    });

    res.send("Login successful");
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " sent a connection request");
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
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

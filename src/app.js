const express = require("express");

const app = express();

const { adminAuth, userAuth } = require("./middleware/auth.js");

app.use("/admin", adminAuth);

app.post("/user/login", (req, res) => {
  res.send("user successfully logged in");
});

app.get("/user/getData", userAuth, (req, res) => {
  res.send("user data");
});

app.get("/admin/getData", (req, res) => {
  res.send("admin data");
});

app.listen(3000, () => {
  console.log("server running on 3000");
});

const adminAuth = (req, res, next) => {
  const adminKey = "xyz";
  if (adminKey !== "xyz") res.send("admin auth denied");
  else next();
};

function userAuth(req, res, next) {
  const userKey = "xyz";
  if (userKey !== "xyz") res.send("user auth denied");
  else next();
}

module.exports = { adminAuth, userAuth };

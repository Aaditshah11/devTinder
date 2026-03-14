const validator = require("validator");
function validateSignupData(req) {
  const { firstName, emailId, password } = req.body || {};

  if (!firstName) throw new Error("Enter first name");

  if (!validator.isEmail(emailId)) throw new Error("Enter valid email");

  if (!validator.isStrongPassword(password))
    throw new Error("Enter strong password");
}

function validateProfileUpdateData(req) {
  const { firstName, lastName, age, skills, about, photoUrl, gender } =
    req.body || {};

  if (firstName && (firstName.length > 50 || firstName.length < 4))
    throw new Error("First name must be between 4 and 50 characters");

  if (lastName && (lastName.length > 50 || lastName.length < 2))
    throw new Error("Last name is invalid");

  if (photoUrl && !validator.isURL(photoUrl))
    throw new Error("Enter valid URL");

  if (age !== undefined && (age > 100 || age < 18))
    throw new Error("Age not allowed");

  if (about && about.length > 200)
    throw new Error("Max about is 200 characters");

  if (skills && skills.length > 10) throw new Error("Max 10 skills allowed");

  const allowedGender = ["male", "female", "other"];

  if (gender && !allowedGender.includes(gender))
    throw new Error(
      "Gender invalid. Allowed genders are [" + allowedGender.join(", ") + "]",
    );
}

const validatePasswordUpdate = async (req) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;

  const isValidPassword = await user.validatePassword(oldPassword);

  if (!isValidPassword) throw new Error("incorrect password");

  if (!validator.isStrongPassword(newPassword))
    throw new Error("weak password");
};

module.exports = {
  validateSignupData,
  validateProfileUpdateData,
  validatePasswordUpdate,
};

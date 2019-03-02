const jwt = require("jsonwebtoken");
const errorHandling = require("../error-handling/");
const { publicKey } = require("../../config");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = errorHandling.createError("Not authenticated.", 401);
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, publicKey, { algorithms: "RS256" });
  } catch (err) {
    if (!err.message === "jwt expired") {
      err.message = "Invalid Token";
    }
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = errorHandling.createError("Not authenticated.", 401);
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

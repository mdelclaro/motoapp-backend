const jwt = require("jsonwebtoken");

const { refreshTokenPrivateKey } = require("../../../config");

const Cliente = require("../../../models/usuario/cliente/");
const errorHandling = require("../../../utils/error-handling/");

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;

    try {
      decodedToken = jwt.verify(refreshToken, refreshTokenPrivateKey);
    } catch (err) {
      err.message = "Invalid Token";
      err.statusCode = 500;
      throw err;
    }
    const token = jwt.sign(
      {
        email: cliente.email,
        userId: cliente._id.toString()
      },
      privateKey,
      { expiresIn: "1h" }
    );
    let expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    res.status(200).json({
      token,
      userId: cliente._id.toString(),
      expiryDate: expiryDate.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

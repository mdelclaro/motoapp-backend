const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  privateKey,
  refreshTokenPrivateKey,
  refreshTokenPublicKey
} = require("../../../config");

const Motoqueiro = require("../../../models/usuario/motoqueiro/");
const errorHandling = require("../../../utils/error-handling/");

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const senha = req.body.senha;

    const motoqueiro = await Motoqueiro.findOne({ email });
    if (!motoqueiro) {
      const error = errorHandling.createError("E-mail nao cadastrado", 401);
      throw error;
    }
    const isEqual = await bcrypt.compare(senha, motoqueiro.senha);
    if (!isEqual) {
      const error = errorHandling.createError("Senha invalida", 401);
      throw error;
    }
    const token = jwt.sign(
      {
        email: motoqueiro.email,
        userId: motoqueiro._id.toString()
      },
      privateKey,
      { expiresIn: "1h", algorithm: "RS256" }
    );
    const refreshToken = jwt.sign(
      {
        email: motoqueiro.email,
        userId: motoqueiro._id.toString()
      },
      refreshTokenPrivateKey,
      { algorithm: "RS256" }
    );
    let expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    res.status(200).json({
      token,
      refreshToken,
      expiryDate: expiryDate.toString(),
      userId: motoqueiro._id.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    const email = req.body.email;

    const motoqueiro = await Motoqueiro.findOne({ email });
    if (!motoqueiro) {
      const error = errorHandling.createError("E-mail nao cadastrado", 401);
      throw error;
    }

    try {
      decodedToken = jwt.verify(refreshToken, refreshTokenPublicKey);
    } catch (err) {
      err.message = "Invalid Token";
      err.statusCode = 500;
      throw err;
    }
    const token = jwt.sign(
      {
        email: motoqueiro.email,
        userId: motoqueiro._id.toString()
      },
      privateKey,
      { expiresIn: "1h", algorithm: "RS256" }
    );
    let expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    res.status(200).json({
      token,
      userId: motoqueiro._id.toString(),
      expiryDate: expiryDate.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

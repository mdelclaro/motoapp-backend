const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator/check");

const {
  privateKey,
  refreshTokenPrivateKey,
  refreshTokenPublicKey
} = require("../utils/config");

const { Motoqueiro } = require("../models");
const { errorHandling } = require("../utils");

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error.errorHandling.createError("Validation failed", 422, errors);
      throw error;
    }

    const email = req.body.email;
    const senha = req.body.senha;
    const motoqueiro = await Motoqueiro.findOne({ email }).select("+senha");

    if (!motoqueiro) {
      const error = errorHandling.createError("E-mail não cadastrado", 401);
      throw error;
    }
    const isEqual = await bcrypt.compare(senha, motoqueiro.senha);
    if (!isEqual) {
      const error = errorHandling.createError("Senha inválida", 401);
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
      userId: motoqueiro._id.toString(),
      accountStatus: motoqueiro.status,
      imgPerfil: motoqueiro.imgPerfil
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
    let decodedToken;

    try {
      decodedToken = jwt.verify(refreshToken, refreshTokenPublicKey);
    } catch (err) {
      err.message = "Token inválido";
      err.statusCode = 500;
      throw err;
    }
    const email = decodedToken.email;
    const motoqueiro = await Motoqueiro.findOne({ email });
    if (!motoqueiro) {
      const error = errorHandling.createError("E-mail não cadastrado", 401);
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
    let expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    res.status(200).json({
      token,
      userId: motoqueiro._id.toString(),
      expiryDate: expiryDate.toString(),
      accountStatus: motoqueiro.status
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

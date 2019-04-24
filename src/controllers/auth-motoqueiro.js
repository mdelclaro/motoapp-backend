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
      const error = errorHandling.createError("Validation failed", 422, errors);
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
    const token = await jwt.sign(
      {
        email: motoqueiro.email,
        userId: motoqueiro._id.toString()
      },
      privateKey,
      { expiresIn: "1h", algorithm: "RS256" }
    );
    const refreshToken = await jwt.sign(
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
    return;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err;
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errorHandling.createError("Validation failed", 422, errors);
      throw error;
    }

    const refreshToken = req.body.refreshToken;
    let decodedToken;

    try {
      decodedToken = await jwt.verify(refreshToken, refreshTokenPublicKey);
      if (!decodedToken) throw new Error();
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

    const token = await jwt.sign(
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
    return;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err;
  }
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  privateKey,
  refreshTokenPrivateKey,
  refreshTokenPublicKey
} = require("../../../config");

const Cliente = require("../../../models/usuario/cliente/");
const errorHandling = require("../../../utils/error-handling/");

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const senha = req.body.senha;

    const cliente = await Cliente.findOne({ email });
    if (!cliente) {
      const error = errorHandling.createError("E-mail não cadastrado", 401);
      throw error;
    }
    const isEqual = await bcrypt.compare(senha, cliente.senha);
    if (!isEqual) {
      const error = errorHandling.createError("Senha inválida", 401);
      throw error;
    }
    const token = jwt.sign(
      {
        email: cliente.email,
        userId: cliente._id.toString()
      },
      privateKey,
      { expiresIn: "1h", algorithm: "RS256" }
    );
    const refreshToken = jwt.sign(
      {
        email: cliente.email,
        userId: cliente._id.toString()
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
      userId: cliente._id.toString()
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
    const cliente = await Cliente.findOne({ email });
    if (!cliente) {
      const error = errorHandling.createError("E-mail não cadastrado", 401);
      throw error;
    }

    const token = jwt.sign(
      {
        email: cliente.email,
        userId: cliente._id.toString()
      },
      privateKey,
      { expiresIn: "1h", algorithm: "RS256" }
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

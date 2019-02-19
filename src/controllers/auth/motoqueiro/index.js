const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { privateKey } = require("../../../config");

const Motoqueiro = require("../../../models/usuario/motoqueiro/");
const errorHandling = require("../../../utils/error-handling/");

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const senha = req.body.senha;

  try {
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
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, userId: motoqueiro._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

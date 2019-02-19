const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { privateKey } = require("../../../config");

const Cliente = require("../../../models/usuario/cliente/");
const errorHandling = require("../../../utils/error-handling/");

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const senha = req.body.senha;

  try {
    const cliente = await Cliente.findOne({ email });
    if (!cliente) {
      const error = errorHandling.createError("E-mail nao cadastrado", 401);
      throw error;
    }
    const isEqual = await bcrypt.compare(senha, cliente.senha);
    if (!isEqual) {
      const error = errorHandling.createError("Senha invalida", 401);
      throw error;
    }
    const token = jwt.sign(
      {
        email: cliente.email,
        userId: cliente._id.toString()
      },
      privateKey,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, userId: cliente._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

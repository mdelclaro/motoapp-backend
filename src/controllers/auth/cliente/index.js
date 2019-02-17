const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Cliente = require("../../../models/usuario/cliente/");
const errorHandling = require("../../../utils/error-handling/");

exports.login = (req, res, next) => {
  const email = req.body.email;
  const senha = req.body.senha;
  let _cliente;

  Cliente.findOne({ email })
    .then(cliente => {
      if (!cliente) {
        const error = errorHandling.createError("E-mail nao cadastrado", 401);
        throw error;
      }
      _cliente = cliente;
      return bcrypt.compare(senha, cliente.senha);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = errorHandling.createError("Senha invalida", 401);
        throw error;
      }
      const token = jwt.sign(
        {
          email: _cliente.email,
          userId: _cliente._id.toString()
        },
        "secret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token, userId: _cliente._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Motoqueiro = require("../../../models/usuario/motoqueiro/");
const errorHandling = require("../../../utils/error-handling/");

exports.login = (req, res, next) => {
  const email = req.body.email;
  const senha = req.body.senha;
  let _motoqueiro;

  Motoqueiro.findOne({ email })
    .then(motoqueiro => {
      if (!motoqueiro) {
        const error = errorHandling.createError("E-mail nao cadastrado", 401);
        throw error;
      }
      _motoqueiro = motoqueiro;
      return bcrypt.compare(senha, motoqueiro.senha);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = errorHandling.createError("Senha invalida", 401);
        throw error;
      }
      const token = jwt.sign(
        {
          email: _motoqueiro.email,
          userId: _motoqueiro._id.toString()
        },
        "secret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token, userId: _motoqueiro._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

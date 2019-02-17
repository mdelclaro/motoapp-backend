const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");

const Motoqueiro = require("../../../models/usuario/motoqueiro/");
const errorHandling = require("../../../utils/error-handling/");

// Buscar Motoqueiros
exports.getMotoqueiros = (req, res, next) => {
  Motoqueiro.find()
    .then(motoqueiros => {
      if (!motoqueiros) {
        error = errorHandling.createError("Nenhum motoqueiro encontrado.", 404);
        throw error;
      }
      res.status(200).json({ message: "Sucesso", motoqueiros });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Buscar Motoqueiro por ID
exports.getMotoqueiro = (req, res, next) => {
  const idMotoqueiro = req.params.idMotoqueiro;
  if (!ObjectId.isValid(idMotoqueiro)) {
    error = errorHandling.createError("ID invalido.", 422);
    throw error;
  }
  Motoqueiro.findById(idMotoqueiro)
    .then(motoqueiro => {
      if (!motoqueiro) {
        error = errorHandling.createError("Nenhum motoqueiro encontrado.", 404);
        throw error;
      }
      res.status(200).json({ message: "Sucesso", motoqueiro });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Criar Motoqueiro
exports.createMotoqueiro = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error = errorHandling.createError("Validation Failed", 422, errors);
    throw error;
  }
  const nome = req.body.nome;
  const sobrenome = req.body.sobrenome;
  const email = req.body.email;
  const cnh = req.body.cnh;
  const placa = req.body.placa;

  bcrypt.hash(req.body.senha, 10, (err, hash) => {
    const senha = hash;
    if (err) {
      error = errorHandling.createError("Erro bcrypt", 422);
      throw error;
    }
    const motoqueiro = new Motoqueiro({
      nome,
      sobrenome,
      email,
      senha,
      cnh,
      placa
    });

    motoqueiro
      .save()
      .then(result => {
        res.status(201).json({
          message: "Motoqueiro criado com sucesso!",
          motoqueiro: result
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  });
};

// Atualizar Motoqueiro
exports.updateMotoqueiro = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error = errorHandling.createError("Validation Failed", 422, errors);
    throw error;
  }

  const idMotoqueiro = req.params.idMotoqueiro;
  const email = req.body.email;
  const senha = req.body.senha;
  const placa = req.body.placa;

  if (!ObjectId.isValid(idMotoqueiro)) {
    error = errorHandling.createError("ID invalido.", 422);
    throw error;
  }

  Motoqueiro.findById(idMotoqueiro)
    .then(motoqueiro => {
      if (!motoqueiro) {
        error = errorHandling.createError("Motoqueiro nao encontrado.", 404);
        throw error;
      }

      // altera email e placa
      motoqueiro.email = email ? email : motoqueiro.email;
      motoqueiro.placa = placa ? placa : motoqueiro.placa;

      // altera senha
      if (senha) {
        bcrypt.hash(senha, 10, (err, hash) => {
          if (err) {
            error = errorHandling.createError("Encrypt Failed", 422);
            throw error;
          }
          cliente.senha = hash;
        });
      }

      return motoqueiro.save();
    })
    .then(result => {
      res
        .status(200)
        .json({ message: "Cliente Atualizado", motoqueiro: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

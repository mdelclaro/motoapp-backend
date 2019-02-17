const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");

const Cliente = require("../../../models/usuario/cliente/");
const errorHandling = require("../../../utils/error-handling/");

// Buscar Clientes
exports.getClientes = (req, res, next) => {
  Cliente.find()
    .then(clientes => {
      if (!clientes) {
        error = errorHandling.createError("Nenhum cliente encontrado.", 404);
        throw error;
      }
      res.status(200).json({ message: "Sucesso", clientes });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Buscar Cliente por ID
exports.getCliente = (req, res, next) => {
  const idCliente = req.params.idCliente;
  if (!ObjectId.isValid(idCliente)) {
    error = errorHandling.createError("ID invalido.", 422);
    throw error;
  }
  Cliente.findById(idCliente)
    .then(cliente => {
      if (!cliente) {
        error = errorHandling.createError("Nenhum cliente encontrado.", 404);
        throw error;
      }
      res.status(200).json({ message: "Sucesso", cliente });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Criar Cliente
exports.createCliente = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error = errorHandling.createError("Validation Failed", 422);
    throw error;
  }
  const nome = req.body.nome;
  const sobrenome = req.body.sobrenome;
  const email = req.body.email;

  // Checa se e-mail ja esta cadastrado
  Cliente.findOne({ email })
    .then(cliente => {
      // esta
      if (cliente) {
        error = errorHandling.createError("Email ja cadastrado", 422);
        throw error;
      }

      // nao esta
      bcrypt.hash(req.body.senha, 10, (err, hash) => {
        const senha = hash;
        if (err) {
          error = errorHandling.createError("Validation Failed", 422);
          throw error;
        }
        const cliente = new Cliente({
          nome,
          sobrenome,
          email,
          senha
        });

        cliente
          .save()
          .then(result => {
            res.status(201).json({
              message: "Cliente criado com sucesso!",
              cliente: result
            });
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      });
    })
    .catch(err => next(err));
};

// Atualizar Cliente
exports.updateCliente = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error = errorHandling.createError("Validation Failed", 422);
    throw error;
  }

  const idCliente = req.body.idCliente;
  const email = req.body.email;
  const senha = req.body.senha;

  Cliente.findOne({ email })
    .then(cliente => {
      if (cliente) {
        error = errorHandling.createError("Email ja cadastrado", 422);
        throw error;
      }
      Cliente.findById(idCliente)
        .then(cliente => {
          if (!cliente) {
            error = errorHandling.createError("Cliente nao encontrado.", 404);
            throw error;
          }
          cliente.email = email ? email : cliente.email;
          cliente.senha = senha ? senha : cliente.senha;
          return cliente.save();
        })
        .then(result => {
          res
            .status(200)
            .json({ message: "Cliente Atualizado", cliente: result });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch(err => next(err));
};

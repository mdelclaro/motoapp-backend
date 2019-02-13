const { validationResult } = require("express-validator/check");

const Corrida = require("../models/corrida");

// Buscar Corridas
exports.getCorridas = (req, res, next) => {
  Corrida.find()
    .then(corridas => {
      if (!corridas) {
        const error = new Error("Nenhuma corrida encontrada.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Sucesso", corridas });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Buscar Corrida por ID
exports.getCorrida = (req, res, next) => {
  const idCorrida = req.body.idCorrida;
  Corrida.findById(idCorrida)
    .then(corrida => {
      if (!corrida) {
        const error = new Error("Nenhuma corrida encontrada.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Sucesso", corrida });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Criar Corrida
exports.createCorrida = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  const origem = req.body.origem;
  const destino = req.body.destino;
  const idCliente = req.body.idCliente;
  const status = 0;

  const corrida = new Corrida({
    origem,
    destino,
    idCliente,
    status
  });

  corrida
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Corrida criada com sucesso!",
        corrida: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Atualizar Corrida
exports.updateCorrida = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    throw error;
  }
  if (!req.body.status) {
    const error = new Error("Required parameter (status) not provided");
    error.statusCode = 422;
    throw error;
  }

  const idCorrida = req.body.idCorrida;
  const idMotoqueiro = req.body.idMotoqueiro || null;
  const status = req.body.status || null;

  console.log("idMoto: " + idMotoqueiro + " status: " + status);

  Corrida.findById(idCorrida)
    .then(corrida => {
      if (!corrida) {
        const error = new Error("Corrida nao encontrada.");
        error.statusCode = 404;
        throw error;
      }
      corrida.idMotoqueiro = idMotoqueiro ? idMotoqueiro : corrida.idMotoqueiro;
      corrida.status = status ? status : corrida.status;
      return corrida.save();
    })
    .then(result => {
      res.status(200).json({ message: "Corrida Atualizada", corrida: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

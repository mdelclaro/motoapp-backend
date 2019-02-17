const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;

const Corrida = require("../../models/corrida/");
const errorHandling = require("../../utils/error-handling/");

// Buscar Corridas
exports.getCorridas = (req, res, next) => {
  Corrida.find()
    .then(corridas => {
      if (!corridas) {
        error = errorHandling.createError("Nenhuma corrida encontrada.", 404);
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
  const idCorrida = req.params.idCorrida;
  if (!ObjectId.isValid(idCorrida)) {
    error = errorHandling.createError("ID invalido", 422);
    throw error;
  }
  console.log(idCorrida);
  Corrida.findById(idCorrida)
    .then(corrida => {
      if (!corrida) {
        error = errorHandling.createError("Nenhuma corrida encontrada.", 404);
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
    error = errorHandling.createError("Validation Failed", 422);
    throw error;
  }
  const origem = req.body.origem;
  const destino = req.body.destino;
  const distancia = req.body.distancia;
  const tempo = req.body.tempo;
  const idCliente = req.body.idCliente;
  const status = 0;

  const corrida = new Corrida({
    origem,
    destino,
    distancia,
    tempo,
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
    error = errorHandling.createError("Validation Failed", 422);
    throw error;
  }
  if (!req.body.status) {
    error = errorHandling.createError(
      "Required parameter (status) not provided",
      422
    );
    throw error;
  }

  const idCorrida = req.body.idCorrida;
  const idMotoqueiro = req.body.idMotoqueiro || null;
  const status = req.body.status || null;

  Corrida.findById(idCorrida)
    .then(corrida => {
      if (!corrida) {
        error = errorHandling.createError("Corrida nao encontrada", 422);
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

const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;

const Corrida = require("../../models/corrida/");
const Cliente = require("../../models/usuario/cliente/");
const errorHandling = require("../../utils/error-handling/");

// Buscar Corridas
exports.getCorridas = async (req, res, next) => {
  try {
    const corridas = await Corrida.find();
    if (!corridas) {
      error = errorHandling.createError("Nenhuma corrida encontrada.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", corridas });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Buscar Corrida por ID
exports.getCorrida = async (req, res, next) => {
  const idCorrida = req.params.idCorrida;

  if (!ObjectId.isValid(idCorrida)) {
    error = errorHandling.createError("ID invalido", 422);
    throw error;
  }

  try {
    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError("Nenhuma corrida encontrada.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", corrida });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Criar Corrida
exports.createCorrida = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    error = errorHandling.createError("Validation Failed", 422);
    throw error;
  }

  const origem = req.body.origem;
  const destino = req.body.destino;
  const distancia = req.body.distancia;
  const tempo = req.body.tempo;
  const idCliente = req.userId;
  const status = 0;

  const corrida = new Corrida({
    origem,
    destino,
    distancia,
    tempo,
    idCliente,
    status
  });

  try {
    await corrida.save();
    const cliente = await Cliente.findById(req.userId);
    cliente.corridas.push(corrida);
    await cliente.save();
    res.status(201).json({
      message: "Corrida criada com sucesso!",
      corrida,
      cliente: { _id: cliente._id, nome: cliente.nome }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Atualizar Corrida
exports.updateCorrida = async (req, res, next) => {
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

  const idCorrida = req.params.idCorrida;
  const idMotoqueiro = req.body.idMotoqueiro || null;
  const status = req.body.status || null;

  try {
    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError("Corrida nao encontrada", 404);
      throw error;
    }
    if (corrida.idCliente.toString() !== req.userId) {
      error = errorHandling.createError("Not authorized", 403);
      throw error;
    }
    corrida.idMotoqueiro = idMotoqueiro ? idMotoqueiro : corrida.idMotoqueiro;
    corrida.status = status ? status : corrida.status;
    const result = await corrida.save();
    res.status(200).json({ message: "Corrida Atualizada", corrida: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Deletar Corrida
exports.deleteCorrida = async (req, res, next) => {
  const idCorrida = req.params.idCorrida;
  if (!ObjectId.isValid(idCorrida)) {
    error = errorHandling.createError("ID invalido.", 422);
    throw error;
  }
  try {
    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError("Nenhuma corrida encontrada", 404);
      throw error;
    }
    if (corrida.idCliente.toString() !== req.userId) {
      error = errorHandling.createError("Not authorized", 403);
      throw error;
    }
    await Corrida.findByIdAndRemove(idCorrida);
    const cliente = await Cliente.findById(req.userId);
    cliente.corridas.pull(idCorrida);
    await cliente.save();
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

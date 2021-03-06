const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;

const { Avaliacao, Motoqueiro } = require("../models");
const { errorHandling } = require("../utils");

// Buscar Avaliacoes
exports.getAvaliacoes = async (req, res, next) => {
  try {
    const avaliacoes = await Avaliacao.find();
    if (!avaliacoes) {
      error = errorHandling.createError("Nenhuma avaliação encontrada.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", avaliacoes });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Buscar Avaliacao por ID
exports.getAvaliacao = async (req, res, next) => {
  try {
    const idAvaliacao = req.params.idAvaliacao;

    if (!ObjectId.isValid(idAvaliacao)) {
      error = errorHandling.createError("ID inválido", 422);
      throw error;
    }
    const avaliacao = await Avaliacao.findById(idAvaliacao);
    if (!avaliacao) {
      error = errorHandling.createError("Nenhuma avaliação encontrada.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", avaliacao });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Criar Avaliacao
exports.createAvaliacao = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422, errors);
      throw error;
    }

    const nota = req.body.nota;
    const comentario = req.body.comentario;
    const idMotoqueiro = req.body.idMotoqueiro;
    const idCliente = req.userId;

    const motoqueiro = await Motoqueiro.findById(idMotoqueiro);
    if (!motoqueiro) {
      error = errorHandling.createError(
        "Nenhum motoqueiro encontrado com esse ID",
        422
      );
      throw error;
    }

    const avaliacao = new Avaliacao({
      nota,
      comentario,
      idMotoqueiro,
      idCliente
    });

    await avaliacao.save();
    motoqueiro.avaliacoes.push(avaliacao);
    await motoqueiro.save();

    res.status(201).json({
      message: "Avaliação criada com sucesso!",
      avaliacao
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

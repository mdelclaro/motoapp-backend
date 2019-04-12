// Criar Avaliacao
const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;

const { Chat, Mensagem } = require("../models");
const { errorHandling } = require("../utils");

exports.createMensagem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422, errors);
      throw error;
    }

    const msg = req.body.mensagem;
    const idMotoqueiro = req.body.idMotoqueiro;
    const idCliente = req.body.idCliente;

    if (!ObjectId.isValid(idMotoqueiro) || !ObjectId.isValid(idCliente)) {
      error = errorHandling.createError("ID inválido", 422);
      throw error;
    }

    let chat = await Chat.findOne({ idMotoqueiro, idCliente });
    if (!chat) {
      chat = new Chat({
        idMotoqueiro,
        idCliente
      });

      await chat.save();
    }

    const mensagem = new Mensagem({
      mensagem: msg,
      idMotoqueiro,
      idCliente,
      chat: chat._id
    });

    await mensagem.save();
    chat.mensagens.push(mensagem);
    await chat.save();

    res.status(201).json({
      message: "Mensagem criada com sucesso!",
      chat
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

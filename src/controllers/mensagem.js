// Criar Avaliacao
const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;

const { Chat, Mensagem } = require("../models");
const { errorHandling, io } = require("../utils");

exports.createMensagem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422, errors);
      throw error;
    }

    const text = req.body.text;
    const idMotoqueiro = req.body.idMotoqueiro;
    const idCliente = req.body.idCliente;
    const sender = req.body.sender;

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
      text,
      sender,
      chat: chat._id,
      sent: true
    });

    await mensagem.save();
    chat.mensagens.push(mensagem);
    await chat.save();

    res.status(201).json({
      message: "Mensagem criada com sucesso!",
      mensagem
    });

    let socket = io.getIO();

    if (sender === idMotoqueiro) {
      socket.sockets.in(idCliente).emit("msgFromDriver", {
        mensagem
      });
    } else {
      socket.sockets.in(idMotoqueiro).emit("msgFromRider", {
        mensagem
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

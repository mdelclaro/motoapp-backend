const ObjectId = require("mongoose").Types.ObjectId;

const { Chat } = require("../models");
const { errorHandling } = require("../utils");

// Buscar Chats
exports.getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find();
    if (!chats) {
      error = errorHandling.createError("Nenhum chat encontrado.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", chats });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Buscar Chat por ID do Cliente
exports.getChatCliente = async (req, res, next) => {
  try {
    const idCliente = req.params.idCliente;
    const page = parseInt(req.query.page);
    const skip = parseInt(req.query.skip) || 0;

    if (!ObjectId.isValid(idCliente)) {
      error = errorHandling.createError("ID inválido", 422);
      throw error;
    }

    let chat = await Chat.find({ idCliente });
    let count = [];
    chat.forEach((c, index) => {
      count.push(c.mensagens.length);
    });
    chat = await Chat.find({ idCliente })
      .populate({
        path: "mensagens",
        options: {
          limit: 20,
          skip: page * 20 + skip,
          sort: { createdAt: -1 }
        }
      })
      .populate("idMotoqueiro", ["nome", "imgPerfil"])
      .select("+createdAt");
    if (!chat) {
      error = errorHandling.createError("Nenhum chat encontrado.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", chat, count });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Buscar Chat por ID do Cliente
exports.getChatMotoqueiro = async (req, res, next) => {
  try {
    const idMotoqueiro = req.params.idMotoqueiro;
    const page = parseInt(req.query.page);
    const skip = parseInt(req.query.skip) || 0;

    if (!ObjectId.isValid(idMotoqueiro)) {
      error = errorHandling.createError("ID inválido", 422);
      throw error;
    }

    let chat = await Chat.find({ idMotoqueiro });
    let count = [];
    chat.forEach((c, index) => {
      count.push(c.mensagens.length);
    });
    chat = await Chat.find({ idMotoqueiro })
      .populate({
        path: "mensagens",
        options: {
          limit: 12,
          skip: page * 12 + skip,
          sort: { createdAt: -1 }
        }
      })
      .populate("idCliente", ["nome", "imgPerfil"])
      .select("+createdAt");
    if (!chat) {
      error = errorHandling.createError("Nenhum chat encontrado.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", chat, count });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const { Cliente } = require("../models");
const { errorHandling } = require("../utils");

// Buscar Clientes
exports.getClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.find();
    if (!clientes) {
      error = errorHandling.createError("Nenhum cliente encontrado.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", clientes });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Buscar Cliente por ID
exports.getCliente = async (req, res, next) => {
  try {
    const idCliente = req.params.idCliente;
    if (!ObjectId.isValid(idCliente)) {
      error = errorHandling.createError("ID invalido.", 422);
      throw error;
    }
    const cliente = await Cliente.findById(idCliente).populate({
      path: "corridas",
      match: { status: [3, 4] },
      populate: { path: "idMotoqueiro", select: ["nome", "sobrenome"] }
    });
    if (!cliente) {
      error = errorHandling.createError("Nenhum cliente encontrado.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", cliente });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Criar Cliente
exports.createCliente = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422, errors);
      throw error;
    }

    const nome = req.body.nome;
    const sobrenome = req.body.sobrenome;
    const email = req.body.email;
    const senha = await bcrypt.hash(req.body.senha, 10);

    const hasCliente = await Cliente.findOne({ email });
    if (hasCliente) {
      error = errorHandling.createError("E-mail em uso", 422);
      throw error;
    }

    const cliente = new Cliente({
      nome,
      sobrenome,
      email,
      senha,
      status: 1
    });

    const result = await cliente.save();
    res.status(201).json({
      message: "Cliente criado com sucesso!",
      cliente: {
        _id: result._id,
        nome: result.nome,
        sobrenome: result.sobrenome,
        email: result.email,
        status: result.status
      }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Atualizar Cliente
exports.updateCliente = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422, errors);
      throw error;
    }

    const idCliente = req.params.idCliente;
    const email = req.body.email;
    const senha = req.body.senha;
    const imgPerfil = req.files.imgPerfil ? req.files.imgPerfil[0].path : null;

    if (!ObjectId.isValid(idCliente)) {
      error = errorHandling.createError("ID inválido.", 422);
      throw error;
    }

    if (idCliente !== req.userId) {
      error = errorHandling.createError("Não autorizado", 403);
      throw error;
    }

    const cliente = await Cliente.findById(idCliente);
    if (!cliente) {
      error = errorHandling.createError("Cliente não encontrado.", 404);
      throw error;
    }

    // altera email
    if (email) {
      const hasCliente = await Cliente.findOne({ email });
      if (hasCliente) {
        error = errorHandling.createError("E-mail em uso", 422);
        throw error;
      }
      cliente.email = email;
    }

    // altera senha
    if (senha) {
      cliente.senha = await bcrypt.hash(senha, 10);
    }

    // altera img de perfil
    if (imgPerfil) {
      if (cliente.imgPerfil) {
        const pathImg = path.resolve() + path.sep + cliente.imgPerfil;
        if (fs.existsSync(pathImg)) {
          await fs.unlinkSync(pathImg);
        }
      }
      cliente.imgPerfil = imgPerfil;
    }

    const result = await cliente.save();
    res.status(200).json({
      message: "Cliente atualizado",
      cliente: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

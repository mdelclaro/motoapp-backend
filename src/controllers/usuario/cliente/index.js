const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");

const Cliente = require("../../../models/usuario/cliente/");
const errorHandling = require("../../../utils/error-handling/");

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
    const cliente = await Cliente.findById(idCliente);
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
      senha
    });

    const result = await cliente.save();
    res.status(201).json({
      message: "Cliente criado com sucesso!",
      cliente: result
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
    const imgPerfil = req.files.imgPerfil[0].path;

    if (email) {
      const hasCliente = await Cliente.findOne({ email });
      if (hasCliente) {
        error = errorHandling.createError("E-mail em uso", 422);
        throw error;
      }
    }

    if (!ObjectId.isValid(idCliente)) {
      error = errorHandling.createError("ID inválido.", 422);
      throw error;
    }

    const cliente = await Cliente.findById(idCliente);
    if (!cliente) {
      error = errorHandling.createError("Cliente não encontrado.", 404);
      throw error;
    }
    // altera email
    cliente.email = email ? email : cliente.email;
    // altera img perfil
    cliente.imgPerfil = imgPerfil ? imgPerfil : cliente.imgPerfil;

    // altera senha
    if (senha) {
      cliente.senha = await bcrypt.hash(senha, 10);
    }

    const result = await cliente.save();
    res.status(200).json({ message: "Cliente atualizado", cliente: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

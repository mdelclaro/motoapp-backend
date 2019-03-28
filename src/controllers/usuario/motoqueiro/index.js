const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");

const Motoqueiro = require("../../../models/usuario/motoqueiro/");
const errorHandling = require("../../../utils/error-handling/");

// Buscar Motoqueiros
exports.getMotoqueiros = async (req, res, next) => {
  try {
    const motoqueiros = await Motoqueiro.find();
    if (!motoqueiros) {
      error = errorHandling.createError("Nenhum motoqueiro encontrado.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", motoqueiros });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Buscar Motoqueiro por ID
exports.getMotoqueiro = async (req, res, next) => {
  try {
    const idMotoqueiro = req.params.idMotoqueiro;
    if (!ObjectId.isValid(idMotoqueiro)) {
      error = errorHandling.createError("ID inválido.", 422);
      throw error;
    }
    const motoqueiro = await Motoqueiro.findById(idMotoqueiro);
    if (!motoqueiro) {
      error = errorHandling.createError("Nenhum motoqueiro encontrado.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", motoqueiro });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Criar Motoqueiro
exports.createMotoqueiro = async (req, res, next) => {
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

    const hasMotoqueiro = await Motoqueiro.findOne({ email });
    if (hasMotoqueiro) {
      error = errorHandling.createError("E-mail em uso", 422);
      throw error;
    }

    const motoqueiro = new Motoqueiro({
      nome,
      sobrenome,
      email,
      senha,
      status: 0
    });
    const result = await motoqueiro.save();
    res.status(201).json({
      message: "Motoqueiro criado com sucesso!",
      motoqueiro: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Atualizar Motoqueiro
exports.updateMotoqueiro = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422, errors);
      throw error;
    }

    const idMotoqueiro = req.params.idMotoqueiro;
    const email = req.body.email;
    const senha = req.body.senha;
    const moto = req.body.moto;
    const placa = req.body.placa;
    const imgPerfil = req.files.imgPerfil ? req.files.imgPerfil[0].path : null;
    const cnh1 = req.files.cnh1 ? req.files.cnh1[0].path : null;
    const cnh2 = req.files.cnh2 ? req.files.cnh2[0].path : null;

    if (!ObjectId.isValid(idMotoqueiro)) {
      error = errorHandling.createError("ID inválido.", 422);
      throw error;
    }

    if (email) {
      const hasMotoqueiro = await Motoqueiro.findOne({ email });
      if (hasMotoqueiro) {
        error = errorHandling.createError("E-mail em uso", 422);
        throw error;
      }
    }

    const motoqueiro = await Motoqueiro.findById(idMotoqueiro);
    if (!motoqueiro) {
      error = errorHandling.createError("Motoqueiro não encontrado.", 404);
      throw error;
    }

    // altera email
    motoqueiro.email = email ? email : motoqueiro.email;

    // altera senha
    if (senha) {
      motoqueiro.senha = await bcrypt.hash(senha, 10);
    }

    // altera img perfil, placa e moto
    motoqueiro.moto = moto ? moto : motoqueiro.moto;
    motoqueiro.placa = placa ? placa : motoqueiro.placa;
    motoqueiro.imgPerfil = imgPerfil ? imgPerfil : motoqueiro.imgPerfil;

    // altera cnh e status para ativo
    if (cnh1 && cnh2) {
      motoqueiro.cnh1 = cnh1;
      motoqueiro.cnh2 = cnh2;
      motoqueiro.status = 1;
    }

    const result = await motoqueiro.save();
    res
      .status(200)
      .json({ message: "Motoqueiro atualizado", motoqueiro: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

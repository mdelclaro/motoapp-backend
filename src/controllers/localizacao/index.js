const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;

const io = require("../../utils/socket/");

const MotoqueiroLocation = require("../../models/localizacao/");
const errorHandling = require("../../utils/error-handling/");

// Buscar Locations de motoqueiros
exports.getMotoqueiroLocations = async (req, res, next) => {
  try {
    const locations = await MotoqueiroLocation.find();
    if (!locations) {
      error = errorHandling.createError("Nenhuma localização encontrada.", 404);
      throw error;
    }
    res.status(200).json({ message: "Sucesso", locations });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Buscar Location de um motoqueiro
exports.getMotoqueiroLocation = async (req, res, next) => {
  try {
    const idMotoqueiro = req.params.idMotoqueiro;

    if (!ObjectId.isValid(idMotoqueiro)) {
      error = errorHandling.createError("ID inválido", 422);
      throw error;
    }

    const location = await MotoqueiroLocation.findOne({ idMotoqueiro });
    if (!location) {
      error = errorHandling.createError(
        "Localização do motoqueiro não encontrada.",
        404
      );
      throw error;
    }
    res.status(200).json({ message: "Sucesso", location });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Cria localizacao do motoqueiro
exports.createMotoqueiroLocation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422);
      throw error;
    }

    const location = req.body.location;
    const idMotoqueiro = req.body.idMotoqueiro;

    const motoqueiroLocation = new MotoqueiroLocation({
      idMotoqueiro,
      location
    });

    const result = await motoqueiroLocation.save();

    io.getIO().emit("motoqueiroLocation", {
      action: "create",
      motoqueiroLocation
    });

    res.status(201).json({
      message: "Localização criada com sucesso!",
      motoqueiroLocation: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Atualizar motoqueiro location
exports.updateMotoqueiroLocation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422);
      throw error;
    }

    const location = req.body.location;
    const idMotoqueiro = req.params.idMotoqueiro;

    const motoqueiroLocation = await MotoqueiroLocation.findOne({
      idMotoqueiro
    });
    if (!motoqueiroLocation) {
      error = errorHandling.createError("Localização não encontrada", 404);
      throw error;
    }

    motoqueiroLocation.location = location;

    const result = await motoqueiroLocation.save();

    let socket = io.getIO();
    socket.sockets.in(idMotoqueiro).emit("locationChanged", {
      coords: location
      // duration: duration.duration.value
    });

    res
      .status(200)
      .json({ message: "Location atualizada", motoqueiroLocation: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

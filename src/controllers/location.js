const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;

const { io, errorHandling } = require("../utils");
const { Location } = require("../models");

// Buscar Locations de motoqueiros
exports.getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find();
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
exports.getLocation = async (req, res, next) => {
  try {
    const idMotoqueiro = req.params.idMotoqueiro;

    if (!ObjectId.isValid(idMotoqueiro)) {
      error = errorHandling.createError("ID inválido", 422);
      throw error;
    }

    const location = await Location.findOne({ idMotoqueiro });
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

// Cria/Atualiza localizacao do motoqueiro
exports.createLocation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422, errors);
      throw error;
    }

    const motoqueiroLocation = req.body.location;
    const idMotoqueiro = req.body.idMotoqueiro;
    let socket = io.getIO();

    if (!ObjectId.isValid(idMotoqueiro)) {
      error = errorHandling.createError("ID inválido", 422);
      throw error;
    }

    if (idMotoqueiro !== req.userId) {
      error = errorHandling.createError("Não autorizado", 403);
      throw error;
    }

    const location = await Location.findOne({
      idMotoqueiro
    });
    if (!location) {
      const location = new Location({
        idMotoqueiro,
        location: motoqueiroLocation
      });

      const result = await location.save();
      res.status(201).json({
        message: "Localização criada com sucesso!",
        location: result
      });
    } else {
      location.set(req.body);
      const result = await location.save();

      socket.sockets.in(idMotoqueiro).emit("locationChanged", {
        coords: location
      });

      res.status(200).json({
        message: "Localização atualizada",
        location: result
      });
    }

    // atualizar as coordenadas do motoqueiro no socket
    const drivers = socket.of("/drivers").connected;
    let driversList = [];

    if (Object.keys(drivers).length > 0) {
      for (let key in drivers) {
        if (drivers[key].userId === idMotoqueiro) {
          socket.of("/drivers").connected[key].coords = motoqueiroLocation;
        }
        driversList.push({
          userId: socket.of("/drivers").connected[key].userId,
          coords: socket.of("/drivers").connected[key].coords
        });
      }
      socket.sockets.emit("fetchMotoqueiros", {
        motoqueiros: driversList
      });
    }
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Atualizar motoqueiro location
// exports.updateLocation = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       error = errorHandling.createError("Validation Failed", 422);
//       throw error;
//     }

//     const location = req.body.location;
//     const idMotoqueiro = req.params.idMotoqueiro;

//     if (!ObjectId.isValid(idMotoqueiro)) {
//       error = errorHandling.createError("ID inválido", 422);
//       throw error;
//     }

//     const location = await Location.findOne({
//       idMotoqueiro
//     });
//     if (!location) {
//       error = errorHandling.createError("Localização não encontrada", 404);
//       throw error;
//     }

//     location.location = location;

//     const result = await location.save();

//     let socket = io.getIO();
//     socket.sockets.in(idMotoqueiro).emit("locationChanged", {
//       coords: location
//       // duration: duration.duration.value
//     });

//     res
//       .status(200)
//       .json({ message: "Location atualizada", location: result });
//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     next(err);
//   }
// };

const { validationResult } = require("express-validator/check");
const ObjectId = require("mongoose").Types.ObjectId;
const geolib = require("geolib");
const quickSort = require("@charlesstover/quicksort").default;

const io = require("../../utils/socket/");
const mapsClient = require("../../utils/google-maps/");

const Corrida = require("../../models/corrida/");
const Cliente = require("../../models/usuario/cliente/");
const Motoqueiro = require("../../models/usuario/motoqueiro/");
const MotoqueiroLocation = require("../../models/localizacao/");
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
  try {
    const idCorrida = req.params.idCorrida;

    if (!ObjectId.isValid(idCorrida)) {
      error = errorHandling.createError("ID invalido", 422);
      throw error;
    }
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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError(
        "Validation Failed (createCorrida)",
        422
      );
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
    await corrida.save();
    const cliente = await Cliente.findById(idCliente);
    cliente.corridas.push(corrida);
    await cliente.save();

    //io.getIO().emit("corrida", { action: "create", corrida });
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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422);
      throw error;
    }

    const idCorrida = req.params.idCorrida;
    const idMotoqueiro = req.body.idMotoqueiro || null;
    const status = req.body.status;
    const userId = req.userId;

    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError("Corrida nao encontrada", 404);
      throw error;
    }

    corrida.idMotoqueiro = idMotoqueiro ? idMotoqueiro : corrida.idMotoqueiro;
    corrida.status = status;

    const idCliente = corrida.idCliente.toString();
    const result = await corrida.save();

    if (idMotoqueiro) {
      const motoqueiro = await Motoqueiro.findById(idMotoqueiro);
      if (!motoqueiro) {
        error = errorHandling.createError("Id motoqueiro invalido.", 404);
        throw error;
      }

      // salva a corrida no motoqueiro
      motoqueiro.corridas.push(corrida);
      await motoqueiro.save();

      const location = await MotoqueiroLocation.findOne({ idMotoqueiro });
      if (!location) {
        error = errorHandling.createError(
          "Localizacao do motoqueiro nao encontrada.",
          404
        );
        throw error;
      }
      // montar objeto de origem e destino
      // para calcular duracao do motoqueiro ate cliente
      const origin = {
        lat: corrida.origem.lat,
        lng: corrida.origem.long
      };
      const destination = {
        lat: location.location.lat,
        lng: location.location.long
      };
      const duration = await mapsClient.getDistanceTime(origin, destination);
      if (!duration) {
        error = errorHandling.createError("Erro ao calcular duração", 422);
        throw error;
      }
      let socket = io.getIO();
      socket.sockets.in(idCliente).emit("acceptCorrida", {
        motoqueiro,
        coords: location.location,
        duration: duration.duration.value
      });
    }

    // motoqueiro chegou, iniciar viagem
    if (status == 2) {
      if (userId !== corrida.idMotoqueiro.toString()) {
        error = errorHandling.createError("ACL Error", 401);
        throw error;
      }
      let socket = io.getIO();
      socket.sockets.in(idCliente).emit("startCorrida");
    }

    // fim da corrida
    if (status == 3) {
      if (userId !== corrida.idMotoqueiro.toString()) {
        error = errorHandling.createError("ACL Error", 401);
        throw error;
      }
      let socket = io.getIO();
      socket.sockets.in(idCliente).emit("finishCorrida");
    }

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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      error = errorHandling.createError("Validation Failed", 422);
      throw error;
    }
    const idCorrida = req.params.idCorrida;
    if (!ObjectId.isValid(idCorrida)) {
      error = errorHandling.createError("ID invalido.", 422);
      throw error;
    }
    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError("Nenhuma corrida encontrada", 404);
      throw error;
    }
    if (corrida.idCliente.toString() !== req.userId) {
      error = errorHandling.createError("Not authorized", 403);
      throw error;
    }
    if (!corrida.idMotoqueiro) {
      await Corrida.findByIdAndRemove(idCorrida);
      const cliente = await Cliente.findById(req.userId);
      cliente.corridas.pull(idCorrida);
      await cliente.save();
      res.status(200).json({ message: "Deleted" });
    } else {
      error = errorHandling.createError("Esta corrida já foi aceita!", 422);
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

exports.handleDispatch = async (req, res, next) => {
  const idCorrida = req.body.idCorrida;

  if (!ObjectId.isValid(idCorrida)) {
    error = errorHandling.createError("ID invalido", 422);
    throw error;
  }
  const corrida = await Corrida.findById(idCorrida);
  if (!corrida) {
    error = errorHandling.createError("Nenhuma corrida encontrada.", 404);
    throw error;
  }
  const originCoordinates = {
    latitude: parseFloat(corrida.origem.lat),
    longitude: parseFloat(corrida.origem.long)
  };

  //motoqueiros conectados
  let socket = io.getIO();
  const drivers = socket.of("/drivers").connected;

  console.log(socket.engine.clientsCount);
  if (socket.engine.clientsCount > 0) {
    let distances = [];

    //popular as distancias
    for (let key in drivers) {
      const idMotoqueiro = drivers[key].userId;
      const location = await MotoqueiroLocation.findOne({
        idMotoqueiro
      });
      if (!location) {
        error = errorHandling.createError(
          "Localizacao do motoqueiro nao encontrada.",
          404
        );
        //throw error;
      } else {
        const driverCoordinates = {
          latitude: parseFloat(location.location.lat),
          longitude: parseFloat(location.location.long)
        };
        const distance = geolib.getDistance(
          driverCoordinates,
          originCoordinates,
          1
        );
        console.log(distance);
        distances.push({ userId: idMotoqueiro, distance });
      }
    }
    //comparador para o quickSort
    const comparator = (a, b) => {
      if (a.distance < b.distance) {
        return -1;
      }
      if (a.distance > b.distance) {
        return 1;
      }
      return 0;
    };

    distances[0].distance = 13000;
    distances[1].distance = 14000;

    //array de drivers ordenado por distancia do request
    const sorted = quickSort(distances, comparator);

    //mandar para os drivers em order de distancia
    for (let key in sorted) {
      console.log(sorted[key].distance);
    }
  } else {
    res.status(422).json({
      message: "Nenhum motoqueiro disponível :("
    });
  }
};

const { validationResult } = require('express-validator/check');
const ObjectId = require('mongoose').Types.ObjectId;
const geolib = require('geolib');
const quickSort = require('@charlesstover/quicksort').default;

const { io, mapsClient, errorHandling } = require('../utils');
const { Corrida, Cliente, Motoqueiro, Location } = require('../models/');

// Buscar Corridas
exports.getCorridas = async (req, res, next) => {
  try {
    const corridas = await Corrida.find();
    if (!corridas) {
      error = errorHandling.createError('Nenhuma corrida encontrada.', 404);
      throw error;
    }
    res.status(200).json({ message: 'Sucesso', corridas });
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
      error = errorHandling.createError('ID inválido', 422);
      throw error;
    }
    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError('Nenhuma corrida encontrada.', 404);
      throw error;
    }
    res.status(200).json({ message: 'Sucesso', corrida });
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
        'Validation Failed (createCorrida)',
        422
      );
      throw error;
    }

    const origem = req.body.origem;
    const destino = req.body.destino;
    const distancia = req.body.distancia;
    const tempo = req.body.tempo;
    const idCliente = req.userId;
    // const idCliente = req.body.idCliente;
    const status = 0;

    //calcular valor
    let valor;
    if (tempo < 7) {
      valor = 5;
    } else if (tempo > 7 && tempo < 13) {
      valor = 6;
    } else if (tempo > 13 && tempo < 18) {
      valor = 7;
    } else if (tempo > 18) {
    }

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

    res.status(201).json({
      message: 'Corrida criada com sucesso!',
      corrida
    });
    handleDispatch(corrida, cliente);
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
      error = errorHandling.createError('Validation Failed', 422);
      throw error;
    }

    const idCorrida = req.params.idCorrida;
    const idMotoqueiro = req.body.idMotoqueiro || null;
    const status = req.body.status;
    const userId = req.userId;

    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError('Corrida não encontrada', 404);
      throw error;
    }

    const idCliente = corrida.idCliente.toString();

    // if (idCliente !== userId) {
    //   error = errorHandling.createError("Não autorizado", 403);
    //   throw error;
    // }

    corrida.idMotoqueiro = idMotoqueiro ? idMotoqueiro : corrida.idMotoqueiro;
    corrida.status = status;

    const result = await corrida.save();

    if (idMotoqueiro) {
      const motoqueiro = await Motoqueiro.findById(idMotoqueiro);
      if (!motoqueiro) {
        error = errorHandling.createError('Id motoqueiro inválido.', 404);
        throw error;
      }

      // salva a corrida no motoqueiro
      motoqueiro.corridas.push(corrida);
      await motoqueiro.save();

      const location = await Location.findOne({ idMotoqueiro });
      if (!location) {
        error = errorHandling.createError(
          'Localização do motoqueiro não encontrada.',
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
        error = errorHandling.createError('Erro ao calcular duração', 422);
        throw error;
      }
      let socket = io.getIO();
      socket.sockets.in(idCliente).emit('acceptCorrida', {
        motoqueiro,
        coords: location.location,
        duration: duration.duration.value
      });
    }

    // motoqueiro chegou, iniciar viagem
    if (status == 2) {
      if (userId !== corrida.idMotoqueiro.toString()) {
        error = errorHandling.createError('ACL error', 401);
        throw error;
      }
      let socket = io.getIO();
      socket.sockets.in(idCliente).emit('startCorrida');
    }

    // fim da corrida
    if (status == 3) {
      if (userId !== corrida.idMotoqueiro.toString()) {
        error = errorHandling.createError('ACL error', 401);
        throw error;
      }
      let socket = io.getIO();
      socket.sockets.in(idCliente).emit('finishCorrida');
    }

    res.status(200).json({ message: 'Corrida atualizada', corrida: result });
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
      error = errorHandling.createError('Validation Failed', 422);
      throw error;
    }
    const idCorrida = req.params.idCorrida;
    if (!ObjectId.isValid(idCorrida)) {
      error = errorHandling.createError('ID inválido.', 422);
      throw error;
    }
    const corrida = await Corrida.findById(idCorrida);
    if (!corrida) {
      error = errorHandling.createError('Nenhuma corrida encontrada', 404);
      throw error;
    }
    if (corrida.idCliente.toString() !== req.userId) {
      error = errorHandling.createError('Não autorizado', 403);
      throw error;
    }
    if (!corrida.idMotoqueiro) {
      await Corrida.findOneAndDelete(idCorrida);
      const cliente = await Cliente.findById(req.userId);
      cliente.corridas.pull(idCorrida);
      await cliente.save();
      res.status(200).json({ message: 'Deletado' });
    } else {
      error = errorHandling.createError('Esta corrida já foi aceita!', 422);
      throw error;
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

async function handleDispatch(corrida, cliente) {
  try {
    const originCoordinates = {
      latitude: parseFloat(corrida.origem.lat),
      longitude: parseFloat(corrida.origem.long)
    };

    //motoqueiros conectados
    let socket = io.getIO();
    const drivers = socket.of('/drivers').connected;
    if (socket.engine.clientsCount > 0) {
      let distances = [];

      //popular as distancias
      for (let key in drivers) {
        const socket = drivers[key];
        const idMotoqueiro = drivers[key].userId;
        const location = await Location.findOne({
          idMotoqueiro
        });
        if (!location) {
          error = errorHandling.createError(
            'Localização do motoqueiro não encontrada.',
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
          distances.push({ userId: idMotoqueiro, distance, socket });
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

      //testing purposes
      // distances[0].distance = 13000;
      // distances[1].distance = 14000;

      //array de drivers ordenado por distancia do request
      const sorted = quickSort(distances, comparator);

      //mandar para os drivers em order de distancia
      let accepted = false;
      for (let key in sorted) {
        try {
          const reply = await handleSocket(
            sorted[key].socket,
            corrida,
            sorted[key].distance,
            cliente
          );
          if (reply) {
            accepted = true;
            break;
          }
        } catch (e) {
          console.log(e);
          continue;
        }
      }
      // caso não haja nenhum motoqueiro disponível, cancelar a corrida
      if (!accepted) {
        socket.sockets.in(corrida.idCliente).emit('cancelCorrida');
        return;
      }
    } else {
      socket.sockets.in(corrida.idCliente).emit('cancelCorrida');
    }
  } catch (err) {
    console.log(err);
  }
}

function handleSocket(socket, corrida, distance, cliente) {
  return new Promise((resolve, reject) => {
    socket.emit('dispatch', { corrida, distance, cliente }, reply => {
      console.log(reply);
      if (reply === 'accept') {
        resolve(true);
      } else if (reply === 'reject') {
        reject();
      }
    });
  });
}

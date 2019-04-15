const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const uuidv4 = require("uuid/v4");
const morgan = require("morgan");
require("dotenv").config();

const { mongodbUrl } = require("./src/utils/config");

// Rotas
const {
  corridaRoutes,
  clienteRoutes,
  motoqueiroRoutes,
  motoqueiroLocationRoutes,
  avaliacaoRoutes,
  authRoute,
  chatRoute,
  mensagemRoute
} = require("./src/routes");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + ".png");
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// image upload
app.use(
  multer({ storage, fileFilter }).fields([
    { name: "imgPerfil" },
    { name: "cnh1" },
    { name: "cnh2" }
  ])
);

// Servir imagens
app.use(
  "/images",
  express.static(path.join(__dirname, "images"), { fallthrough: true })
);

// Imagem não encontrada
app.get("/images*", (req, res) => {
  res
    .status(200)
    .sendFile(path.resolve() + path.sep + "images" + path.sep + "avatar.png");
});

// Rotas
app.use("/v1/corrida", corridaRoutes);
app.use("/v1/usuario/cliente", clienteRoutes);
app.use("/v1/usuario/motoqueiro", motoqueiroRoutes);
app.use("/v1/location", motoqueiroLocationRoutes);
app.use("/v1/avaliacao", avaliacaoRoutes);
app.use("/v1/auth", authRoute);
app.use("/v1/chat", chatRoute);
app.use("/v1/mensagem", mensagemRoute);

// tratamento de erros
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

app.use((req, res) => {
  res.status(404).json({ message: "URL inválida" });
});

// mongoDB && init server
mongoose
  .connect(mongodbUrl, { useNewUrlParser: true })
  .then(() => {
    const server = app.listen(8080);
    const io = require("./src/utils/socket").init(server);

    //clientes
    io.sockets.on("connection", socket => {
      socket.on("join", data => {
        socket.join(data.id);
      });
      socket.on("disconnect", () => {
        socket.removeAllListeners();
      });

      // mandar lista de motoqueiros quando se conectar
      const drivers = io.of("/drivers").connected;
      let driversList = [];
      if (Object.keys(drivers).length > 0) {
        for (let key in drivers) {
          driversList.push({
            userId: drivers[key].userId,
            coords: drivers[key].coords
          });
        }
        io.sockets.emit("fetchMotoqueiros", {
          motoqueiros: driversList
        });
      }
    });
    //drivers
    io.of("/drivers").on("connection", socket => {
      socket.on("join", data => {
        socket.userId = data.id.toString();
        socket.coords = data.coords;
        socket.join(socket.userId);
      });
      socket.on("disconnect", () => {
        socket.removeAllListeners();
      });
    });
  })
  .catch(err => console.log("Erro mongoDB: " + err));

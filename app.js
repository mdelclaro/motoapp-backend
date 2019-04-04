const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const uuidv4 = require("uuid/v4");
require("dotenv").config();

const { mongoPwd } = require("./src/config");

// Rotas
const corridaRoutes = require("./src/routes/corrida/");
const clienteRoutes = require("./src/routes/usuario/cliente/");
const motoqueiroRoutes = require("./src/routes/usuario/motoqueiro/");
const motoqueiroLocationRoutes = require("./src/routes/location/");
const avaliacaoRoutes = require("./src/routes/avaliacao/");
const authRoute = require("./src/routes/auth/");

const app = express();

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

// Add cors headers
app.use(cors());

// bodyParser dos requests
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
app.use("/motoapp/v1/corrida", corridaRoutes);
app.use("/motoapp/v1/usuario/cliente", clienteRoutes);
app.use("/motoapp/v1/usuario/motoqueiro", motoqueiroRoutes);
app.use("/motoapp/v1/localizacao", motoqueiroLocationRoutes);
app.use("/motoapp/v1/avaliacao", avaliacaoRoutes);
app.use("/motoapp/v1/auth", authRoute);

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
  .connect(
    `mongodb+srv://mdelclaro:${mongoPwd}@cluster0-jjfdi.mongodb.net/motoapp?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    const server = app.listen(8080);
    const io = require("./src/utils/socket/").init(server);

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

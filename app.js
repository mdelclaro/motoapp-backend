const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
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

// Add cors headers
app.use(cors());

// bodyParser dos requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
  res.status(404).json({ message: "Invalid URL" });
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

    //all users
    io.sockets.on("connection", socket => {
      //clients
      socket.on("join", data => {
        // console.log("Client joined: " + data.id);
        socket.join(data.id);
      });
      //drivers
      io.of("/drivers").on("connection", socket => {
        socket.on("join", data => {
          // console.log("Driver joined: " + data.id);
          socket.userId = data.id.toString();
          socket.join(socket.userId);
        });
      });
    });
  })
  .catch(err => console.log("erro mongo: " + err));

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Rotas
const corridaRoutes = require("./src/routes/corrida/");
const clienteRoutes = require("./src/routes/usuario/cliente/");
const motoqueiroRoutes = require("./src/routes/usuario/motoqueiro/");
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

// mongoDB
mongoose
  .connect(
    "mongodb+srv://mdelclaro:Copp1234@cluster0-jjfdi.mongodb.net/motoapp?retryWrites=true",
    { useNewUrlParser: true }
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log("erro mongo: " + err));

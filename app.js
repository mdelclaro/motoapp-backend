const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Rotas
const corridaRoutes = require("./src/routes/corrida");

const app = express();

// Add cors headers
app.use(cors());

// bodyParser dos requests
app.use(bodyParser.json());

// Rotas
app.use("/motoapp", corridaRoutes);

// tratamento de erros
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
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
  .catch(err => console.log("erro: " + err));

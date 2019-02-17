const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const motoqueiroSchema = new Schema(
  {
    nome: {
      type: String,
      required: true
    },
    sobrenome: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    senha: {
      type: String,
      required: true
    },
    cnh: {
      type: String,
      required: true
    },
    placa: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Motoqueiro", motoqueiroSchema);

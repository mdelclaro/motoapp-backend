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
    cnh1: {
      type: String,
      required: false
    },
    cnh2: {
      type: String,
      required: false
    },
    moto: {
      type: String,
      required: false
    },
    placa: {
      type: String,
      required: false
    },
    corridas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Corrida"
      }
    ],
    avaliacoes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Avaliacao"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Motoqueiro", motoqueiroSchema);

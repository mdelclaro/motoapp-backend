const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clienteSchema = new Schema(
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
    corridas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Corrida"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cliente", clienteSchema);

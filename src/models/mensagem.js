const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mensagemSchema = new mongoose.Schema(
  {
    mensagem: {
      type: String,
      required: true
    },
    idMotoqueiro: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Motoqueiro"
    },
    idCliente: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Cliente"
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    }
  },
  { collection: "mensagens" },
  { timestamps: true }
);

module.exports = mongoose.model("Mensagem", mensagemSchema);

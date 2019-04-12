const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new mongoose.Schema(
  {
    idMotoqueiro: {
      type: Schema.Types.ObjectId,
      ref: "Motoqueiro",
      required: true
    },
    idCliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true
    },
    mensagens: [
      {
        type: Schema.Types.ObjectId,
        ref: "Mensagem"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);

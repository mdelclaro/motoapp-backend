const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mensagemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    },
    sent: {
      type: Boolean,
      required: true
    }
  },
  { collection: "mensagens", timestamps: true }
);

module.exports = mongoose.model("Mensagem", mensagemSchema);

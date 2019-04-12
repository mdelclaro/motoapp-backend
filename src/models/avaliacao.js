const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const avaliacaoSchema = new Schema(
  {
    nota: {
      type: Number,
      required: true
    },
    comentario: {
      type: String,
      required: false
    },
    idCliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true
    },
    idMotoqueiro: {
      type: Schema.Types.ObjectId,
      ref: "Motoqueiro",
      required: true
    }
  },
  { collection: "avaliacao" },
  { timestamps: true }
);

module.exports = mongoose.model("Avaliacao", avaliacaoSchema);
